import * as rpc from '../out/base.mjs'
// Need to have a complied version
import { WebSocketMessageChannel } from '../utils/web/websocket.client.js'
import { BSON_Serialization } from '../utils/web/bson.js'
// https://github.com/mongodb/js-bson/issues/371
// import bson from 'https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.browser.esm.js'
// https://github.com/rollup/rollup/issues/3689
// import 'https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.browser.umd.js'

load().then(() => {
    const { AsyncCall } = rpc
    /**
     * @type {typeof import('./node.websocket.server').server}
     */
    const server = AsyncCall(
        {},
        {
            channel: new WebSocketMessageChannel('ws://localhost:3456/'),
            serializer: BSON_Serialization(BSON),
        },
    )

    window.remote = server
    window.ac = rpc
    console.log('Server at window.remote', server, 'library at window.ac', ac)
})
function load() {
    return new Promise((resolve) => {
        globalThis.global = globalThis
        const s = document.createElement('script')
        // https://github.com/mongodb/js-bson/issues/378
        // s.src = 'https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.browser.umd.js'
        s.src = 'https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.bundle.js'
        s.addEventListener('load', resolve)
        document.body.appendChild(s)
    })
}
