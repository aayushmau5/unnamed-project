# unnamed-extension

this is a browser extension(for firefox, chrome & brave) for my own personal usage.

Right now, it syncs tabs between different browser using [my phoenix server](https://github.com/aayushmau5/phoenix.aayushsahu.com). It is meant to be much for than a cross browser tab syncer.

**Note:** It's quite hard/impossible to package and install an extension locally(i had some success with firefox using `web-ext` but not with chrome/brave). Thus, until some solution comes up, this project has been put on hold.

## TODOs

- Liveview: UI to show the links
- context menu entry(https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Context_menu_items)
  - future idea: paragraph bookmarks
- loading extension for different browsers
- disable too much logger output on phoenix side
- handle service worker/background script is not running
- (future idea) as a tab manager? closing tabs, saving tabs, etc. - hmmm, do i really need this?
