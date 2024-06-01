# unnamed-extension

## firefox

- as soon as the extension is loaded, don't connect to the server yet
- have the option to connect and disconnect
- on connect, connect to phoenix server.
- keep the connection persistent(unless the browser is closed).
- first, load tabs(from other browsers). background -> script(then create html)
- second, share tabs. script -> background
- have a button to sync?(easiest route). script -> background -> get data from server -> script -> html. this is basically equivalent to API?
- otherwise, look for tab events(need to check). on tab event, if connected(and persistent), send data.

- if this works, there might be stuff for future ideas

## TODOs

- merge into one extension codebase
- dictate socket connect/disconnect through main.js
  - efficiency. don't keep sending tabs all the time?
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
