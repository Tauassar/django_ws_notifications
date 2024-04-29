const messagesComponent = {
    template:
    `
        <div 
            class="card column is-11"
            :class="{ 'is-align-self-flex-end': !isIncomingMessage, 'has-text-right': !isIncomingMessage, 'has-background-link-dark': !isIncomingMessage, 'has-background-primary-dark': isIncomingMessage}"
        >
        
          <header class="card-header">
            <p class="card-header-title" v-if="isIncomingMessage">Исходящее сообщение</p>
            <p class="card-header-title is-justify-content-end" v-else>Входящее сообщение</p>
          </header>
          
          <div class="card-content">
            
            <div class="content">
              {{ content }}
            </div>
          </div>
        </div>
    `,
    props: {
        isIncomingMessage: {
            type: Boolean,
            required: true,
        },
        content: {
            type: String,
            required: true,
        }
    },
    data() {
        return {

        }
    },
    methods: {},
}
export default messagesComponent;