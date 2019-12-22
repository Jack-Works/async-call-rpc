import {
    AsyncCallOptions,
    AsyncCall,
    _calcStrictOptions,
    _generateRandomID,
    _AsyncIteratorStart,
    _AsyncIteratorNext,
    _AsyncIteratorReturn,
    _AsyncIteratorThrow,
    _AsyncCallIgnoreResponse,
} from './Async-Call'

interface AsyncGeneratorInternalMethods {
    [_AsyncIteratorStart](method: string, params: unknown[]): Promise<string>
    [_AsyncIteratorNext](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [_AsyncIteratorReturn](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [_AsyncIteratorThrow](id: string, value: unknown): Promise<IteratorResult<unknown>>
}
/**
 * Unbox the Promise<T> into T if possible
 * @internal
 */
export type _UnboxPromise<T> = T extends PromiseLike<infer U> ? U : T

/**
 * Make all generator in the type T becomes AsyncGenerator
 * @internal
 */
export type _MakeAllGeneratorFunctionsAsync<T> = {
    [key in keyof T]: T[key] extends (
        ...args: infer Args
    ) => Iterator<infer Yield, infer Return, infer Next> | AsyncIterator<infer Yield, infer Return, infer Next>
        ? (
              ...args: Args
          ) => AsyncIterator<_UnboxPromise<Yield>, _UnboxPromise<Return>, _UnboxPromise<Next>> & {
              [Symbol.asyncIterator](): AsyncIterator<_UnboxPromise<Yield>, _UnboxPromise<Return>, _UnboxPromise<Next>>
          }
        : T[key]
}
/**
 * This function provides the async generator version of the AsyncCall
 * @public
 */
export function AsyncGeneratorCall<OtherSideImplementedFunctions = {}>(
    implementation: object = {},
    options: Partial<AsyncCallOptions> & Pick<AsyncCallOptions, 'messageChannel'>,
): _MakeAllGeneratorFunctionsAsync<OtherSideImplementedFunctions> {
    const iterators = new Map<string, Iterator<unknown> | AsyncIterator<unknown>>()
    const strict = _calcStrictOptions(options.strict || false)
    function findIterator(id: string, label: string) {
        const it = iterators.get(id)
        if (!it) {
            if (strict.methodNotFound) throw new Error(`Remote iterator not found while executing ${label}`)
            else return _AsyncCallIgnoreResponse
        }
        return it
    }
    const server = {
        [_AsyncIteratorStart](method, args) {
            const iteratorGenerator: unknown = Reflect.get(implementation, method)
            if (typeof iteratorGenerator !== 'function') {
                if (strict.methodNotFound) throw new Error(method + ' is not a function')
                else return _AsyncCallIgnoreResponse
            }
            const iterator = iteratorGenerator(...args)
            const id = _generateRandomID()
            iterators.set(id, iterator)
            return Promise.resolve(id)
        },
        [_AsyncIteratorNext](id, val) {
            const it = findIterator(id, 'next')
            if (it !== _AsyncCallIgnoreResponse) return it.next(val as any)
            return it
        },
        [_AsyncIteratorReturn](id, val) {
            const it = findIterator(id, 'return')
            if (it !== _AsyncCallIgnoreResponse) return it.return!(val)
            return _AsyncCallIgnoreResponse
        },
        [_AsyncIteratorThrow](id, val) {
            const it = findIterator(id, 'throw')
            if (it !== _AsyncCallIgnoreResponse) return it.throw!(val)
            return _AsyncCallIgnoreResponse
        },
    } as AsyncGeneratorInternalMethods
    const remote = AsyncCall<AsyncGeneratorInternalMethods>(server, options)
    function proxyTrap(
        _target: unknown,
        key: string | number | symbol,
    ): (...args: unknown[]) => AsyncIterableIterator<unknown> {
        if (typeof key !== 'string') throw new TypeError('[*AsyncCall] Only string can be the method name')
        return function(...args: unknown[]) {
            const id = remote[_AsyncIteratorStart](key, args)
            return new (class implements AsyncIterableIterator<unknown>, AsyncIterator<unknown, unknown, unknown> {
                async return(val: unknown) {
                    return remote[_AsyncIteratorReturn](await id, val)
                }
                async next(val?: unknown) {
                    return remote[_AsyncIteratorNext](await id, val)
                }
                async throw(val?: unknown) {
                    return remote[_AsyncIteratorThrow](await id, val)
                }
                [Symbol.asyncIterator]() {
                    return this
                }
                [Symbol.toStringTag] = key
            })()
        }
    }
    return new Proxy({}, { get: proxyTrap }) as _MakeAllGeneratorFunctionsAsync<OtherSideImplementedFunctions>
}
