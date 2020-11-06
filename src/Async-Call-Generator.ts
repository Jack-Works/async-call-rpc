/**
 * See the document at https://github.com/Jack-Works/async-call/
 */
import { AsyncCallOptions, AsyncCall } from './Async-Call'
import { AsyncCallIgnoreResponse } from './utils/internalSymbol'
import { normalizeStrictOptions } from './utils/normalizeOptions'
import { generateRandomID } from './utils/generateRandomID'
import { isFunction, isString, Object_setPrototypeOf, Promise_resolve } from './utils/constants'

const i = 'rpc.async-iterator.'
// ! side effect
const AsyncIteratorStart = Symbol.for(i + 'start')
const AsyncIteratorNext = Symbol.for(i + 'next')
const AsyncIteratorReturn = Symbol.for(i + 'return')
const AsyncIteratorThrow = Symbol.for(i + 'throw')

interface AsyncGeneratorInternalMethods {
    [AsyncIteratorStart](method: string, params: unknown[]): Promise<string>
    [AsyncIteratorNext](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [AsyncIteratorReturn](id: string, value: unknown): Promise<IteratorResult<unknown>>
    [AsyncIteratorThrow](id: string, value: unknown): Promise<IteratorResult<unknown>>
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

type Iter = Iterator<unknown, unknown, unknown> | AsyncIterator<unknown>
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
 * const serverRPC = AsyncGeneratorCall<Server>({}, { channel })
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
    options: AsyncCallOptions,
): _AsyncGeneratorVersionOf<OtherSideImplementedFunctions> {
    const iterators = new Map<string | number, Iter>()
    const [methodNotFound] = normalizeStrictOptions(options.strict ?? true)
    const { idGenerator = generateRandomID } = options
    const findIterator = (
        id: string,
        next: (iterator: Iter) => IterResult | undefined | false,
    ): false | undefined | IterResult | typeof AsyncCallIgnoreResponse => {
        const it = iterators.get(id)
        if (!it) {
            if (methodNotFound) throw new Error(`Missing iter ${id}`)
            else return AsyncCallIgnoreResponse
        }
        const result = next(it)
        isFinished(result, () => iterators.delete(id))
        return result
    }
    const server = {
        async [AsyncIteratorStart](method, args) {
            const iteratorGenerator: unknown = ((await thisSideImplementation) as any)[method]
            if (!isFunction(iteratorGenerator)) {
                if (methodNotFound) throw new Error(method + ' is not a function')
                else return AsyncCallIgnoreResponse
            }
            const iterator = iteratorGenerator(...args)
            const id = idGenerator()
            iterators.set(id, iterator)
            return Promise_resolve(id)
        },
        [AsyncIteratorNext](id, val) {
            return findIterator(id, (it) => it.next(val as any))
        },
        [AsyncIteratorReturn](id, val) {
            return findIterator(id, (it) => isFunction(it.return) && it.return(val))
        },
        [AsyncIteratorThrow](id, val) {
            return findIterator(id, (it) => isFunction(it.throw) && it.throw(val))
        },
    } as AsyncGeneratorInternalMethods
    const remote = AsyncCall<AsyncGeneratorInternalMethods>(server, options)
    const proxyTrap = (cache: any, key: string): ((...args: unknown[]) => AsyncIterableIterator<unknown>) => {
        if (!isString(key)) throw new TypeError("Can't call with non-string")
        if (cache[key]) return cache[key]
        const f = (...args: unknown[]) => {
            const id = remote[AsyncIteratorStart](key, args)
            return new AsyncGenerator(remote, id)
        }
        Object.defineProperty(cache, key, { value: f, configurable: true })
        return f
    }
    return new Proxy({ __proto__: null }, { get: proxyTrap }) as _AsyncGeneratorVersionOf<OtherSideImplementedFunctions>
}
class AsyncGenerator implements AsyncIterableIterator<unknown>, AsyncIterator<unknown, unknown, unknown> {
    /** done? */
    private d: boolean = false
    /** check */
    private c = async (val: IterResult) => {
        await isFinished(val, () => (this.d = true))
        return val
    }
    /**
     * @param r Remote Implementation
     * @param i id
     */
    constructor(private r: AsyncGeneratorInternalMethods, private i: Promise<string>) {}
    async return(val: unknown) {
        if (!this.d) this.c(this.r[AsyncIteratorReturn](await this.i, val)).catch(() => {})
        this.d = true
        return makeIteratorResult(true, val)
    }
    async next(val?: unknown) {
        if (this.d) return makeIteratorResult(true)
        return await this.c(this.r[AsyncIteratorNext](await this.i, val))
    }
    async throw(val?: unknown) {
        if (!this.d) return await this.c(this.r[AsyncIteratorThrow](await this.i, val))
        throw val
    }
    // Inherited from AsyncGeneratorPrototype
    declare [Symbol.asyncIterator]: () => this
}
// ! side effect
const AsyncGeneratorConstructor = async function* () {}.constructor
const AsyncGeneratorConstructorPrototype = AsyncGeneratorConstructor.prototype
Object_setPrototypeOf(AsyncGenerator, AsyncGeneratorConstructorPrototype)
const AsyncGeneratorPrototype = Object.getPrototypeOf((async function* () {})())
Object_setPrototypeOf(AsyncGenerator.prototype, AsyncGeneratorPrototype)

const isFinished = async (result: IterResult | undefined | false, cb: () => void) => {
    try {
        const x = await result
        if (x && x.done) cb()
    } catch {}
}

const makeIteratorResult = (done: boolean, value: unknown = undefined): IteratorResult<unknown, unknown> => ({
    done,
    value,
})
