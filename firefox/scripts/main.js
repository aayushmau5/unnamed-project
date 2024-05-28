const socketConnectionStatusContainer = document.getElementById(
  "socket-connection-state"
);
const bookmarkButton = document.getElementById("bookmark-button");
const tabsContainer = document.getElementById("tabs-container");

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
      default:
        console.log("default: ", type);
    }
  });
}

function handleTabs(payload) {
  const firefoxTabs = payload.firefox_tabs;
  if (firefoxTabs) renderTabs(firefoxTabs);
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

function runTimer() {
  setInterval(function () {
    sendMessage("get-tabs");
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
  return tabs.map((tab) => {
    let anchor = document.createElement("a");
    anchor.href = tab.url;
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noreferrer");
    anchor.textContent = tab.title;
    return anchor;
  });
}

function renderTabs(tabs) {
  tabsContainer.innerHTML = ""; // clearing the previous contents first
  generateTabsHtml(tabs).map((tabElement) =>
    tabsContainer.appendChild(tabElement)
  );
}
