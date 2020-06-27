import type { Server } from 'ws'
import type WebSocket from 'ws'
import type { AsyncCallMessageChannel } from '../shared'
import { EventEmitter } from 'events'
export class WebsocketChannel implements AsyncCallMessageChannel {
    private emitter = new EventEmitter()
    constructor(public server: Server, private key = '') {
        server.on('connection', (ws) => ws.on('message', (data) => this.emitter.emit(this.key, data, ws)))
    }
    on(event: string, eventListener: (data: unknown, source: WebSocket) => void): void {
        this.emitter.on(this.key, eventListener)
    }
    emit(event: string, data: unknown, source: WebSocket): void {
        source.send(data)
    }
}
