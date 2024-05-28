let socket = null;
let channel = null;
let presence = null;
let isConnected = false;

// on init
browser.runtime.onInstalled.addListener(() => {
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
    // handle the state where socket isn't connected(edge case)
    if (isConnected) {
      getTabs().then((tabs) => {
        channel.push("firefox:tabs", { tabs });
      });
    }
  }
});

// handle messages from main/foreground script
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "get-socket-state") {
    sendResponse({ isConnected });
  } else if (message.type === "get-tabs") {
    channel
      .push("get-tabs", {})
      .receive("ok", (payload) =>
        browser.runtime.sendMessage({ type: "tabs-response", payload })
      )
      .receive("error", (err) => console.log("phoenix errored", err))
      .receive("timeout", () => console.log("timed out pushing"));
  } else if (message.type === "bookmark-current-tab") {
    const tabs = await getCurrentTab();
    if (tabs.length > 0) {
      const tab = tabs[0];
      if (!tab.url.startsWith("http"))
        return browser.runtime.sendMessage({
          type: "bookmark-response",
          response: false,
        });
      channel
        .push("firefox:bookmark-tab", { url: tab.url, title: tab.title })
        .receive("ok", () => {
          browser.runtime.sendMessage({
            type: "bookmark-response",
            response: true,
          });
        })
        .receive("error", (err) => {
          console.error(err);
          browser.runtime.sendMessage({
            type: "bookmark-response",
            response: true,
          });
        });
    } else {
      return browser.runtime.sendMessage({
        type: "bookmark-response",
        response: false,
      });
    }
  }
  // console.log(message, sender);
});

///////// helpers

function connectSocket() {
  const socket = new Phoenix.Socket("wss://localhost:4001/extension");
  socket.connect();
  return socket;
}

function joinChannel(socket) {
  const channel = socket.channel("extension", { browser: "firefox" });
  channel
    .join()
    .receive("ok", () => console.log("joined firefox channel"))
    .receive("error", (resp) =>
      console.log("unable to join firefox channel", resp)
    );

  return channel;
}

function handlePresence(e) {
  console.log(e);
  console.log(
    presence.list((id, metas) => {
      console.log(id, metas);
    })
  );
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
  return browser.tabs.query({ active: true, currentWindow: true });
}
