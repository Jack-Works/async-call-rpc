import { serve } from 'https://deno.land/std@0.61.0/http/server.ts'
import { WebSocketChannel } from '../utils/deno/websocket.server.ts'
import { AsyncCall, JSONSerialization } from '../out/base.mjs'

export const server = {
    now: Date.now,
    rand: Math.random,
}
AsyncCall(server, {
    messageChannel: new WebSocketChannel(serve({ port: 3456 })),
    serializer: JSONSerialization(undefined, undefined),
    log: { type: 'basic' },
})
