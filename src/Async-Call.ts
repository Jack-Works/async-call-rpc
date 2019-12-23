/**
 * See the document at https://github.com/Jack-Works/async-call/
 */
//#region Serialization
/**
 * Serialization and deserialization of the JSON RPC payload
 * @public
 */
export interface Serialization {
    /**
     * Do serialization
     * @param from - original data
     */
    serialization(from: any): PromiseLike<unknown>
    /**
     * Do deserialization
     * @param serialized - Serialized data
     */
    deserialization(serialized: unknown): PromiseLike<any>
}

/**
 * Serialization implementation that do nothing
 * @remarks {@link Serialization}
 * @public
 */
export const NoSerialization: Serialization = {
    async serialization(from) {
        return from
    },
    async deserialization(serialized) {
        return serialized
    },
}

/**
 * Create a serialization by JSON.parse/stringify
 *
 * @param replacerAndReceiver - Replacer and receiver of JSON.parse/stringify
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @remarks {@link Serialization}
 * @public
 */
export const JSONSerialization = (
    replacerAndReceiver: [Parameters<JSON['stringify']>[1], Parameters<JSON['parse']>[1]] = [undefined, undefined],
    space?: string | number | undefined,
) =>
    ({
        async serialization(from) {
            return JSON.stringify(from, replacerAndReceiver[0], space)
        },
        async deserialization(serialized) {
            return JSON.parse(serialized as string, replacerAndReceiver[1])
        },
    } as Serialization)

/**
 * What should AsyncCall log to console.
 * @public
 */
export interface AsyncCallLogLevel {
    /**
     * Print the log from the client when act as server
     * @defaultValue true
     */
    beCalled?: boolean
    /**
     * Print errors of self when act as a server
     * @defaultValue true
     */
    localError?: boolean
    /**
     * Print remote errors when act as a client
     * @defaultValue true
     */
    remoteError?: boolean
    /**
     * Send the local call stack to remote when act as a client
     * @defaultValue false
     */
    sendLocalStack?: boolean
    /**
     * How to print the log, 'pretty' is recommended in browser.
     * @defaultValue 'pretty'
     */
    type?: 'basic' | 'pretty'
}

/**
 * Control the behavior that different from the JSON RPC spec.
 * @public
 */
export interface AsyncCallStrictJSONRPC {
    /**
     * Return an error when the requested method is not defined
     * @defaultValue false
     */
    methodNotFound?: boolean
    /**
     * don't try to keep `undefined` result (then it will be `null`)
     * @defaultValue false
     */
    noUndefined?: boolean
    /**
     * send an error when receive invalid JSON RPC payload
     * @defaultValue false
     */
    unknownMessage?: boolean
}
//#endregion

/**
 * Options for {@link AsyncCall}
 * @public
 */
export interface AsyncCallOptions {
    /**
     * A key to prevent collision with other AsyncCalls.
     *
     * @remarks
     * The value can be anything, but need to be same on both sides.
     *
     * This option is useful when you want to run multiple AsyncCall instances on the same message channel.
     *
     * @example
     * these two AsyncCall run on the same channel but they won't affect each other.
     * ```ts
     * AsyncCall({}, { messageChannel, key: 'app1' })
     * AsyncCall({}, { messageChannel, key: 'app2' })
     * ```
     *
     * @defaultValue `default-jsonrpc`
     */
    key: string
    /**
     * How to serialization and deserialization JSON RPC payload
     *
     * @remarks
     * See {@link Serialization}.
     * There is some built-in serializer:
     *
     * - {@link NoSerialization} (Do not do any serialization)
     *
     * - {@link JSONSerialization} (Use JSON.parse/stringify)
     *
     * @defaultValue {@link NoSerialization}
     */
    serializer: Serialization
    /**
     * The message channel can let you transport messages between server and client
     * @example
     * ```ts
     * const messageChannel = {
     *      on(event, callback) {
     *          document.addEventListener('remote-data', x => callback(x.details))
     *      }
     *      emit(event, data) {
     *          fetch('/server', { body: data })
     *      }
     * }
     * ```
     */
    messageChannel: {
        on(event: string, callback: (data: unknown) => void): void
        emit(event: string, data: unknown): void
    }
    /**
     * Choose log level. See {@link AsyncCallLogLevel}
     * @defaultValue true
     */
    log: AsyncCallLogLevel | boolean
    /**
     * Strict options. See {@link AsyncCallStrictJSONRPC}
     * @defaultValue false
     */
    strict: AsyncCallStrictJSONRPC | boolean
    /**
     * How parameters passed to remote
     * @remarks
     * See {@link https://www.jsonrpc.org/specification#parameter_structures}
     * @defaultValue "by-position"
     */
    parameterStructures: 'by-position' | 'by-name'
    /**
     * Prefer local implementation than remote.
     * @remarks
     * If you call a RPC method and it is also defined in the local, open this flag will call the local implementation directly instead of send a RPC request.
     * @defaultValue false
     */
    preferLocalImplementation: boolean
}

