# firefox

- as soon as the extension is loaded, don't connect to the server yet
- have the option to connect and disconnect
- on connect, connect to phoenix server.
- keep the connection persistent(unless the browser is closed).
- first, load tabs(from other browsers). background -> script(then create html)
- second, share tabs. script -> background
- have a button to sync?(easiest route). script -> background -> get data from server -> script -> html. this is basically equivalent to API?
- otherwise, look for tab events(need to check). on tab event, if connected(and persistent), send data.

- if this works, there might be stuff for future ideas
