#!/usr/local/lib/nvm/versions/node/v6.3.0/bin/node

var env = require('get-env')();

var co = require('co');
var comongo = require('co-mongo-fork');
var koa = require('koa');
var compress = require('koa-compress');
var conditional = require('koa-conditional-get');
var etag = require('koa-etag');
var serve = require('koa-static');
var http = require('http');
var ioserver = require('socket.io');

// *** end loading. 

// *** Start building the server ...
var app = koa();
console.log("Currently in "+app.env+ " ...");

// Respond with 304 if fresh
app.use(conditional());
app.use(etag());

// compress everything over 2K
app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH}));

// serve static assets.
app.use(serve('node_modules/vue/dist'));
app.use(serve('node_modules/vuex/dist'));
app.use(serve('www'+env,{index:'index.html'}));

// create an all-purpose server for koa and socket.io
var server = http.createServer(app.callback());
var io = ioserver(server);

io.on('connection', co.wrap(function *(socket){
  console.log("New socket connection with id: "+socket.id);
  var db = yield comongo.connect('mongodb://localhost/sessions');
  var itemscoll = yield db.collection('items');
  socket.on('mutation', co.wrap(function *(mutation){
    switch(mutation.type){
    case 'ADDITEM':
      yield itemscoll.update({desc:mutation.payload},
                             {$inc:{num:1}},
                             {upsert:true});
      break;
    case 'REMITEM':
      yield itemscoll.update({desc:mutation.payload},
                             {$inc:{num:-1}});
      yield itemscoll.remove({desc:mutation.payload,num:0});
      break;
    case 'REMALL':
      yield itemscoll.remove({});
      break;
    default:
      console.log('Invalid mutation.');
    }
  }));
  socket.on('refresh', co.wrap(function *(){
    var allitems = yield itemscoll.find({},{_id:0}).toArray();
    socket.emit('setstate',allitems);
  }));
}));

var port = 3000;
server.listen(port);
console.log('Listening on port '+port);
