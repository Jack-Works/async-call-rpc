/**
 * See the document at https://github.com/Jack-Works/async-call/
 */
import {
    AsyncCallOptions,
    AsyncCall,
    _calcStrictOptions,
    _generateRandomID,
    _AsyncCallIgnoreResponse,
} from './Async-Call.js'

const _AsyncIteratorStart = Symbol.for('rpc.async-iterator.start')
const _AsyncIteratorNext = Symbol.for('rpc.async-iterator.next')
const _AsyncIteratorReturn = Symbol.for('rpc.async-iterator.return')
const _AsyncIteratorThrow = Symbol.for('rpc.async-iterator.throw')

interface AsyncGeneratorInternalMethods {
    [_AsyncIteratorStart](method: string, params: unknown[]): Promise<string>
    [_AsyncIteratorNext](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [_AsyncIteratorReturn](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [_AsyncIteratorThrow](id: string, value: unknown): Promise<IteratorResult<unknown>>
}
/**
 * Unbox the Promise<T> into T if possiblea   aaaaaaaaaaaa
 * @internal
 */
export type _UnboxPromise<T> = T extends PromiseLike<infer U> ? U : T

/**
 * Make all generator in the type T becomes AsyncGenerator
 * @internal
 */
export type _AsyncGeneratorVersionOf<T> = {
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

type Iter = Iterator<unknown> | AsyncIterator<unknown>
type IterResult = IteratorResult<unknown> | Promise<IteratorResult<unknown>>
/**
 * The async generator version of the AsyncCall
 * @param thisSideImplementation - The implementation when this AsyncCall acts as a JSON RPC server.
 * @param options - {@link AsyncCallOptions}
 * @typeParam OtherSideImplementedFunctions - The type of the API that server expose. For any function on this interface, AsyncCall will convert it to the Promised type.
 * @remarks
 *
 * To use AsyncGeneratorCall, the server and the client MUST support the following JSON RPC internal methods:
 *
 * Warning: Due to technical limitation, AsyncGeneratorCall will leak memory before
 * {@link https://github.com/tc39/proposal-weakrefs | the ECMAScript WeakRef proposal} shipped.
 *
 * - `rpc.async-iterator.start`
 *
 * - `rpc.async-iterator.next`
 *
 * - `rpc.async-iterator.return`
 *
 * - `rpc.async-iterator.throw`
 *
 * @example
 * ```ts
 * const server = {
 *      async *generator() {
 *          let last = 0
 *          while (true) yield last++
 *      },
 * }
 * type Server = typeof server
 * const serverRPC = AsyncGeneratorCall<Server>({}, { messageChannel })
 * async function main() {
 *      for await (const x of serverRPC.generator()) {
 *          console.log('Server yielded number', x)
 *      }
 * }
 * ```
 * @public
 */
export function AsyncGeneratorCall<OtherSideImplementedFunctions = {}>(
    thisSideImplementation: object | Promise<object> = {},
    options: Partial<AsyncCallOptions> & Pick<AsyncCallOptions, 'messageChannel'>,
): _AsyncGeneratorVersionOf<OtherSideImplementedFunctions> {
    const iterators = new Map<string, Iter>()
    const strict = _calcStrictOptions(options.strict || false)
    function findIterator(
        id: string,
        label: keyof Iter,
        next: (iterator: Iter) => IterResult | undefined,
    ): undefined | IterResult | typeof _AsyncCallIgnoreResponse {
        const it = iterators.get(id)
        if (!it) {
            if (strict.methodNotFound) throw new Error(`Remote iterator not found while executing ${label}`)
            else return _AsyncCallIgnoreResponse
        }
        const result = next(it)
        isFinished(result).then(x => x && iterators.delete(id))
        return result
    }
    const server = {
        async [_AsyncIteratorStart](method, args) {
            const iteratorGenerator: unknown = Reflect.get(await thisSideImplementation, method)
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
            return findIterator(id, 'next', it => it.next(val as any))
        },
        [_AsyncIteratorReturn](id, val) {
            return findIterator(id, 'return', it => it.return?.(val))
        },
        [_AsyncIteratorThrow](id, val) {
            return findIterator(id, 'throw', it => it.throw?.(val))
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
            return new AsyncGenerator(remote, id)
        }
    }
    return new Proxy({}, { get: proxyTrap }) as _AsyncGeneratorVersionOf<OtherSideImplementedFunctions>
}
class AsyncGenerator implements AsyncIterableIterator<unknown>, AsyncIterator<unknown, unknown, unknown> {
    #remoteImpl: AsyncGeneratorInternalMethods
    #id: Promise<string>
    #done: boolean
    #check = (val: IterResult) => {
        isFinished(val).then(x => {
            if (x) this.#done = true
        })
        return val
    }
    constructor(remoteImpl: AsyncGeneratorInternalMethods, id: Promise<string>) {
        this.#remoteImpl = remoteImpl
        this.#id = id
        this.#done = false
    }
    async return(val: unknown) {
        if (this.#done) return Promise.resolve({ done: true, value: val })
        return this.#check(this.#remoteImpl[_AsyncIteratorReturn](await this.#id, val))
    }
    async next(val?: unknown) {
        if (this.#done) return Promise.resolve({ done: true, value: undefined })
        return this.#check(this.#remoteImpl[_AsyncIteratorNext](await this.#id, val))
    }
    async throw(val?: unknown) {
        if (this.#done) return Promise.reject(val)
        return this.#check(this.#remoteImpl[_AsyncIteratorThrow](await this.#id, val))
    }
    [Symbol.asyncIterator]() {
        return this
    }
}
function isFinished(result?: IterResult) {
    return Promise.resolve(result)
        .then(x => x ?? { done: true, value: undefined })
        .then(x => !!x.done)
}