/**
 * Make all function in the type T Async
 * @internal
 */
export type _AsyncVersionOf<T> = {
    [key in keyof T]: T[key] extends (...args: infer Args) => infer Return
        ? Return extends PromiseLike<infer U>
            ? (...args: Args) => Promise<U>
            : (...args: Args) => Promise<Return>
        : never
}

const AsyncCallDefaultOptions = (<T extends Partial<AsyncCallOptions>>(a: T) => a)({
    serializer: NoSerialization,
    key: 'default-jsonrpc',
    strict: false,
    log: true,
    parameterStructures: 'by-position',
    preferLocalImplementation: false,
} as const)

/**
 * Create a RPC server & client.
 *
 * @remarks
 * See {@link AsyncCallOptions}
 *
 * @param thisSideImplementation - The implementation when this AsyncCall acts as a JSON RPC server.
 * @param options - {@link AsyncCallOptions}
 * @typeParam OtherSideImplementedFunctions - The type of the API that server expose. For any function on this interface, AsyncCall will convert it to the Promised type.
 * @returns Same as the `OtherSideImplementedFunctions` type parameter, but every function in that interface becomes async and non-function value is removed.
 * @public
 */
export function AsyncCall<OtherSideImplementedFunctions = {}>(
    thisSideImplementation: object = {},
    options: Partial<AsyncCallOptions> & Pick<AsyncCallOptions, 'messageChannel'>,
): _AsyncVersionOf<OtherSideImplementedFunctions> {
    const { serializer, key, strict, log, parameterStructures, preferLocalImplementation } = {
        ...AsyncCallDefaultOptions,
        ...options,
    }
    const message = options.messageChannel
    const {
        methodNotFound: banMethodNotFound = false,
        noUndefined: noUndefinedKeeping = false,
        unknownMessage: banUnknownMessage = false,
    } = _calcStrictOptions(strict)
    const {
        beCalled: logBeCalled = true,
        localError: logLocalError = true,
        remoteError: logRemoteError = true,
        type: logType = 'pretty',
        sendLocalStack = false,
    } = _calcLogOptions(log)
    const console = getConsole()
    type PromiseParam = Parameters<ConstructorParameters<typeof Promise>[0]>
    const requestContext = new Map<string | number, { f: PromiseParam; stack: string }>()
    async function onRequest(data: Request): Promise<Response | undefined> {
        let frameworkStack: string = ''
        try {
            // ? We're mapping any method starts with 'rpc.' to a Symbol.for
            const key = (data.method.startsWith('rpc.')
                ? Symbol.for(data.method)
                : data.method) as keyof typeof thisSideImplementation
            const executor: unknown = thisSideImplementation[key]
            if (!executor || typeof executor !== 'function') {
                if (!banMethodNotFound) {
                    if (logLocalError) console.debug('Receive remote call, but not implemented.', key, data)
                    return
                } else return ErrorResponse.MethodNotFound(data.id)
            }
            const params: unknown = data.params
            if (Array.isArray(params) || (typeof params === 'object' && params !== null)) {
                const args = Array.isArray(params) ? params : [params]
                frameworkStack = removeStackHeader(new Error().stack)
                const promise = new Promise((resolve, reject) => {
                    try {
                        resolve(executor(...args))
                    } catch (e) {
                        reject(e)
                    }
                })
                if (logBeCalled) {
                    if (logType === 'basic')
                        console.log(`${options.key}.${data.method}(${[...args].toString()}) @${data.id}`)
                    else {
                        const logArgs = [
                            `${options.key}.%c${data.method}%c(${args.map(() => '%o').join(', ')}%c)\n%o %c@${data.id}`,
                            'color: #d2c057',
                            '',
                            ...args,
                            '',
                            promise,
                            'color: gray; font-style: italic;',
                        ]
                        if (data.remoteStack) {
                            console.groupCollapsed(...logArgs)
                            console.log(data.remoteStack)
                            console.groupEnd()
                        } else console.log(...logArgs)
                    }
                }
                const result = await promise
                if (result === _AsyncCallIgnoreResponse) return
                return new SuccessResponse(data.id, await promise, !!noUndefinedKeeping)
            } else {
                return ErrorResponse.InvalidRequest(data.id)
            }
        } catch (e) {
            e.stack = frameworkStack
                .split('\n')
                .reduce((stack, fstack) => stack.replace(fstack + '\n', ''), e.stack || '')
            if (logLocalError) console.error(e)
            let name = 'Error'
            name = e.constructor.name
            const DOMException = haveDOMException()
            if (typeof DOMException === 'function' && e instanceof DOMException) name = 'DOMException:' + e.name
            return new ErrorResponse(data.id, -1, e.message, e.stack, name)
        }
    }
    async function onResponse(data: Response): Promise<void> {
        let errorMessage = '',
            remoteErrorStack = '',
            errorCode = 0,
            errorType = 'Error'
        if (hasKey(data, 'error')) {
            errorMessage = data.error.message
            errorCode = data.error.code
            remoteErrorStack = (data.error.data && data.error.data.stack) || '<remote stack not available>'
            errorType = (data.error.data && data.error.data.type) || 'Error'
            if (logRemoteError)
                logType === 'basic'
                    ? console.error(`${errorType}: ${errorMessage}(${errorCode}) @${data.id}\n${remoteErrorStack}`)
                    : console.error(
                          `${errorType}: ${errorMessage}(${errorCode}) %c@${data.id}\n%c${remoteErrorStack}`,
                          'color: gray',
                          '',
                      )
        }
        if (data.id === null || data.id === undefined) return
        const {
            f: [resolve, reject],
            stack: localErrorStack,
        } = requestContext.get(data.id) || { stack: '', f: ([null, null] as any) as PromiseParam }
        if (!resolve) return // drop this response
        requestContext.delete(data.id)
        if (hasKey(data, 'error')) {
            reject(
                RecoverError(
                    errorType,
                    errorMessage,
                    errorCode,
                    // ? We use \u0430 which looks like "a" to prevent browser think "at AsyncCall" is a real stack
                    remoteErrorStack + '\n    \u0430t AsyncCall (rpc) \n' + localErrorStack,
                ),
            )
        } else {
            resolve(data.result)
        }
    }
    message.on(key, async (_: unknown) => {
        let data: unknown
        let result: Response | undefined = undefined
        try {
            data = await serializer.deserialization(_)
            if (isJSONRPCObject(data)) {
                result = await handleSingleMessage(data)
                if (result) await send(result)
            } else if (Array.isArray(data) && data.every(isJSONRPCObject) && data.length !== 0) {
                const result = await Promise.all(data.map(handleSingleMessage))
                // ? Response
                if (data.every(x => x === undefined)) return
                await send(result.filter(x => x))
            } else {
                if (banUnknownMessage) {
                    await send(ErrorResponse.InvalidRequest((data as any).id || null))
                } else {
                    // ? Ignore this message. The message channel maybe also used to transfer other message too.
                }
            }
        } catch (e) {
            console.error(e, data, result)
            send(ErrorResponse.ParseError(e.stack))
        }
        async function send(res?: Response | (Response | undefined)[]) {
            if (Array.isArray(res)) {
                const reply = res.map(x => x).filter(x => x!.id !== undefined)
                if (reply.length === 0) return
                message.emit(key, await serializer.serialization(reply))
            } else {
                if (!res) return
                // ? This is a Notification, we MUST not return it.
                if (res.id === undefined) return
                message.emit(key, await serializer.serialization(res))
            }
        }
    })
    return new Proxy(
        {},
        {
            get(_target, method) {
                let stack = removeStackHeader(new Error().stack)
                return (...params: unknown[]) => {
                    if (typeof method !== 'string') {
                        if (typeof method === 'symbol') {
                            const internalMethod = Symbol.keyFor(method)
                            if (internalMethod) method = internalMethod
                        } else return Promise.reject(new TypeError('[AsyncCall] Only string can be the method name'))
                    } else if (method.startsWith('rpc.'))
                        return Promise.reject(
                            new TypeError('[AsyncCall] You cannot call JSON RPC internal methods directly'),
                        )
                    if (preferLocalImplementation && typeof method === 'string') {
                        const localImpl: unknown = thisSideImplementation[method as keyof typeof thisSideImplementation]
                        if (localImpl && typeof localImpl === 'function') {
                            return new Promise((resolve, reject) => {
                                try {
                                    resolve(localImpl(...params))
                                } catch (e) {
                                    reject(e)
                                }
                            })
                        }
                    }
                    return new Promise((resolve, reject) => {
                        const id = _generateRandomID()
                        const param0 = params[0]
                        const sendingStack = sendLocalStack ? stack : ''
                        const param =
                            parameterStructures === 'by-name' && params.length === 1 && isObject(param0)
                                ? param0
                                : params
                        const request = new Request(id, method as string, param, sendingStack)
                        serializer.serialization(request).then(data => {
                            message.emit(key, data)
                            requestContext.set(id, {
                                f: [resolve, reject],
                                stack,
                            })
                        }, reject)
                    })
                }
            },
        },
    ) as _AsyncVersionOf<OtherSideImplementedFunctions>

    async function handleSingleMessage(data: SuccessResponse | ErrorResponse | Request) {
        if (hasKey(data, 'method')) {
            return onRequest(data)
        } else if ('error' in data || 'result' in data) {
            onResponse(data)
        } else {
            if ('resultIsUndefined' in data) {
                ;(data as any).result = undefined
                onResponse(data)
            } else return ErrorResponse.InvalidRequest((data as any).id)
        }
        return undefined
    }
}

