import loginForm from "./components/login-form.js";
import messagesBox from "./components/messages-box.js";
import messagesComponent from "./components/message.js";

const { createApp } = Vue;

createApp({
    template:
        `
        <section class="section is-flex is-flex-direction-column" style="max-height: 100vh">
            <header>
                <div class="container">
                  <h1 class="title">
                    Демонстрационная страница сервиса нотификаций
                  </h1>
                </div>
                <login-form @userLoggedIn="authorize_user" @userLoggedOut="logout_user" authorize_callback="authorize_user" class="mt-3"></login-form>
            </header>
            <messages-box class="mt-3" ref="messagesBox" style="flex: 1 1 auto"></messages-box>

        </section>
    `,
  data() {
    return {}
  },
  computed: {},
  methods: {
    async authorize_user(token, refresh) {
      await this.$refs.messagesBox.connect_ws_channel(token, refresh)
    },
    logout_user() {
      this.$refs.messagesBox.disconnect_ws_channel()
    },
  },
})
.component('login-form', loginForm)
.component('messages-box', messagesBox)
.component('messages-component', messagesComponent)
.mount("#app");