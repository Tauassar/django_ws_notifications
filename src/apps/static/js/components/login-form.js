const loginForm = {
    template:
        `
        <div class="card">
              <header class="card-header">
                <p class="card-header-title">Авторизационная форма</p>
                <button @click="is_hidden=!is_hidden" class="card-header-icon" aria-label="more options">
                  <span class="icon">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                </button>
              </header>
              
            <form @submit.prevent="submit" :class="{'is-hidden': is_hidden}">
            
                <div class="field px-3">
                  <p class="control has-icons-left has-icons-right">
                    <input class="input" type="text" placeholder="Username" v-model="form.username" />
                    <span class="icon is-small is-left">
                      <i class="fas fa-user"></i>
                    </span>
                  </p>
                </div>
                <div class="field px-3">
                  <p class="control has-icons-left">
                    <input class="input" type="password" placeholder="Password" v-model="form.password" />
                    <span class="icon is-small is-left">
                      <i class="fas fa-lock"></i>
                    </span>
                  </p>
                </div>
                  <footer class="card-footer is-primary">
                    <button @click="isLoggedIn=!isLoggedIn" class="card-footer-item button is-medium is-primary is-fullwidth" type="submit">
                      Login
                    </button>
                    <button class="card-footer-item button is-medium is-danger is-fullwidth" :class="{'is-hidden': !isLoggedIn}" type="submit">
                      Logout
                    </button>
                  </footer>
            </form>
        </div>
    `,
    props: {},
    data() {
        return {
            is_hidden: false,
            isLoggedIn: false,
            form: {
                email: '',
                description: '',
                city: '',
                subscribe: false,
                interval: ''
            }
        }
    },
    methods: {
        async submit() {
            console.log(this.form)
        }
    },
}
export default loginForm;