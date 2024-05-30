importScripts("phoenix.min.js");

let socket = null;
let channel = null;
let presence = null;
let isConnected = false;
let browserId = null;

let browser = chrome;

// on init
browser.runtime.onInstalled.addListener(async () => {
  const info = await browser.runtime.getPlatformInfo();
  browserId = `brave_${info.os}`;
  socket = connectSocket();
  socket.onOpen(() => {
    isConnected = true;
    channel = joinChannel(socket);
    presence = new Phoenix.Presence(channel);
    presence.onSync(handlePresence);
  });
  socket.onClose(() => (isConnected = false));
  socket.onError((e) => (isConnected = false));
});

// alarms
browser.alarms.create("check-connection", {
  delayInMinutes: 0.1,
  periodInMinutes: 0.1,
});

browser.alarms.create("sync-tabs", {
  delayInMinutes: 0,
  periodInMinutes: 0.2,
});

// handle alarm
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "check-connection") {
    isConnected = socket.isConnected();
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
browser.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  const { type, _response } = message;
  switch (type) {
    case "get-socket-state":
      return returnSocketState();
    case "get-tabs":
      return handleGetTabs();
    case "bookmark-current-tab":
      return bookmarkCurrentTab();
  }
});

function returnSocketState() {
  sendMessage("connection-state", { isConnected });
}

function handleGetTabs() {
  channel
    .push("get-tabs", {})
    .receive("ok", (payload) => sendMessage("tabs-response", payload))
    .receive("error", (err) => console.log("phoenix errored", err))
    .receive("timeout", () => console.log("timed out pushing"));
}

async function bookmarkCurrentTab() {
  const tab = await getCurrentTab();
  if (tab) {
    channel
      .push("brave:bookmark-tab", { url: tab.url, title: tab.title })
      .receive("ok", () => {
        sendMessage("bookmark-response", true);
      })
      .receive("error", (err) => {
        console.error(err);
        sendMessage("bookmark-response", false);
      });
  } else {
    sendMessage("bookmark-response", false);
  }
}

///////// helpers

function connectSocket() {
  const socket = new Phoenix.Socket("wss://localhost:4001/extension");
  socket.connect();
  return socket;
}

function joinChannel(socket) {
  const channel = socket.channel("extension", {
    browser: "brave",
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

function handlePresence() {
  presence.list((id, metas) => {
    console.log(id, metas);
  });
}

// tabs
async function getTabs() {
  let tabs = await browser.tabs.query({ windowType: "normal" });
  tabs = filterAndTransformTabs(tabs);
  return tabs;
}

function filterAndTransformTabs(tabs) {
  return tabs
    .filter((tab) => tab.url.startsWith("http"))
    .map((tab) => ({ url: tab.url, title: tab.title }));
}

async function getCurrentTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0 && tabs[0].url.startsWith("http")) {
    return tabs[0];
  } else {
    return null;
  }
}

function sendMessage(type, payload = {}) {
  return browser.runtime.sendMessage({ type, payload });
}