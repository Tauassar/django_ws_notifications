export class WebSocketManager {
    // constants
    pingMessage = JSON.stringify({ type: 'command', key: 'ping' })

    // Timer ids
    healthCheckId;
    reconnectAttemptsId;

    // Callbacks
    checkMessageFn;
    onOpenConnection;
    onMaxAttemptsReached;
    onMessage;
    onClose;
    onError;

    constructor(
        url,
        reconnectOnPingPongFailed = true,
        maxAttempts = 10,
        maxMissedPongs = 5,
        reconnectDelay = 5000,
        pingInterval = 3000
    ) {
        this.url = url
        this.reconnectOnPingPongFailed = reconnectOnPingPongFailed
        this.maxAttempts = maxAttempts
        this.maxMissedPongs = maxMissedPongs
        this.pingInterval = pingInterval
        this.reconnectDelay = reconnectDelay
        this.attempts = 0
        this.pings = 0
        this.websocket = null
    }

    async connect() {
        await this.createWebSocket()
    }

  async createWebSocket() {
    return new Promise(resolve => {
      // Check if websocket is not null and already opened, do nothing
      if (this.websocket && this.websocket.readyState === this.websocket.OPEN) return

      const websocket = new WebSocket(this.url)
      this.websocket = websocket

      websocket.addEventListener('open', () => {
        this.startHealthCheck()
        clearInterval(this.reconnectAttemptsId)
        resolve(websocket)
        this.onOpenConnection?.()
      })

      // Here we can ensure that socket opened and we recieving messages
      websocket.addEventListener('message', (e) => {
        if (this.attempts > 0) {
          // Reset attempts if message recieved
          this.attempts = 0
        }
        const data = JSON.parse(e.data)
        this.onMessage?.(websocket, data)
        this.checkMessage(data)
      })

      websocket.addEventListener('close', () => {
        this.onClose?.()
      })

      websocket.addEventListener('error', (error) => {
        this.onError?.(error)
      })
    })
  }

  sendPing() {
    if (!this.websocket || this.websocket.readyState !== this.websocket.OPEN) return this.pings++
    this.websocket.send(this.pingMessage)
    this.pings++
  }

  checkMessage(message) {
    try {
      if (!this.checkMessageFn) throw new Error('checkMessageFn must be defined!')
      // Reset pings if message recieved and message.type is command_processing_result and message.value is pongs
      if (this.checkMessageFn(message)) {
        this.pings = 0
      }
    } catch {
      // if checkMessageFn is not defined, catch clause will be executed then onError if provided will be called
      this.onError?.()
    }
  }

  startPingPong() {
    try {
      this.sendPing()
      if (this.pings > this.maxMissedPongs) {
        if (this.reconnectOnPingPongFailed) {
          clearInterval(this.healthCheckId)
          throw new Error('Too may missed heartbeats')
        } else {
          this.cleanup()
        }
      }
    } catch {
      this.pings = 0
      clearInterval(this.healthCheckId)
      this.websocket?.close()
      this.startReconnect()
    }
  }

  startHealthCheck() {
    this.startPingPong()
    this.healthCheckId = setInterval(() => {
      this.startPingPong()
    }, this.pingInterval)
  }

  startReconnect() {
    console.log('Socket closed because ping pong is not responing! Trying to reconnect...')
    this.reconnectAttemptsId = setInterval(() => {
      this.reconnect().catch(console.error)
    }, this.reconnectDelay)
  }

  async reconnect() {
    // Additional guard to prevent reconnecting if websocket is already opened
    if (this.websocket && this.websocket.readyState === this.websocket.OPEN) {
      return this.cleanup()
    }
    if (this.attempts >= this.maxAttempts && this.websocket && this.websocket.readyState !== this.websocket.OPEN) {
      console.log(`Max attempts reached! Can't connect to socket after ${this.attempts} attempts! Run cleanup!`)
      this.cleanup()
      this.onMaxAttemptsReached?.()
      return
    }
    this.attempts++
    console.log('Reconnecting to websocket...')
    await this.connect()
  }

  cleanup() {
    console.log('Running cleanup...')
    this.websocket.onclose = function () {}
    this.websocket.close(4014, "user closed connection")
    clearInterval(this.healthCheckId)
    clearInterval(this.reconnectAttemptsId)
  }
}
