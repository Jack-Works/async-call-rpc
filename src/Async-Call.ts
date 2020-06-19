/**
 * See the document at https://github.com/Jack-Works/async-call/
 */

import { Serialization, NoSerialization } from './utils/serialization'
export { JSONSerialization, NoSerialization, Serialization } from './utils/serialization'
import { Console, getConsole } from './utils/console'
export { Console } from './utils/console'
import { Request, Response, ErrorResponse, SuccessResponse, hasKey, isJSONRPCObject, isObject } from './utils/jsonrpc'
import { removeStackHeader, RecoverError } from './utils/error'
import { generateRandomID } from './utils/generateRandomID'
import { normalizeStrictOptions, normalizeLogOptions } from './utils/normalizeOptions'
import { AsyncCallIgnoreResponse } from './utils/internalSymbol'
import { preservePauseOnException as preservePauseOnExceptionCaller } from './utils/preservePauseOnException'

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

/**
 * The message channel interface that allows
 * @public
 */
export interface MessageChannel {
    on(event: string, eventListener: (data: unknown) => void): void
    emit(event: string, data: unknown): void
}

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
    key?: string
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
    serializer?: Serialization
    /**
     * The logger of AsyncCall
     * @remarks
     * See {@link Console}
     * @defaultValue globalThis.console
     */
    logger?: Console
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
    messageChannel: MessageChannel
    /**
     * Choose log level. See {@link AsyncCallLogLevel}
     * @defaultValue true
     */
    log?: AsyncCallLogLevel | boolean
    /**
     * Strict options. See {@link AsyncCallStrictJSONRPC}
     * @defaultValue false
     */
    strict?: AsyncCallStrictJSONRPC | boolean
    /**
     * How parameters passed to remote
     * @remarks
     * See {@link https://www.jsonrpc.org/specification#parameter_structures}
     * @defaultValue "by-position"
     */
    parameterStructures?: 'by-position' | 'by-name'
    /**
     * Prefer local implementation than remote.
     * @remarks
     * If you call a RPC method and it is also defined in the local, open this flag will call the local implementation directly instead of send a RPC request.
     * @defaultValue false
     */
    preferLocalImplementation?: boolean
    /**
     * (Browser) Try to preserve the browser "pause on uncaught exception".
     * @remarks
     * This options only works for the browser.
     *
     * DON'T use it in production. Use it like "preservePauseOnException": process.env.NODE_ENV === "development"
     *
     * It's based on a hacky way to preserve the breakpoint. If you find your the server function isn't get called or called twice, try to close this option.
     *
     * @defaultValue false
     */
    preservePauseOnException?: boolean
    /**
     * The ID generator of each JSON RPC request
     * @defaultValue () => Math.random().toString(36).slice(2)
     */
    idGenerator?(): string | number
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

const AsyncCallDefaultOptions = (<T extends Omit<Required<AsyncCallOptions>, 'messageChannel' | 'logger'>>(a: T) => a)({
    serializer: NoSerialization,
    key: 'default-jsonrpc',
    strict: false,
    log: true,
    parameterStructures: 'by-position',
    preferLocalImplementation: false,
    preservePauseOnException: false,
    idGenerator: generateRandomID,
})

/**
 * Create a RPC server & client.
 *
 * @remarks
 * See {@link AsyncCallOptions}
 *
 * thisSideImplementation can be a Promise so you can write:
 *
 * ```ts
 * export const service = AsyncCall(typeof window === 'object' ? {} : import('./backend/service.js'), {})
 * ```
 *
 * @param thisSideImplementation - The implementation when this AsyncCall acts as a JSON RPC server. Can be a Promise.
 * @param options - {@link AsyncCallOptions}
 * @typeParam OtherSideImplementedFunctions - The type of the API that server expose. For any function on this interface, AsyncCall will convert it to the Promised type.
 * @returns Same as the `OtherSideImplementedFunctions` type parameter, but every function in that interface becomes async and non-function value is removed.
 * @public
 */
