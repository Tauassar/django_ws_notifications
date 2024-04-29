import { store } from './store/store.js';
import loginForm from "./components/login-form.js";
import messagesBox from "./components/messages-box.js";
import messagesComponent from "./components/message.js";

const { createApp } = Vue;

createApp({
  data() {
    return {}
  },
  computed: {
    items() {
      return this.$store.state.items;
    },
    name() {
      return this.$store.state.name;
    }
  },
  methods: {
    testMethod() {
      console.log('test', this.$store.state.test);
      this.$store.dispatch('pretendUpdate');
    },
    boop() {
      console.log('booop');
      console.log('test', this.test);
    },
  }
 ,

})
.component('login-form', loginForm)
.component('messages-box', messagesBox)
.component('messages-component', messagesComponent)
.use(store)
.mount("#app");