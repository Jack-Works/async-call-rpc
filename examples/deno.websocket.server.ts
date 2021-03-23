import { serve } from 'https://deno.land/std@0.61.0/http/server.ts'
import * as MessagePack from 'https://jspm.dev/@msgpack/msgpack'
import { Msgpack_Serialization } from '../utils/web/msgpack.js'
import { WebSocketChannel } from '../utils/deno/websocket.server.ts'
import { AsyncCall } from '../out/base.mjs'

export const server = {
    now: Date.now,
    rand: Math.random,
    echo: <T>(x: T) => x,
}

AsyncCall(server, {
    channel: new WebSocketChannel(serve({ port: 3456 })),
    serializer: Msgpack_Serialization(MessagePack),
    log: { type: 'basic' },
})
console.log('Server is ready')
