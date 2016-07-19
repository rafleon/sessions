
const state = {
  items: []
}

const mutations = { 
  SETSTATE (state,items) {
    state.items=items;
  },
  ADDITEM (state,item) {
    var thisitem = state.items.find(i => { return (i.desc == item);});
    if(thisitem) {thisitem.num++}
    else {
      state.items.push({desc: item, num:1});
    }
  },
  REMITEM (state,item) {
    var itemindex=state.items.findIndex(i => { return (i.desc == item);});
    if(itemindex!=-1){
      var thisitem = state.items[itemindex];
      if(thisitem.num>1) { thisitem.num--;}
      else {
        state.items.splice(itemindex,1);
      }
    }},
  REMALL (state) {
    state.items=[];
  }
}

var socket = io();
const sioplugin = store => {
  store.subscribe((mutation, state) => {
    if(mutation.type != 'SETSTATE'){
      socket.emit('mutation',mutation);
    }
  })
  socket.on('setstate',items => {
    store.commit('SETSTATE',items);
  });
}

var refreshstate = function (){
  socket.emit('refresh',{});
}

var store = new Vuex.Store({
  state,
  mutations,
  plugins: [sioplugin]
})
