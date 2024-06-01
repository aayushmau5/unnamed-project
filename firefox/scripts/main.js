const socketConnectionStatusContainer = document.getElementById(
  "socket-connection-state"
);
const bookmarkButton = document.getElementById("bookmark-button");
const tabsContainer = document.getElementById("tabs-container");
const qaButton = document.getElementById("qa-button");
const qaContainer = document.getElementById("quick-access");
const tabsButton = document.getElementById("tabs-button");
const tabsParent = document.getElementById("tabs-parent");
const clientsUl = document.getElementById("connected-clients");

init();
initMessageHandler();
runTimer();

// Utils

async function init() {
  sendMessage("get-socket-state");

  // bookmark
  bookmarkButton.addEventListener("click", () => {
    sendMessage("bookmark-current-tab");
  });

  qaButton.addEventListener("click", () => {
    qaContainer.style = "display: flex;";
    tabsParent.style = "display: none;";
  });

  tabsButton.addEventListener("click", () => {
    qaContainer.style = "display: none;";
    tabsParent.style = "display: block;";
  });
}

function initMessageHandler() {
  browser.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    const { type, payload } = message;
    console.log(payload);
    switch (type) {
      case "tabs-response":
        return handleTabs(payload);
      case "bookmark-response":
        return handleBookmarkResponse(payload);
      case "connection-state":
        return handleConnectionState(payload);
      case "connected-clients":
        return showConnectedClients(payload);
    }
  });
}

function handleTabs(payload) {
  tabsContainer.innerHTML = ""; // clearing the previous contents first
  console.log(payload);
  Object.keys(payload)
    .map((key) => renderTabsWithHeader(key, payload[key]))
    .map((el) => tabsContainer.appendChild(el));
}

function handleBookmarkResponse(payload) {
  if (payload === false) {
    bookmarkButton.innerText = "failed to bookmark";
  } else {
    bookmarkButton.innerText = "done!";
  }
}

function handleConnectionState(payload) {
  socketConnectionStatusContainer.innerText = payload
    ? payload.isConnected
    : false;
}

function showConnectedClients(payload) {
  clientsUl.innerHTML = "";
  payload
    .map((meta) => ({
      browser: meta.browser,
      id: meta.id,
    }))
    .map((client) => {
      const li = document.createElement("li");
      li.innerText = `${client.browser} - ${client.id}`;
      clientsUl.appendChild(li);
    });
}

function runTimer() {
  setInterval(function () {
    sendMessage("get-tabs");
  }, 2000);

  setInterval(function () {
    sendMessage("get-connected-clients");
  }, 2000);
}

function sendMessage(type, payload = {}) {
  return browser.runtime.sendMessage({
    type,
    payload,
  });
}

// UI

function generateTabsHtml(tabs) {
  let ulContainer = document.createElement("ul");

  tabs.map((tab) => {
    let li = document.createElement("li");
    let anchor = document.createElement("a");
    anchor.href = tab.url;
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noreferrer");
    anchor.textContent = tab.title;
    li.appendChild(anchor);
    ulContainer.appendChild(li);
  });

  return ulContainer;
}

function renderTabsWithHeader(header, tabs) {
  let container = document.createElement("div");
  let heading = document.createElement("h4");
  heading.innerText = header;
  container.appendChild(heading);
  container.appendChild(generateTabsHtml(tabs));
  return container;
}
