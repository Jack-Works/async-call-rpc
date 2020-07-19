/**
 * See the document at https://github.com/Jack-Works/async-call/
 */

import { Serialization, NoSerialization } from './utils/serialization'
export { JSONSerialization, NoSerialization, Serialization } from './utils/serialization'
import { Console, getConsole } from './utils/console'
export { Console } from './utils/console'
export { notify } from './core/notify'
export { batch } from './core/batch'
import {
    Request,
    Response,
    ErrorResponseMapped,
    SuccessResponse,
    hasKey,
    isJSONRPCObject,
    isObject,
    ErrorResponse,
    defaultErrorMapper,
} from './utils/jsonrpc'
import { removeStackHeader, RecoverError } from './utils/error'
import { generateRandomID } from './utils/generateRandomID'
import { normalizeStrictOptions, normalizeLogOptions } from './utils/normalizeOptions'
import { AsyncCallIgnoreResponse, AsyncCallNotify, AsyncCallBatch } from './utils/internalSymbol'
import { preservePauseOnException as preservePauseOnExceptionCaller } from './utils/preservePauseOnException'
import { BatchQueue } from './core/batch'
import { CallbackBasedChannel, EventBasedChannel } from './index'

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
    /**
     * Log a function that allows to execute the request again.
     * @defaultValue false
     */
    requestReplay?: boolean
}

/**
 * Control the behavior that different from the JSON RPC spec.
 * @public
 */
export interface AsyncCallStrictJSONRPC {
    /**
     * Return an error when the requested method is not defined, otherwise, ignore the request.
     * @defaultValue true
     */
    methodNotFound?: boolean
    /**
     * send an error when receive invalid JSON RPC payload
     * @defaultValue true
     */
    unknownMessage?: boolean
}

export type { CallbackBasedChannel, EventBasedChannel } from './types'
/**
 * Options for {@link AsyncCall}
 * @public
 */
export interface AsyncCallOptions {
    /**
     * This option will only used for better logging.
     * @defaultValue `jsonrpc`
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
     * [Example for CallbackBasedChannel](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/websocket.client.ts).
     * [Example for EventBasedChannel](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/websocket.server.ts).
     * @remarks
     * If you're using this new property, you can use "" to disable the type system error.
     */
    channel: CallbackBasedChannel | EventBasedChannel
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
     * @defaultValue () =\> Math.random().toString(36).slice(2)
     */
    idGenerator?(): string | number
    /**
     * Control the error response data
     * @param error - The happened Error
     * @param request - The request object
     */
    mapError?: ErrorMapFunction<unknown>
}

/**
 * @public
 */
