const { WebsocketChannel } = require('../utils/node/websocket.server')
const { AsyncCall, JSONSerialization } = require('../out/base')
const { Server } = require('ws')

const ws = new Server({ port: 3456 })
const channel = new WebsocketChannel(ws)
const server = (module.exports.server = {
    now: Date.now,
})
AsyncCall(server, { messageChannel: channel, serializer: JSONSerialization() })
