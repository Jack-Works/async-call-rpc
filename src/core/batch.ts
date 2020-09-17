import { AsyncCallBatch, AsyncCallNotify } from '../utils/internalSymbol'
import { Request } from '../utils/jsonrpc'
/**
 * Wrap the AsyncCall instance to use batch call.
 * @param asyncCallInstance - The AsyncCall instance
 * @example
 * const [batched, send, drop] = batch(AsyncCall(...))
 * @public
 */
export const batch = <T extends object>(asyncCallInstance: T): [T, () => void, (error?: unknown) => void] => {
    let queue: BatchQueue = [] as any
    return [
        new Proxy(asyncCallInstance, {
            get(target: any, p) {
                const f = (...args: any) => target[AsyncCallBatch](queue, p, ...args)
                // @ts-ignore
                f[AsyncCallNotify] = (...args: any) => target[AsyncCallBatch][AsyncCallNotify](queue, p, ...args)
                // @ts-ignore
                f[AsyncCallNotify][AsyncCallNotify] = f[AsyncCallNotify]
                return f
            },
        }),
        (r = queue.r) => r && r[0](),
        (error = new Error('Aborted'), r = queue.r) => {
            r && r[1](error)
            queue = []
        },
    ]
}
export type BatchQueue = Request[] & { r?: [() => void, (error?: unknown) => void] }
