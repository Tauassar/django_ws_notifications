import { prettyPrintJson } from '../pretty-print-json.js';

const messagesComponent = {
    template:
    `
        <div 
            class="card column is-11 has-background-primary-dark"
            :class="getOuterDivClasses()"
        >
        
          <header class="card-header">
            <p class="card-header-title is-justify-content-end" v-if="!isIncomingMessage">Исходящее сообщение</p>
            <p class="card-header-title" v-else>Входящее сообщение</p>
          </header>
          
          <div class="card-content">
            <p>{{timestamp}}</p>
            <div class="content" v-html="toPrettyJson(content)" />
          </div>
        </div>
    `,
    props: {
        isIncomingMessage: {
            type: Boolean,
            required: true,
        },
        content: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            timestamp: null
        }
    },
    created(){
        this.timestamp = new Date();
    },
    methods: {
        toPrettyJson(content) {
            return prettyPrintJson.toHtml(
                content,
                {
                    trailingCommas: false,
                    quoteKeys: true,
                    lineNumbers: true
                }
            );
        },
        getOuterDivClasses(){
            if(this.isIncomingMessage) {
                return []
            } else {
                return [
                    'is-align-self-flex-end',
                    'has-text-right',
                ]
            }
        }
    },
    computed: {}
}
export default messagesComponent;