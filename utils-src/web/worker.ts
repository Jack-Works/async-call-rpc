import type { EventBasedChannel } from 'async-call-rpc'

export class WorkerChannel implements EventBasedChannel {
    /**
     * @param worker Pass the Worker in the main thread.
     */
    constructor(public worker: Worker = self as any) {}
    on(listener: (data: unknown) => void): void | (() => void) {
        const f = (ev: MessageEvent): void => listener(ev.data)
        this.worker.addEventListener('message', f)
        return () => this.worker.removeEventListener('message', f)
    }
    send(data: unknown): void {
        this.worker.postMessage(data)
    }
}
