import { Server } from 'https://deno.land/std/http/server.ts'
import { acceptWebSocket, WebSocket } from 'https://deno.land/std/ws/mod.ts'

type CE = CustomEvent<[unknown, WebSocket]>
export class WebSocketChannel extends EventTarget {
    constructor(public server: Server, private key: string = 'async-call') {
        super()
        this.acceptRequest().catch((error) => this.dispatchEvent(new ErrorEvent('error', { error })))
    }
    async acceptRequest() {
        for await (const req of this.server) {
            const { conn, r: bufReader, w: bufWriter, headers } = req
            const ws = await acceptWebSocket({
                conn,
                bufReader,
                bufWriter,
                headers,
            })
            this.handledWebSocket(ws).catch((error) => this.dispatchEvent(new ErrorEvent('wserror', { error })))
        }
    }
    async handledWebSocket(websocket: WebSocket) {
        for await (const event of websocket) {
            this.dispatchEvent(new CustomEvent(this.key, { detail: [event, websocket] }) as CE)
        }
    }
    on(event: string, eventListener: (data: unknown, source: WebSocket) => void): void {
        this.addEventListener(this.key, (e) => {
            const ee = e as CE
            eventListener(ee.detail[0], ee.detail[1])
        })
    }
    emit(event: string, data: any, source: WebSocket): void {
        source.send(data)
    }
}
