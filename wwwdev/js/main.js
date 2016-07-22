const mylist = new Vue({
  el: '#mylist',
  store,
  computed: Vuex.mapGetters([
    'items'
  ]),
  methods: Vuex.mapActions([
    'additem',
    'remitem',
    'remall',
  ])
})

const mynewitem = new Vue({
  el: '#newitembox',
  data: {
    newitem: ''
  },
  methods: {
    addnewitem: function(){
      var text=this.newitem.trim();
      if(text!=''){
        store.commit('ADDITEM',text);
      }
      this.newitem='';
    }
  }
});

refreshstate();
