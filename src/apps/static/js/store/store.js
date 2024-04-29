export const store = new Vuex.Store({
    state () {
        return {
            user_id: '',
            token: ''
        }
    },
    mutations: {
      increment(state) {
        state.test++;
      },
      setName(state, payload) {
        state.name = payload;
      }
    },
    actions: {
      pretendUpdate({state, commit}) { //can use state, commmit and dispatch
        commit('increment');
        console.log('pretend update', state.test);
      },
    }
  });