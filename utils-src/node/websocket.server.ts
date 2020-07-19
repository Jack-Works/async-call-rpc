import type { Server } from 'ws'
import type WebSocket from 'ws'
import type { CallbackBasedChannel } from '../../src/Async-Call'
type JSONRPCHandlerCallback = (data: unknown) => Promise<unknown>
export class WebSocketChannel implements CallbackBasedChannel {
    constructor(public server: Server) {}
    setup(callback: JSONRPCHandlerCallback) {
        const f = (ws: WebSocket) => {
            ws.on('message', (data) => callback(data).then((x) => x && ws.send(x)))
        }
        this.server.on('connection', f)
        return () => this.server.off('connection', f)
    }
}
