import { AsyncCallNotify } from '../utils/internalSymbol'
import { _IgnoreResponse } from '../Async-Call'
import { isFunction } from '../utils/constants'
/**
 * Wrap the AsyncCall instance to send notification.
 * @param instanceOrFnOnInstance - The AsyncCall instance or function on the AsyncCall instance
 * @example
 * const notifyOnly = notify(AsyncCall(...))
 * @public
 */

export const notify = <T extends object>(instanceOrFnOnInstance: T): _IgnoreResponse<T> => {
    if (isFunction(instanceOrFnOnInstance)) return (instanceOrFnOnInstance as any)[AsyncCallNotify]
    return new Proxy(instanceOrFnOnInstance, { get: notifyTrap }) as any
}
const notifyTrap = (target: any, p: string | number | symbol) => {
    return target[p][AsyncCallNotify]
}