/** @internal */
export const _AsyncIteratorStart = Symbol.for('rpc.async-iterator.start')
/** @internal */
export const _AsyncIteratorNext = Symbol.for('rpc.async-iterator.next')
/** @internal */
export const _AsyncIteratorReturn = Symbol.for('rpc.async-iterator.return')
/** @internal */
export const _AsyncIteratorThrow = Symbol.for('rpc.async-iterator.throw')
/** @internal */
export const _AsyncCallIgnoreResponse = Symbol.for('AsyncCall: This response should be ignored.')

/** @internal */
export function _generateRandomID() {
    return Math.random()
        .toString(36)
        .slice(2)
}

/**
 * @internal
 */
function _calcLogOptions(log: AsyncCallOptions['log']): AsyncCallLogLevel {
    const logAllOn = { beCalled: true, localError: true, remoteError: true, type: 'pretty' } as const
    const logAllOff = { beCalled: false, localError: false, remoteError: false, type: 'basic' } as const
    return typeof log === 'boolean' ? (log ? logAllOn : logAllOff) : log
}

/**
 * @internal
 */
export function _calcStrictOptions(strict: AsyncCallOptions['strict']): AsyncCallStrictJSONRPC {
    const strictAllOn = { methodNotFound: true, unknownMessage: true, noUndefined: true }
    const strictAllOff = { methodNotFound: false, unknownMessage: false, noUndefined: false }
    return typeof strict === 'boolean' ? (strict ? strictAllOn : strictAllOff) : strict
}