export function AsyncCall<OtherSideImplementedFunctions = {}>(
    thisSideImplementation: object | Promise<object> = {},
    options: AsyncCallOptions,
): _AsyncVersionOf<OtherSideImplementedFunctions> {
    let resolvedThisSideImplementation: object | undefined = undefined
    Promise.resolve(thisSideImplementation).then((x) => (resolvedThisSideImplementation = x))
    const {
        serializer,
        key,
        strict,
        log,
        parameterStructures,
        preferLocalImplementation,
        preservePauseOnException,
        idGenerator,
    } = {
        ...AsyncCallDefaultOptions,
        ...options,
    }
    const message = options.messageChannel
    const {
        methodNotFound: banMethodNotFound = false,
        noUndefined: noUndefinedKeeping = false,
        unknownMessage: banUnknownMessage = false,
    } = normalizeStrictOptions(strict)
    const {
        beCalled: logBeCalled = true,
        localError: logLocalError = true,
        remoteError: logRemoteError = true,
        type: logType = 'pretty',
        sendLocalStack = false,
    } = normalizeLogOptions(log)
    const console = getConsole(options.logger)
    type PromiseParam = Parameters<ConstructorParameters<typeof Promise>[0]>
    const requestContext = new Map<string | number, { f: PromiseParam; stack: string }>()
    async function onRequest(data: Request): Promise<Response | undefined> {
        if (!resolvedThisSideImplementation) await thisSideImplementation
        let frameworkStack: string = ''
        try {
            // ? We're mapping any method starts with 'rpc.' to a Symbol.for
            const key = (data.method.startsWith('rpc.') ? Symbol.for(data.method) : data.method) as keyof object
            const executor: unknown = resolvedThisSideImplementation![key]
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
                const promise = preservePauseOnException
                    ? preservePauseOnExceptionCaller((x) => (frameworkStack = x), executor, args)
                    : new Promise((resolve) => resolve(executor(...args)))
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
                if (result === AsyncCallIgnoreResponse) return
                return SuccessResponse(data.id, await promise, noUndefinedKeeping)
            } else {
                return ErrorResponse.InvalidRequest(data.id)
            }
        } catch (e) {
            if (typeof e === 'object' && 'stack' in e)
                e.stack = frameworkStack
                    .split('\n')
                    .reduce((stack, fstack) => stack.replace(fstack + '\n', ''), e.stack || '')
            if (logLocalError) console.error(e)
            return ErrorResponse(data.id, -1, e?.message, e?.stack, e)
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
            remoteErrorStack = data.error.data?.stack ?? '<remote stack not available>'
            errorType = data.error.data?.type || 'Error'
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
                if (data.every((x) => x === undefined)) return
                await send(result.filter((x) => x))
            } else {
                if (banUnknownMessage) {
                    await send(ErrorResponse.InvalidRequest((data as any).id || null))
                } else {
                    // ? Ignore this message. The message channel maybe also used to transfer other message too.
                }
            }
        } catch (e) {
            console.error(e, data, result)
            send(ErrorResponse.ParseError(e?.stack))
        }
        async function send(res?: Response | (Response | undefined)[]) {
            if (Array.isArray(res)) {
                const reply = res.map((x) => x).filter((x) => x!.id !== undefined)
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
                    if (preferLocalImplementation && resolvedThisSideImplementation && typeof method === 'string') {
                        const localImpl: unknown = resolvedThisSideImplementation[method as keyof object]
                        if (localImpl && typeof localImpl === 'function') {
                            return new Promise((resolve) => resolve(localImpl(...params)))
                        }
                    }
                    return new Promise((resolve, reject) => {
                        const id = idGenerator()
                        const [param0] = params
                        const sendingStack = sendLocalStack ? stack : ''
                        const param =
                            parameterStructures === 'by-name' && params.length === 1 && isObject(param0)
                                ? param0
                                : params
                        const request = Request(id, method as string, param, sendingStack)
                        Promise.resolve(serializer.serialization(request)).then((data) => {
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
            if (hasKey(data, 'resultIsUndefined')) (data as any).result = undefined
            onResponse(data)
        } else {
            if (hasKey(data, 'resultIsUndefined')) {
                ;(data as any).result = undefined
                onResponse(data)
            } else return ErrorResponse.InvalidRequest((data as any).id)
        }
        return undefined
    }
}
