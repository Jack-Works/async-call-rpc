import { AsyncCallNotify } from '../utils/internalSymbol'
import { _IgnoreResponse } from '../Async-Call'
/**
 * Wrap the AsyncCall instance to send notification.
 * @param instanceOrFnOnInstance The AsyncCall instance or function on the AsyncCall instance
 * @example
 * const notifyOnly = notify(AsyncCall(...))
 */

export function notify<T extends object>(instanceOrFnOnInstance: T): _IgnoreResponse<T> {
    if (typeof instanceOrFnOnInstance === 'function') return (instanceOrFnOnInstance as any)[AsyncCallNotify]
    return new Proxy(instanceOrFnOnInstance, { get: notifyTrap }) as any
}
function notifyTrap(target: any, p: string | number | symbol) {
    return target[p][AsyncCallNotify]
}
