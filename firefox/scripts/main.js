const socketConnectionStatusContainer = document.getElementById(
  "socket-connection-state"
);
const bookmarkButton = document.getElementById("bookmark");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "tabs-response") {
    document.getElementById("response").innerText = JSON.stringify(
      message.payload
    );
  } else if (message.type === "bookmark-response") {
    if (message.response === false) {
      bookmarkButton.innerText = "failed to bookmark";
    } else {
      bookmarkButton.innerText = "done!";
    }
  }
});

init();
runTimer();

// .addEventListener("click", () => {
//   browser.runtime.sendMessage({ type: "connect" });
//   getTabs();
// });

// feature: bookmark current tab(or tab list) -> save it in db

// bookmark
bookmarkButton.addEventListener("click", () => {
  browser.runtime.sendMessage({
    type: "bookmark-current-tab",
  });
});

async function init() {
  const response = await browser.runtime.sendMessage({
    type: "get-socket-state",
  });

  socketConnectionStatusContainer.innerText = response
    ? response.isConnected
    : false;
}

function runTimer() {
  setInterval(function () {
    // console.log("running setInterval");
    browser.runtime.sendMessage({
      type: "get-tabs",
    });
  }, 2000);
}
