import * as rpc from '../out/base.mjs'
// Need to have a complied version
import { WebSocketMessageChannel } from '../utils/web/websocket.client.js'

const { AsyncCall, JSONSerialization } = rpc
/**
 * @type {typeof import('./node.websocket.server').server}
 */
const server = AsyncCall(
    {},
    {
        messageChannel: new WebSocketMessageChannel('ws://localhost:3456/'),
        serializer: JSONSerialization(),
    },
)

window.remote = server
window.ac = rpc
console.log('Server at window.remote', server, 'library at window.ac', ac)
