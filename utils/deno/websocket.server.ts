import { Server } from 'https://deno.land/std@0.61.0/http/server.ts'
import { acceptWebSocket, WebSocket } from 'https://deno.land/std@0.61.0/ws/mod.ts'
import { CallbackBasedChannel } from '../../src/types.ts'

export class WebSocketChannel extends EventTarget implements CallbackBasedChannel {
    constructor(public server: Server) {
        super()
    }
    private async acceptRequest(callback: (data: unknown) => Promise<unknown>, signal: AbortController) {
        for await (const req of this.server) {
            if (signal.signal.aborted) return
            const { conn, r: bufReader, w: bufWriter, headers } = req
            const ws = await acceptWebSocket({
                conn,
                bufReader,
                bufWriter,
                headers,
            })
            signal.signal.addEventListener('abort', () => ws.close(), { once: true })
            this.handledWebSocket(ws, callback, signal).catch(this.error)
        }
    }
    private async handledWebSocket(
        websocket: WebSocket,
        callback: (data: unknown) => Promise<unknown>,
        signal: AbortController,
    ) {
        for await (const event of websocket) {
            if (signal.signal.aborted || websocket.isClosed) return
            callback(event).then((x) => x && !websocket.isClosed && websocket.send(x as any), this.error)
        }
    }
    private error = (error: any) => {
        this.dispatchEvent(new ErrorEvent('error', { error }))
    }
    setup(callback: (data: unknown) => Promise<unknown>) {
        const signal = new AbortController()
        this.acceptRequest(callback, signal).catch(this.error)
        return () => signal.abort()
    }
}
