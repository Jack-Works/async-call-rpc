import {
    AsyncCallOptions,
    AsyncCall,
    calcStrictOptions,
    generateRandomID,
    $AsyncIteratorStart,
    $AsyncIteratorNext,
    $AsyncIteratorReturn,
    $AsyncIteratorThrow,
    $AsyncCallIgnoreResponse,
} from './Async-Call'

interface AsyncGeneratorInternalMethods {
    [$AsyncIteratorStart](method: string, params: unknown[]): Promise<string>
    [$AsyncIteratorNext](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [$AsyncIteratorReturn](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [$AsyncIteratorThrow](id: string, value: unknown): Promise<IteratorResult<unknown>>
}
/**
 * Unbox the Promise<T> into T if possible
 */
export type UnboxPromise<T> = T extends PromiseLike<infer U> ? U : T

/**
 * Make all generator in the type T becomes AsyncGenerator
 */
export type MakeAllGeneratorFunctionsAsync<T> = {
    [key in keyof T]: T[key] extends (
        ...args: infer Args
    ) => Iterator<infer Yield, infer Return, infer Next> | AsyncIterator<infer Yield, infer Return, infer Next>
        ? (
              ...args: Args
          ) => AsyncIterator<UnboxPromise<Yield>, UnboxPromise<Return>, UnboxPromise<Next>> & {
              [Symbol.asyncIterator](): AsyncIterator<UnboxPromise<Yield>, UnboxPromise<Return>, UnboxPromise<Next>>
          }
        : T[key]
}
/**
 * This function provides the async generator version of the AsyncCall
 */
export function AsyncGeneratorCall<OtherSideImplementedFunctions = {}>(
    implementation: object = {},
    options: Partial<AsyncCallOptions> & Pick<AsyncCallOptions, 'messageChannel'>,
): MakeAllGeneratorFunctionsAsync<OtherSideImplementedFunctions> {
    const iterators = new Map<string, Iterator<unknown> | AsyncIterator<unknown>>()
    const strict = calcStrictOptions(options.strict || false)
    function findIterator(id: string, label: string) {
        const it = iterators.get(id)
        if (!it) {
            if (strict.methodNotFound) throw new Error(`Remote iterator not found while executing ${label}`)
            else return $AsyncCallIgnoreResponse
        }
        return it
    }
    const server = {
        [$AsyncIteratorStart](method, args) {
            const iteratorGenerator: unknown = Reflect.get(implementation, method)
            if (typeof iteratorGenerator !== 'function') {
                if (strict.methodNotFound) throw new Error(method + ' is not a function')
                else return $AsyncCallIgnoreResponse
            }
            const iterator = iteratorGenerator(...args)
            const id = generateRandomID()
            iterators.set(id, iterator)
            return Promise.resolve(id)
        },
        [$AsyncIteratorNext](id, val) {
            const it = findIterator(id, 'next')
            if (it !== $AsyncCallIgnoreResponse) return it.next(val as any)
            return it
        },
        [$AsyncIteratorReturn](id, val) {
            const it = findIterator(id, 'return')
            if (it !== $AsyncCallIgnoreResponse) return it.return!(val)
            return $AsyncCallIgnoreResponse
        },
        [$AsyncIteratorThrow](id, val) {
            const it = findIterator(id, 'throw')
            if (it !== $AsyncCallIgnoreResponse) return it.throw!(val)
            return $AsyncCallIgnoreResponse
        },
    } as AsyncGeneratorInternalMethods
    const remote = AsyncCall<AsyncGeneratorInternalMethods>(server, options)
    function proxyTrap(
        _target: unknown,
        key: string | number | symbol,
    ): (...args: unknown[]) => AsyncIterableIterator<unknown> {
        if (typeof key !== 'string') throw new TypeError('[*AsyncCall] Only string can be the method name')
        return function(...args: unknown[]) {
            const id = remote[$AsyncIteratorStart](key, args)
            return new (class implements AsyncIterableIterator<unknown>, AsyncIterator<unknown, unknown, unknown> {
                async return(val: unknown) {
                    return remote[$AsyncIteratorReturn](await id, val)
                }
                async next(val?: unknown) {
                    return remote[$AsyncIteratorNext](await id, val)
                }
                async throw(val?: unknown) {
                    return remote[$AsyncIteratorThrow](await id, val)
                }
                [Symbol.asyncIterator]() {
                    return this
                }
                [Symbol.toStringTag] = key
            })()
        }
    }
    return new Proxy({}, { get: proxyTrap }) as MakeAllGeneratorFunctionsAsync<OtherSideImplementedFunctions>
}
