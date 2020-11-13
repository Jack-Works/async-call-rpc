import type { EventBasedChannel } from 'async-call-rpc'

/**
 * BroadcastChannel support for AsyncCall.
 * Please make sure your serializer can convert JSON RPC payload into one of the following data types:
 * - Data that can be [structure cloned](http://mdn.io/structure-clone)
 */
export class BroadcastMessageChannel extends BroadcastChannel implements EventBasedChannel {
    on(eventListener: (data: unknown) => void) {
        const f = (e: MessageEvent): void => eventListener(e.data)
        this.addEventListener('message', f)
        return () => this.removeEventListener('message', f)
    }
    send(data: any) {
        super.postMessage(data)
    }
}