const jsonrpc = '2.0'
type ID = string | number | null | undefined
class Request {
    readonly jsonrpc = '2.0'
    constructor(public id: ID, public method: string, public params: unknown[] | object, public remoteStack: string) {
        const request: Request = { id, method, params, jsonrpc, remoteStack }
        if (request.remoteStack.length === 0) delete request.remoteStack
        return request
    }
}
class SuccessResponse {
    readonly jsonrpc = '2.0'
    // ? This is not in the spec !
    resultIsUndefined?: boolean
    constructor(public id: ID, public result: any, noUndefinedKeeping: boolean) {
        const obj = { id, jsonrpc, result: result === undefined ? null : result } as this
        if (!noUndefinedKeeping && result === undefined) obj.resultIsUndefined = true
        return obj
    }
}
class ErrorResponse {
    readonly jsonrpc = '2.0'
    error: { code: number; message: string; data?: { stack?: string; type?: string } }
    constructor(public id: ID, code: number, message: string, stack: string, type: string = 'Error') {
        if (id === undefined) id = null
        code = Math.floor(code)
        const error = (this.error = { code, message, data: { stack, type } })
        return { error, id, jsonrpc }
    }
    // Pre defined error in section 5.1
    static readonly ParseError = (stack = '') => new ErrorResponse(null, -32700, 'Parse error', stack)
    static readonly InvalidRequest = (id: ID) => new ErrorResponse(id, -32600, 'Invalid Request', '')
    static readonly MethodNotFound = (id: ID) => new ErrorResponse(id, -32601, 'Method not found', '')
    static readonly InvalidParams = (id: ID) => new ErrorResponse(id, -32602, 'Invalid params', '')
    static readonly InternalError = (id: ID, message: string = '') =>
        new ErrorResponse(id, -32603, 'Internal error' + message, '')
}

