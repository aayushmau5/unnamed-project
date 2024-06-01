# unnamed-extension

## TODOs

- ~~merge into one extension codebase~~
  - handle different browser id
- ~~dictate socket connect/disconnect through main.js~~
  - ~~efficiency. don't keep sending tabs all the time?~~ Well, most of the time it would be disabled, so not really worrying about it rn
  - ~~fix "timeout errors" on socket connect after disconnect~~
- ~~show connected clients~~
- ~~add to intersting link(or maybe categories?)~~
  - Liveview: UI to show the links
- context menu entry(https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Context_menu_items)
  - future idea: paragraph bookmarks
- ~~quick access(pretty easy).~~
- ~~tabs(quick access, cross-browser sync, scribble?)~~
- ~~styling fixes(fixed width, height, scorllable, etc.)~~
- enable check-origin for extension socket only
- build step for each browser with fixed id(.env)
- disable too much logger output on phoenix side
- handle service worker/background script is not running
- (future idea) as a tab manager? closing tabs, saving tabs, etc. - hmmm, do i really need this?
