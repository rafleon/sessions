#!/usr/local/lib/nvm/versions/node/v6.3.0/bin/node

var env = require('get-env')();

var comongo = require('co-mongo-fork');
var koa = require('koa.io');
var serve = require('koa-static');

// *** end loading. 

// *** Start building the server ...
var app = koa();
console.log("Currently in "+app.env+ " ...");

// serve static assets.
app.use(serve('node_modules/vue/dist'));
app.use(serve('node_modules/vuex/dist'));
app.use(serve('www'+env));

app.io.use(function* (next) {
  // on connect 
  console.log("New socket connection with id: "+this.id);
  this.db = yield comongo.connect('mongodb://localhost/sessions');
  this.itemscoll = yield this.db.collection('items');
  yield* next;
  // on disconnect 
});

app.io.route('mutation', function* (next,mutation) {
  switch(mutation.type){
    case 'ADDITEM':
      yield this.itemscoll.update({desc:mutation.payload},
                             {$inc:{num:1}},
                             {upsert:true});
      break;
    case 'REMITEM':
      yield this.itemscoll.update({desc:mutation.payload},
                             {$inc:{num:-1}});
      yield this.itemscoll.remove({desc:mutation.payload,num:0});
      break;
    case 'REMALL':
      yield this.itemscoll.remove({});
      break;
    default:
      console.log('Invalid mutation.');
    }});

app.io.route('refresh', function* (next) {
    var allitems = yield this.itemscoll.find({},{_id:0}).toArray();
    this.emit('setstate',allitems);
});

var port = 3000;
app.listen(port);
console.log('Listening on port '+port);
