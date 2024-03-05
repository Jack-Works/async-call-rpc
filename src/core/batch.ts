import { isString } from '../utils/constants.ts'
import { AsyncCallBatch, AsyncCallNotify } from '../utils/internalSymbol.ts'
import type { Request } from '../types.ts'
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
// TODO: use private field in the future.
export function batch<T extends object>(asyncCallInstance: T): [T, () => void, (error?: unknown) => void] {
    const queue: BatchQueue = []
    const getTrap = new Proxy(
        {},
        {
            get(_, p) {
                // @ts-expect-error
                const f = (...args: any) => asyncCallInstance[AsyncCallBatch](queue, p, ...args)
                // @ts-expect-error
                f[AsyncCallNotify] = (...args: any) =>
                    // @ts-expect-error
                    asyncCallInstance[AsyncCallBatch][AsyncCallNotify](queue, p, ...args)
                f[AsyncCallNotify][AsyncCallNotify] = f[AsyncCallNotify]
                isString(p) && Object.defineProperty(methodContainer, p, { value: f, configurable: true })
                return f
            },
        },
    )
    const methodContainer = { __proto__: getTrap } as any
    return [
        new Proxy(methodContainer, {
            getPrototypeOf: () => null,
            setPrototypeOf: (_, value) => value === null,
        }),
        () => {
            queue.length && queue.r![0]()
            queue.length = 0
        },
        (error = new Error('Aborted')) => {
            queue.length && queue.r![1](error)
            queue.length = 0
        },
    ]
}
export type BatchQueue = Request[] & {
    /** Request handler */
    r?: [emit: () => void, reject: (error?: unknown) => void]
}
