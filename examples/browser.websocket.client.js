import * as MessagePack from 'https://jspm.dev/@msgpack/msgpack'
// Need to run the build first to get those files.
import { AsyncCall } from '../out/base.mjs'
import { WebSocketMessageChannel } from '../utils/web/websocket.client.js'
import { Msgpack_Serialization } from '../utils/web/msgpack.js'

/** @type {typeof import('./node.websocket.server').server} */
const server = AsyncCall(
    {},
    {
        channel: new WebSocketMessageChannel('ws://localhost:3456/'),
        serializer: Msgpack_Serialization(MessagePack),
    },
)

window.remote = window.server = server
window.ac = rpc
server.echo
server.now
console.log('Server at window.remote', server, 'library at window.ac', ac)
