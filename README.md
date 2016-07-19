
# Sessions

### Vuex backend using Mongo over a Socket.io connection.

The "basic" server uses koa.io and is very minimal.

The "full" server adds 304 conditional support and gzip compression.

The "modular" server uses koa, co and socket.io instead of koa.io.

All servers use co-mongo-fork to provide an ES6 interface to mongo.

## Getting Started

```
$ npm install
$ npm start
```

**TODO:**

1. Add a vue.js interface with buttons to add/remove items.
2. Add koa-passport support.

