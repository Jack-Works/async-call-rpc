import { isString } from '../utils/constants'
import { AsyncCallBatch, AsyncCallNotify } from '../utils/internalSymbol'
import type { Request } from '../utils/jsonrpc'
/**
 * Wrap the AsyncCall instance to use batch call.
 * @param asyncCallInstance - The AsyncCall instance
 * @example
 * const [batched, send, drop] = batch(AsyncCall(...))
 * batched.call1() // pending
 * batched.call2() // pending
 * send() // send all pending requests
 * drop() // drop all pending requests
 * @returns It will return a tuple.
 *
 * The first item is the batched version of AsyncCall instance passed in.
 *
 * The second item is a function to send all pending requests.
 *
 * The third item is a function to drop and reject all pending requests.
 * @public
 */
export function batch<T extends object>(asyncCallInstance: T): [T, () => void, (error?: unknown) => void] {
    let queue: BatchQueue = [] as any
    return [
        new Proxy({ __proto__: null } as any, {
            get(cache, p) {
                if (isString(p) && cache[p]) return cache[p]
                // @ts-ignore
                const f = (...args: any) => asyncCallInstance[AsyncCallBatch](queue, p, ...args)
                // @ts-ignore
                f[AsyncCallNotify] = (...args: any) =>
                    // @ts-ignore
                    asyncCallInstance[AsyncCallBatch][AsyncCallNotify](queue, p, ...args)
                // @ts-ignore
                f[AsyncCallNotify][AsyncCallNotify] = f[AsyncCallNotify]
                isString(p) && Object.defineProperty(cache, p, { value: f, configurable: true })
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
