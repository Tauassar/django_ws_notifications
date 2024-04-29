const messagesBox = {
    template:
    `
        <div class="card is-flex is-flex-direction-column is-overflow-hidden">
            <header class="card-header" style="z-index: 1; background-color: inherit">
              <p class="card-header-title">История сообщений</p>
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
            >
                <messages-component 
                    v-for="message in messages"
                    :is-incoming-message="message.is_incoming" 
                    :content="message.content"
                />
            </div>
        </div>
    `,
    props: {
        token: {
            type: String,
            required: true,
        }
    },
    data() {
        return {
            is_hidden: false,
            messages: [
                {
                    is_incoming: true,
                    content: '1Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras mattis consectetur purus sit amet fermentum.',
                },
                {
                    is_incoming: false,
                    content: '2Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras mattis consectetur purus sit amet fermentum.',
                },
                {
                    is_incoming: false,
                    content: '3Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras mattis consectetur purus sit amet fermentum.',
                },
                {
                    is_incoming: true,
                    content: '4Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras mattis consectetur purus sit amet fermentum.',
                },
                {
                    is_incoming: false,
                    content: '5Lorem ipsum leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras mattis consectetur purus sit amet fermentum.',
                },
            ]
        }
    },
    methods: {
        async submit() {
          console.log(this.form)
        }
    },
}
export default messagesBox;