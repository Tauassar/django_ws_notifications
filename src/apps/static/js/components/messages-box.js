import {WebSocketManager} from "../socket/web-socket-manager.js";

import {log_error} from "../messages.js";

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

const messagesBox = {
    template:
    `
        <div class="card is-flex is-flex-direction-column is-overflow-hidden">
            <header class="card-header" style="z-index: 1; background-color: inherit">
              <p class="card-header-title">История сообщений</p>
              
              <button @click="autoScrollOn=!autoScrollOn" class="card-header-icon" aria-label="auto scroll">
                Автоматически проматывать на последнее сообщение при обновлении
                <span class="icon">
                  <i v-if="autoScrollOn" class="fa-solid fa-toggle-on"></i>
                  <i v-else class="fa-solid fa-toggle-off"></i>
                </span>
              </button>
              
              <button @click="is_hidden=!is_hidden" class="card-header-icon" aria-label="more options">
                <span class="icon">
                  <i class="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </button>
            </header>
      
            <div 
                class="messages columns is-flex-direction-column p-6"
                :class="{'is-hidden': is_hidden}"
                style="overflow: auto; flex: 1 1 auto"
                id="scrollable-messages-block"
            >
                <messages-component 
                    v-for="message in messages"
                    :is-incoming-message="message.is_incoming" 
                    :content="message.content"
                />
            </div>
        </div>
    `,
    props: {},
    data() {
        return {
            is_hidden: false,
            autoScrollOn: true,
            wsManager: null,
            messages: []
        }
    },
    updated() {
        if(this.autoScrollOn){
          document.getElementById('scrollable-messages-block').scrollTop = document.getElementById('scrollable-messages-block').scrollHeight;
        }
    },
    async created() {
        this.messages = []
    },
    methods: {
        async connect_ws_channel(token, refresh){
            try {
                let roomName = parseJwt(token).user_id

                this.wsManager = new WebSocketManager(
                    'ws://'
                    + window.location.hostname
                    + ':8003'
                    + '/ws/notifications/'
                    + roomName
                    + '/?token=' + token,
                    token
                );
                this.wsManager.checkMessageFn = message => message.type === 'command_processing_result' && message.value === 'pong'

                this.wsManager.checkTokenExpiryFn = (token) => {
                  let exp = parseJwt(token).exp;
                  return Date.now() >= exp * 1000
                }

                this.wsManager.updateTokenFn = async function() {
                  let response = await fetch(
                        "http://"+window.location.host+"/api/users/token/refresh/",
                        {
                            method: "POST",
                            body: JSON.stringify({
                              "refresh": refresh,
                            }),
                            headers: {
                                "Content-type": "application/json; charset=UTF-8"
                            }
                        }
                    )
                    let data = await response.json()

                    if(response.status === 200 && data.identity){
                        console.log("identity token rotation finished successfully")
                        this.url = (
                            'ws://'
                            + window.location.hostname
                            + ':8003'
                            + '/ws/notifications/'
                            + roomName
                            + '/?token=' + data.identity
                        )
                        this.token = data.identity
                    }else{
                        log_error(
                            "Неизвестная ошибка при обновлении авторизационного токена"
                        )
                    }
                }
                this.wsManager.onMessage = (ws, message) => {
                    this.messages.push(
                        {
                            is_incoming: true,
                            content: message,
                        },
                    )

                    var out_message = {
                        type: 'message_ack',
                        key: message.key
                    }
                    if(message.type==="server_notification"){
                        ws.send(
                            JSON.stringify(out_message)
                        )
                        this.messages.push(
                            {
                                is_incoming: false,
                                content: out_message,
                            },
                        )
                    }
                }
                this.wsManager.onPingFn = () => {
                    this.messages.push(
                        {
                            is_incoming: false,
                            content: { type: 'command', key: 'ping' },
                        },
                    )
                }
                await this.wsManager.connect()
            } catch (err) {
                log_error('Не получилось открыть WebSocket')
                console.log(err)
            }
        },
        disconnect_ws_channel(){
            this.wsManager.cleanup()
            this.messages = []
        },
    },
}
export default messagesBox;