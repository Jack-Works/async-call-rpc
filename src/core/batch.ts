/**
 * Wrap the AsyncCall instance to use batch call.
 * @param asyncCallInstance
 * @example
 * const [batched, send, drop] = batch(AsyncCall(...))
 */

export function batch<T>(asyncCallInstance: T): [T, () => void, () => void] {
    return [asyncCallInstance, () => {}, () => {}]
}
