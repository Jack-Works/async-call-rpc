const { WebSocketChannel } = require('async-call-rpc/utils/node/websocket.server')
const { Msgpack_Serialization } = require('async-call-rpc/utils/node/msgpack')
const { AsyncCall } = require('async-call-rpc')
const { Server } = require('ws')

const ws = new Server({ port: 3456 })
const channel = new WebSocketChannel(ws)
const server = (module.exports.server = {
    now: Date.now,
    echo: (x) => x,
})
AsyncCall(server, { channel: channel, serializer: Msgpack_Serialization() })
