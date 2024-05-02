import {log_success, log_error, log_info} from "../messages.js";

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
              
            <form @submit.prevent :class="{'is-hidden': is_hidden}">
            
                <div class="field px-3">
                  <p class="control has-icons-left has-icons-right">
                    <input :disabled='formIsDisabled' class="input" type="text" placeholder="Username" v-model="form.username" />
                    <span class="icon is-small is-left">
                      <i class="fas fa-user"></i>
                    </span>
                  </p>
                </div>
                <div class="field px-3">
                  <p class="control has-icons-left">
                    <input :disabled='formIsDisabled' class="input" type="password" placeholder="Password" v-model="form.password" />
                    <span class="icon is-small is-left">
                      <i class="fas fa-lock"></i>
                    </span>
                  </p>
                </div>
                  <footer class="card-footer is-primary">
                    <button :disabled='formIsDisabled' @click="login" class="card-footer-item button is-medium is-primary is-fullwidth" v-if="!isLoggedIn">
                      <template v-if="!isFetchingResult">Login</template>
                      <i v-else class="fa-solid fa-cog fa-spin"></i>
                    </button>
                    
                    <button @click="logout" class="card-footer-item button is-medium is-danger is-fullwidth" v-else>
                      Logout
                    </button>
                  </footer>
            </form>
        </div>
    `,
    emits: ['userLoggedIn', 'userLoggedOut'],
    props: {},
    data() {
        return {
            is_hidden: false,
            isLoggedIn: false,
            isFetchingResult: false,
            form: {
                username: '',
                password: '',
            }
        }
    },
    computed: {
        formIsDisabled(){
            return this.isFetchingResult || this.isLoggedIn
        }
    },
    methods: {
        async login() {
            if(this.isFetchingResult) return

            if(!this.form.username || !this.form.password){
                log_error("Введены неверные авторизационные данные")
            }

            this.isFetchingResult = true

            let response = await fetch(
                "http://"+window.location.host+"/api/users/token/",
                {
                    method: "POST",
                    body: JSON.stringify({
                      "username": this.form.username,
                      "password": this.form.password
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                }
            )
            let data = await response.json()

            if(response.status === 200 && data.identity){
                log_success("Авторизация выполнена успешно")
                this.isLoggedIn = true
                this.$emit("userLoggedIn", data.identity, data.refresh)
            }else if(data.detail){
                this.isLoggedIn = false
                log_error(
                    `Ошибка при авторизации ${data.detail}`
                )
                this.form.username = ''
                this.form.password = ''
            }else{
                this.isLoggedIn = false
                log_error(
                    "Неизвестная ошибка при авторизации"
                )
                this.form.username = ''
                this.form.password = ''
            }

            this.isFetchingResult = false
        },
        logout(){
            this.form.username = ''
            this.form.password = ''
            this.isLoggedIn = false
            this.$emit("userLoggedOut")
            log_info("Очистка остаточных данных выполнена успешно")
        }
    },
}
export default loginForm;