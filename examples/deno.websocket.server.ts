import { serve } from 'https://deno.land/std@0.61.0/http/server.ts'
import { WebSocketChannel } from '../utils/deno/websocket.server.ts'
import { AsyncCall } from '../out/base.mjs'
import { BSON_Serialization } from '../utils/web/bson.js'
// https://github.com/mongodb/js-bson/issues/371
// import bson from 'https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.browser.esm.js'
// https://github.com/rollup/rollup/issues/3689
// import 'https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.browser.umd.js'
// @ts-ignore
globalThis.global = globalThis
// Not using https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.browser.umd.js cause
// https://github.com/mongodb/js-bson/issues/378
const s = await fetch('https://cdn.jsdelivr.net/npm/bson@4.0.4/dist/bson.bundle.js')
const source = await s.text()
Object.defineProperty(Object.prototype, '__proto__', {
    configurable: true,
    get() {
        return Object.getPrototypeOf(this)
    },
    set(val: any) {
        // https://github.com/mongodb/js-bson/issues/380 they're using this
        return Object.setPrototypeOf(this, val)
    },
})
;(0, eval)(source)
export const server = {
    now: Date.now,
    rand: Math.random,
    echo: <T>(x: T) => x,
}

AsyncCall(server, {
    channel: new WebSocketChannel(serve({ port: 3456 })),
    serializer: BSON_Serialization(BSON),
    log: { type: 'basic' },
})
console.log('Server is ready')
declare const BSON: any