type Response = SuccessResponse | ErrorResponse
function isJSONRPCObject(data: any): data is Response | Request {
    if (!isObject(data)) return false
    if (!hasKey(data, 'jsonrpc')) return false
    if (data.jsonrpc !== '2.0') return false
    if (hasKey(data, 'params')) {
        const params = (data as Request).params
        if (!Array.isArray(params) && !isObject(params)) return false
    }
    return true
}
function isObject(params: any): params is object {
    return typeof params === 'object' && params !== null
}
function hasKey<T, Q extends string>(obj: T, key: Q): obj is T & { [key in Q]: unknown } {
    return key in obj
}
class CustomError extends Error {
    constructor(public name: string, message: string, public code: number, public stack: string) {
        super(message)
    }
}
/** These Error is defined in ECMAScript spec */
const errors: Record<string, typeof EvalError> = {
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,
}
/**
 * AsyncCall support somehow transfer ECMAScript Error
 */
function RecoverError(type: string, message: string, code: number, stack: string) {
    try {
        const DOMException = haveDOMException()
        if (type.startsWith('DOMException:') && DOMException) {
            const [, name] = type.split('DOMException:')
            return new DOMException(message, name)
        } else if (type in errors) {
            const e = new errors[type](message)
            e.stack = stack
            Object.assign(e, { code })
            return e
        } else {
            return new CustomError(type, message, code, stack)
        }
    } catch {
        return new Error(`E${code} ${type}: ${message}\n${stack}`)
    }
}
function removeStackHeader(stack: string = '') {
    return stack.replace(/^.+\n.+\n/, '')
}
function haveDOMException(): { new (message: string, name: string): any } | undefined {
    return Reflect.get(globalThis, 'DOMException')
}
function getConsole(): {
    debug(...args: unknown[]): void
    log(...args: unknown[]): void
    groupCollapsed(...args: unknown[]): void
    groupEnd(...args: unknown[]): void
    error(...args: unknown[]): void
} {
    const console = Reflect.get(globalThis, 'console') as ReturnType<typeof getConsole>
    const defaultLog = (...args: unknown[]) => {
        if (!console || !console.log) throw new Error('Except a console object on the globalThis')
        console.log(...args)
    }
    const defaultConsole = {
        debug: defaultLog,
        error: defaultLog,
        groupCollapsed: defaultLog,
        groupEnd: defaultLog,
        log: defaultLog,
    }
    return Object.assign({}, defaultConsole, console)
}