export type ErrorMapFunction<T = unknown> = (
    error: unknown,
    request: Readonly<{
        jsonrpc: '2.0'
        id?: string | number | null
        method: string
        params: readonly unknown[] | object
    }>,
) => {
    code: number
    message: string
    data?: T
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
/**
 * @internal
 */
export type _IgnoreResponse<T> = T extends (...args: infer Args) => unknown
    ? (...args: Args) => Promise<void>
    : {
          [key in keyof T]: T[key] extends (...args: infer Args) => unknown ? (...args: Args) => Promise<void> : never
      }

const AsyncCallDefaultOptions = (<T extends Omit<Required<AsyncCallOptions>, 'channel' | 'logger' | 'mapError'>>(
    a: T,
) => a)({
    serializer: NoSerialization,
    key: 'jsonrpc',
    strict: true,
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
    if (!(thisSideImplementation instanceof Promise)) resolvedThisSideImplementation = thisSideImplementation
    Promise.resolve(thisSideImplementation).then((x) => (resolvedThisSideImplementation = x))
    const {
        serializer,
        key: logKey,
        strict,
        log,
        parameterStructures,
        preferLocalImplementation,
        preservePauseOnException,
        idGenerator,
        mapError,
        logger,
        channel,
    } = {
        ...AsyncCallDefaultOptions,
        ...options,
    }
    const {
        methodNotFound: banMethodNotFound = false,
        unknownMessage: banUnknownMessage = false,
    } = normalizeStrictOptions(strict)
    const {
        beCalled: logBeCalled = true,
        localError: logLocalError = true,
        remoteError: logRemoteError = true,
        type: logType = 'pretty',
        sendLocalStack = false,
        requestReplay = false,
    } = normalizeLogOptions(log)
    const console = getConsole(logger)
    type PromiseParam = Parameters<ConstructorParameters<typeof Promise>[0]>
    const requestContext = new Map<string | number, { f: PromiseParam; stack: string }>()
    async function onRequest(data: Request): Promise<Response | undefined> {
        if (!resolvedThisSideImplementation) await thisSideImplementation
        let frameworkStack: string = ''
        try {
            // ? We're mapping any method starts with 'rpc.' to a Symbol.for
            const key = (data.method.startsWith('rpc.') ? Symbol.for(data.method) : data.method) as keyof object
            const executor: unknown = resolvedThisSideImplementation![key]
            if (typeof executor !== 'function') {
                if (!banMethodNotFound) {
                    if (logLocalError) console.debug('Receive remote call, but not implemented.', key, data)
                    return
                } else return ErrorResponse.MethodNotFound(data.id)
            }
            const { params } = data
            const args = Array.isArray(params) ? params : [params]
            frameworkStack = removeStackHeader(new Error().stack)
            const promise = preservePauseOnException
                ? preservePauseOnExceptionCaller(
                      (x) => (frameworkStack = x),
                      executor,
                      resolvedThisSideImplementation,
                      args,
                  )
                : new Promise((resolve) => resolve(executor.apply(resolvedThisSideImplementation, args)))
            if (logBeCalled) {
                if (logType === 'basic') console.log(`${logKey}.${data.method}(${[...args].toString()}) @${data.id}`)
                else {
                    const logArgs: unknown[] = [
                        `${logKey}.%c${data.method}%c(${args.map(() => '%o').join(', ')}%c)\n%o %c@${data.id}`,
                        'color: #d2c057',
                        '',
                        ...args,
                        '',
                        promise,
                        'color: gray; font-style: italic;',
                    ]
                    if (requestReplay)
                        logArgs.push(() => {
                            debugger
                            return executor.apply(resolvedThisSideImplementation, args)
                        })
                    if (data.remoteStack) {
                        console.groupCollapsed(...logArgs)
                        console.log(data.remoteStack)
                        console.groupEnd()
                    } else console.log(...logArgs)
                }
            }
            const result = await promise
            if (result === AsyncCallIgnoreResponse) return
            return SuccessResponse(data.id, await promise)
        } catch (e) {
            if (typeof e === 'object' && 'stack' in e)
                e.stack = frameworkStack
                    .split('\n')
                    .reduce((stack, fstack) => stack.replace(fstack + '\n', ''), e.stack || '')
            if (logLocalError) console.error(e)
            return ErrorResponseMapped(data, e, mapError || defaultErrorMapper(sendLocalStack ? e.stack : void 0))
        }
    }
    async function onResponse(data: Response): Promise<undefined> {
        let errorMessage = '',
            remoteErrorStack = '',
            errorCode = 0,
            errorType = 'Error'
        if (hasKey(data, 'error')) {
            const e = data.error
            errorMessage = e.message
            errorCode = e.code
            const detail = e.data

            if (isObject(detail) && hasKey(detail, 'stack') && typeof detail.stack === 'string')
                remoteErrorStack = detail.stack
            else remoteErrorStack = '<remote stack not available>'

            if (isObject(detail) && hasKey(detail, 'type') && typeof detail.type === 'string') errorType = detail.type
            else errorType = 'Error'

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
        return undefined
    }
    async function rawMessageReceiver(_: unknown): Promise<undefined | Response | (Response | undefined)[]> {
        let data: unknown
        let result: Response | undefined = undefined
        try {
            data = await serializer.deserialization(_)
            if (isJSONRPCObject(data)) {
                return (result = await handleSingleMessage(data))
            } else if (Array.isArray(data) && data.every(isJSONRPCObject) && data.length !== 0) {
                const result = await Promise.all(data.map(handleSingleMessage))
                // ? Response
                if (data.every((x) => x === undefined)) return
                return result.filter((x) => x)
            } else {
                if (banUnknownMessage) {
                    return ErrorResponse.InvalidRequest((data as any).id ?? null)
                } else {
                    // ? Ignore this message. The message channel maybe also used to transfer other message too.
                    return undefined
                }
            }
        } catch (e) {
            if (logLocalError) console.error(e, data, result)
            return ErrorResponse.ParseError(e, mapError || defaultErrorMapper(e?.stack))
        }
    }
    async function rawMessageSender(res: undefined | Response | (Response | undefined)[]) {
        if (!res) return
        if (Array.isArray(res)) {
            const reply = res.filter((x) => hasKey(x, 'id'))
            if (reply.length === 0) return
            return serializer.serialization(reply)
        } else {
            // ? This is a Notification, we MUST not return it.
            if (!hasKey(res, 'id')) return
            return serializer.serialization(res)
        }
    }
    function isEventBasedChannel(x: typeof channel): x is EventBasedChannel {
        return hasKey(x, 'send') && typeof x.send === 'function'
    }
    function isCallbackBasedChannel(x: typeof channel): x is CallbackBasedChannel {
        return hasKey(x, 'setup') && typeof x.setup === 'function'
    }
    if (isCallbackBasedChannel(channel)) {
        channel.setup(
            (data) => rawMessageReceiver(data).then(rawMessageSender),
            (data) => {
                const _ = serializer.deserialization(data)
                if (isJSONRPCObject(_)) return true
                return Promise.resolve(_).then(isJSONRPCObject)
            },
        )
    }
    if (isEventBasedChannel(channel)) {
        const m = channel as EventBasedChannel | CallbackBasedChannel
        m.on?.((_) =>
            rawMessageReceiver(_)
                .then(rawMessageSender)
                .then((x) => x && m.send!(x)),
        )
    }
    return new Proxy(
        {},
        {
            get(_target, method: string | symbol) {
                let stack = removeStackHeader(new Error().stack)
                const factory = (notify: boolean) => (...params: unknown[]) => {
                    let queue: BatchQueue | undefined = undefined
                    if (method === AsyncCallBatch) {
                        queue = params.shift() as any
                        method = params.shift() as any
                    }
                    if (typeof method === 'symbol') {
                        const RPCInternalMethod = Symbol.keyFor(method) || (method as any).description
                        if (RPCInternalMethod) {
                            if (RPCInternalMethod.startsWith('rpc.')) method = RPCInternalMethod
                            else return Promise.reject('[AsyncCall] An internal method must start with "rpc."')
                        }
                    } else if (method.startsWith('rpc.'))
                        return Promise.reject(new TypeError("[AsyncCall] Can't call internal methods directly"))
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
                        const request = Request(notify ? void 0 : id, method as string, param, sendingStack)
                        if (queue) {
                            queue.push(request)
                            if (!queue.r) queue.r = [() => sendPayload(queue), rejectsQueue.bind(queue)]
                        } else sendPayload(request).catch(reject)
                        if (notify) return resolve()
                        requestContext.set(id, {
                            f: [resolve, reject],
                            stack,
                        })
                    })
                }
                const f = factory(false)
                // @ts-ignore
                f[AsyncCallNotify] = factory(true)
                // @ts-ignore
                f[AsyncCallNotify][AsyncCallNotify] = f[AsyncCallNotify]
                return f
            },
        },
    ) as _AsyncVersionOf<OtherSideImplementedFunctions>
    async function sendPayload(payload: unknown) {
        const data = await serializer.serialization(payload)
        return channel.send!(data)
    }
    function rejectsQueue(this: BatchQueue, error: unknown) {
        for (const x of this) {
            if (hasKey(x, 'id')) requestContext.get(x.id!)?.f[1](error)
        }
    }
    async function handleSingleMessage(
        data: SuccessResponse | ErrorResponse | Request,
    ): Promise<SuccessResponse | ErrorResponse | undefined> {
        if (hasKey(data, 'method')) return onRequest(data)
        return onResponse(data)
    }
}
