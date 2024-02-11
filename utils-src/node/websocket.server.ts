import type { Server } from 'ws'
import type WebSocket from 'ws'
import type { CallbackBasedChannel } from 'async-call-rpc' with { 'resolution-mode': 'import' }

type JSONRPCHandlerCallback = (data: unknown) => Promise<unknown>
export class WebSocketChannel implements CallbackBasedChannel {
    constructor(public server: Server) {}
    setup(callback: JSONRPCHandlerCallback) {
        const f = (ws: WebSocket) => {
            ws.on('message', (data) => callback(data).then((x) => x && ws.send(x as any)))
        }
        this.server.on('connection', f)
        return () => this.server.off('connection', f)
    }
}
