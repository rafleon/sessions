
const state = {
  items: []
}
 
// All mutations starting with '$' are for remote use.
function $SETSTATE (state,items) {
  state.items=items;
}

function ADDITEM (state,item) {
  var thisitem = state.items.find(i => { return (i.desc == item);});
  if(thisitem) {thisitem.num++}
  else {
    state.items.push({desc: item, num:1});
  }
}

var $ADDITEM = ADDITEM;

function REMITEM (state,item) {
  var itemindex=state.items.findIndex(i => { return (i.desc == item);});
  if(itemindex!=-1){
    var thisitem = state.items[itemindex];
    if(thisitem.num>1) { thisitem.num--;}
    else {
      state.items.splice(itemindex,1);
    }}}

var $REMITEM = REMITEM;

function REMALL (state) {
  state.items=[];
}

var $REMALL = REMALL;

const mutations = {$SETSTATE,
                   ADDITEM,
                   $ADDITEM,
                   REMITEM,
                   $REMITEM,
                   REMALL,
                   $REMALL}

var socket = io();
const sioplugin = store => {
  store.subscribe((mutation) => {
    if(mutation.type[0] != '$'){
      socket.emit(mutation.type,mutation.payload);
    }});
  socket.on('$SETSTATE',items => {
    store.commit('$SETSTATE',items);});
  socket.on('$ADDITEM',item => {
    store.commit('$ADDITEM',item);});
  socket.on('$REMITEM',item => {
    store.commit('$REMITEM',item);});
  socket.on('$REMALL', () => {
    store.commit('$REMALL');});
}

var refreshstate = function (){
  socket.emit('refresh');
}

var store = new Vuex.Store({
  state,
  mutations,
  plugins: [sioplugin]
})
