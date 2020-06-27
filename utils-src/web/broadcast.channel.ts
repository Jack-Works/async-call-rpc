import type { AsyncCallMessageChannel } from '../shared'

/**
 * BroadcastChannel support for AsyncCall.
 * Please make sure your serializer can convert JSON RPC payload into one of the following data types:
 * - Data that can be [structure cloned](http://mdn.io/structure-clone)
 */
export class BroadcastMessageChannel extends BroadcastChannel implements AsyncCallMessageChannel {
    on(event: string, eventListener: (data: unknown) => void): void {
        this.addEventListener('message', (e) => eventListener(e.data))
    }
    emit(event: string, data: any): void {
        super.postMessage(data)
    }
}
