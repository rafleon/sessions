#!/usr/bin/env node

var env = require('get-env')();

var co = require('co');
var comongo = require('co-mongo-fork');
var koa = require('koa');
var convert = require('koa-convert');
var serve = require('koa-static');
var compress = require('koa-compress');
var conditional = require('koa-conditional-get');
var etag = require('koa-etag');
var IO = require('koa-socket');

// *** end loading. 

// *** Start building the server ...
var app = new koa();
var io = new IO();
io.attach(app);
console.log("Currently in "+app.env+ " ...");

// Respond with 304 if fresh
app.use(convert(conditional()));
app.use(convert(etag()));

// compress everything over 2K
app.use(convert(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH})));

// serve static assets.
app.use(convert(serve('node_modules/vue/dist')));
app.use(convert(serve('node_modules/vuex/dist')));
app.use(convert(serve('www'+env)));

io.on('connection',co.wrap(function *(ctx) {
  console.log("New socket connection with id: "+ctx.socket.id);
  var db = yield comongo.connect('mongodb://localhost/sessions');
  ctx.socket.itemscoll = yield db.collection('items');
}));

io.on('mutation',co.wrap(function *(ctx,mutation) {
  var itemscoll = ctx.socket.socket.itemscoll;
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
  }}));

io.on('refresh', co.wrap(function* (ctx) {
  var itemscoll = ctx.socket.socket.itemscoll;
  var allitems = yield itemscoll.find({},{_id:0}).toArray();
  ctx.socket.emit('setstate',allitems);
}));

var port = 3000;
app.listen(port);
console.log('Listening on port '+port);
