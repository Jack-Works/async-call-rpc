import { AsyncCallNotify } from '../utils/internalSymbol.ts'
import { isFunction } from '../utils/constants.ts'

/**
 * Make the returning type to `Promise<void>`
 * @internal
 * @remarks
 * Due to the limitation of TypeScript, generic signatures cannot be preserved
 * if the function is the top level parameter of this utility type,
 * or the function is not returning `Promise<void>`.
 */
export type _IgnoreResponse<T> = T extends (...args: infer Args) => unknown
    ? (...args: Args) => Promise<void>
    : {
          [key in keyof T as T[key] extends Function ? key : never]: T[key] extends (
              ...args: infer Args
          ) => infer Return
              ? Return extends Promise<void>
                  ? T[key]
                  : (...args: Args) => Promise<void>
              : never
      }
/**
 * Wrap the AsyncCall instance to send notification.
 * @param instanceOrFnOnInstance - The AsyncCall instance or function on the AsyncCall instance
 * @example
 * const notifyOnly = notify(AsyncCall(...))
 * @public
 */

export function notify<T extends object>(instanceOrFnOnInstance: T): _IgnoreResponse<T> {
    if (isFunction(instanceOrFnOnInstance)) return (instanceOrFnOnInstance as any)[AsyncCallNotify]
    return new Proxy(instanceOrFnOnInstance, { get: notifyTrap }) as any
}
const notifyTrap = (target: any, p: string | number | symbol) => {
    return target[p][AsyncCallNotify]
}
