/**
 * See the document at https://github.com/Jack-Works/async-call/
 */
import { AsyncCallOptions, AsyncCall } from './Async-Call'
import { AsyncCallIgnoreResponse } from './utils/internalSymbol'
import { normalizeStrictOptions } from './utils/normalizeOptions'
import { generateRandomID } from './utils/generateRandomID'

const AsyncIteratorStart = Symbol.for('rpc.async-iterator.start')
const AsyncIteratorNext = Symbol.for('rpc.async-iterator.next')
const AsyncIteratorReturn = Symbol.for('rpc.async-iterator.return')
const AsyncIteratorThrow = Symbol.for('rpc.async-iterator.throw')

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
    options: AsyncCallOptions,
): _AsyncGeneratorVersionOf<OtherSideImplementedFunctions> {
    const iterators = new Map<string | number, Iter>()
    const strict = normalizeStrictOptions(options.strict ?? true)
    const { idGenerator = generateRandomID } = options
    function findIterator(
        id: string,
        label: keyof Iter,
        next: (iterator: Iter) => IterResult | undefined,
    ): undefined | IterResult | typeof AsyncCallIgnoreResponse {
        const it = iterators.get(id)
        if (!it) {
            if (strict.methodNotFound) throw new Error(`Iterator ${id} not found, ${label}() failed.`)
            else return AsyncCallIgnoreResponse
        }
        const result = next(it)
        isFinished(result, () => iterators.delete(id))
        return result
    }
    const server = {
        async [AsyncIteratorStart](method, args) {
            const iteratorGenerator: unknown = Reflect.get(await thisSideImplementation, method)
            if (typeof iteratorGenerator !== 'function') {
                if (strict.methodNotFound) throw new Error(method + ' is not a function')
                else return AsyncCallIgnoreResponse
            }
            const iterator = iteratorGenerator(...args)
            const id = idGenerator()
            iterators.set(id, iterator)
            return Promise.resolve(id)
        },
        [AsyncIteratorNext](id, val) {
            return findIterator(id, 'next', (it) => it.next(val as any))
        },
        [AsyncIteratorReturn](id, val) {
            return findIterator(id, 'return', (it) => it.return?.(val))
        },
        [AsyncIteratorThrow](id, val) {
            return findIterator(id, 'throw', (it) => it.throw?.(val))
        },
    } as AsyncGeneratorInternalMethods
    const remote = AsyncCall<AsyncGeneratorInternalMethods>(server, options)
    function proxyTrap(
        _target: unknown,
        key: string | number | symbol,
    ): (...args: unknown[]) => AsyncIterableIterator<unknown> {
        if (typeof key !== 'string') throw new TypeError('[*AsyncCall] Only string can be the method name')
        return function (...args: unknown[]) {
            const id = remote[AsyncIteratorStart](key, args)
            return new AsyncGenerator(remote, id)
        }
    }
    return new Proxy({}, { get: proxyTrap }) as _AsyncGeneratorVersionOf<OtherSideImplementedFunctions>
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
const AsyncGeneratorConstructor = async function* () {}.constructor
const AsyncGeneratorConstructorPrototype = AsyncGeneratorConstructor.prototype
Object.setPrototypeOf(AsyncGenerator, AsyncGeneratorConstructorPrototype)
const AsyncGeneratorPrototype = Object.getPrototypeOf((async function* () {})())
Object.setPrototypeOf(AsyncGenerator.prototype, AsyncGeneratorPrototype)

async function isFinished(result: IterResult | undefined, cb: () => void) {
    try {
        const x = await result
        !!x?.done && cb()
    } catch {}
}

function makeIteratorResult(done: boolean, value: unknown = undefined): IteratorResult<unknown, unknown> {
    return { done, value }
}
