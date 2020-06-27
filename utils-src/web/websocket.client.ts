import type { AsyncCallMessageChannel } from '../shared'

/**
 * WebSocket support for AsyncCall.
 * Please make sure your serializer can convert JSON RPC payload into one of the following data types:
 *
 * - string
 * - ArrayBuffer
 * - SharedArrayBuffer
 * - Blob
 * - ArrayBufferView
 */
export class WebSocketMessageChannel extends WebSocket implements AsyncCallMessageChannel {
    on(event: string, eventListener: (data: unknown) => void): void {
        this.addEventListener('message', (e) => eventListener(e.data))
    }
    emit(event: string, data: any): void {
        if (this.readyState === this.CONNECTING) this.addEventListener('open', () => this.send(data), { once: true })
        else super.send(data)
    }
}
