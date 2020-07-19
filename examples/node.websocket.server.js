const { WebSocketChannel } = require('async-call-rpc/utils/node/websocket.server')
const { AsyncCall, JSONSerialization } = require('async-call-rpc')
const { Server } = require('ws')

const ws = new Server({ port: 3456 })
const channel = new WebSocketChannel(ws)
const server = (module.exports.server = {
    now: Date.now,
})
AsyncCall(server, { messageChannel: undefined, channel: channel, serializer: JSONSerialization() })
