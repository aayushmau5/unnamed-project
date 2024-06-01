if (
  typeof self === "object" &&
  self.constructor.name === "ServiceWorkerGlobalScope"
) {
  importScripts("phoenix.min.js");
}

let socket = null;
let channel = null;
let presence = null;
let isConnected = false;
let browserId = null;

const browserName = "<browser_placeholder>";

// on init
chrome.runtime.onInstalled.addListener(async () => {
  const info = await chrome.runtime.getPlatformInfo();
  browserId = `${browserName}_${info.os}`;
  connectSocketAndJoinChannel();
});

// alarms
chrome.alarms.create("check-connection", {
  delayInMinutes: 0.1,
  periodInMinutes: 0.1,
});

chrome.alarms.create("sync-tabs", {
  delayInMinutes: 0,
  periodInMinutes: 0.2,
});

// handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "check-connection") {
    if (socket) isConnected = socket.isConnected();
    console.log({ isConnected });
  } else if (alarm.name === "sync-tabs") {
    // handle the state where socket isn't connected(edge case) before the status is updated
    if (isConnected) {
      getTabs().then((tabs) => {
        channel.push("tabs", { tabs });
      });
    }
  }
});

// handle messages from main/foreground script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  const { type, _response } = message;
  switch (type) {
    case "get-socket-state":
      return returnSocketState();
    case "get-tabs":
      return handleGetTabs();
    case "bookmark-current-tab":
      return bookmarkCurrentTab();
    case "get-connected-clients":
      return getConnectedClients();
    case "socket-connection":
      return toggleConnection();
  }
});

function returnSocketState() {
  sendMessage("connection-state", { isConnected });
}

function handleGetTabs() {
  if (!isConnected) return;

  channel
    .push("get-tabs", {})
    .receive("ok", (payload) => sendMessage("tabs-response", payload))
    .receive("error", (err) => console.log("phoenix errored", err))
    .receive("timeout", () => console.log("timed out pushing"));
}

async function bookmarkCurrentTab() {
  const messageType = "bookmark-response";
  const tab = await getCurrentTab();
  if (tab && isConnected) {
    channel
      .push("bookmark-tab", { url: tab.url, title: tab.title })
      .receive("ok", (data) => {
        if (data.status === "ok") return sendMessage(messageType, true);
        sendMessage(messageType, false);
      })
      .receive("error", (err) => {
        console.error(err);
        sendMessage(messageType, false);
      });
  } else {
    sendMessage(messageType, false);
  }
}

function getConnectedClients() {
  if (!presence) return;
  const [presenceData] = presence.list();
  if (presenceData) {
    sendMessage("connected-clients", presenceData.metas);
  }
}

function toggleConnection() {
  if (isConnected) {
    socket.disconnect();
    socket = null;
    channel = null;
    presence = null;
    isConnected = false;
  } else {
    connectSocketAndJoinChannel();
  }
}

///////// helpers

function connectSocketAndJoinChannel() {
  socket = connectSocket();
  socket.onOpen(() => {
    isConnected = true;
    channel = joinChannel(socket);
    presence = new Phoenix.Presence(channel);
    presence.onSync((_presences) => {});
  });
  socket.onClose(() => {
    isConnected = false;
  });
  socket.onError((e) => {
    isConnected = false;
  });
}

function connectSocket() {
  const socket = new Phoenix.Socket("wss://localhost:4001/extension");
  socket.connect();
  return socket;
}

function joinChannel(socket) {
  const channel = socket.channel("extension", {
    browser: browserName,
    id: browserId,
  });

  channel
    .join()
    .receive("ok", () => console.log("joined extension channel"))
    .receive("error", (resp) =>
      console.log("unable to join extension channel", resp)
    );

  return channel;
}

// tabs

async function getTabs() {
  let tabs = await chrome.tabs.query({ windowType: "normal" });
  tabs = filterAndTransformTabs(tabs);
  return tabs;
}

function filterAndTransformTabs(tabs) {
  return tabs
    .filter((tab) => tab.url.startsWith("http"))
    .map((tab) => ({ url: tab.url, title: tab.title }));
}

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0 && tabs[0].url.startsWith("http")) {
    return tabs[0];
  } else {
    return null;
  }
}

function sendMessage(type, payload = {}) {
  return chrome.runtime.sendMessage({ type, payload });
}
