const app = new Vue({
  el: '#app',
  data: state,
  store,
  vuex: {
    getters: {
      items: state => state.items
    }
  }
})

refreshstate();
// need to give Vue a moment to initialize.
setTimeout(function(){ 
//  store.commit('REMALL');
  store.commit('ADDITEM','bread');
  store.commit('ADDITEM','bread');
  store.commit('ADDITEM','eggs');
  store.commit('ADDITEM','eggs');
  store.commit('REMITEM','eggs');
  store.commit('ADDITEM','bananas');
}, 500);
