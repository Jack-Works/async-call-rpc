/**
 * See the document at https://github.com/Jack-Works/async-call/
 */

export type { CallbackBasedChannel, EventBasedChannel } from './types'
export type { Serialization } from './utils/serialization'
export type { Console } from './utils/console'
export type { _IgnoreResponse } from './core/notify'
export { JSONSerialization, NoSerialization } from './utils/serialization'
export { notify } from './core/notify'
export { batch } from './core/batch'

import { Serialization, NoSerialization } from './utils/serialization'
import type { Console } from './utils/console'
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
    ErrorResponseMethodNotFound,
    ErrorResponseInvalidRequest,
    ErrorResponseParseError,
} from './utils/jsonrpc'
import { removeStackHeader, RecoverError, makeHostedMessage, HostedMessages } from './utils/error'
import { generateRandomID } from './utils/generateRandomID'
import { normalizeStrictOptions, normalizeLogOptions } from './utils/normalizeOptions'
import { AsyncCallIgnoreResponse, AsyncCallNotify, AsyncCallBatch } from './utils/internalSymbol'
import { BatchQueue } from './core/batch'
import { CallbackBasedChannel, EventBasedChannel } from './index'
import {
    ERROR,
    isArray,
    isFunction,
    isString,
    Promise_reject,
    Promise_resolve,
    replayFunction,
    undefined,
} from './utils/constants'

/**
 * Log options of AsyncCall
 * @remarks
 * This option controls how AsyncCall should log RPC calls to the console.
 * @public
 */
export interface AsyncCallLogLevel {
    /**
     * Log all requests to this instance
     * @defaultValue true
     */
    beCalled?: boolean
    /**
     * Log all errors produced when responding requests
     * @defaultValue true
     */
    localError?: boolean
    /**
     * Log remote errors
     * @defaultValue true
     */
    remoteError?: boolean
    /**
     * Send the call stack to the remote when making requests
     * @defaultValue false
     */
    sendLocalStack?: boolean
    /**
     * Control if AsyncCall should make the log better
     * @remarks
     * If use "pretty", it will call the logger with some CSS to make the log easier to read.
     * Check out this article to know more about it: {@link https://dev.to/annlin/consolelog-with-css-style-1mmp | Console.log with CSS Style}
     * @defaultValue 'pretty'
     */
    type?: 'basic' | 'pretty'
    /**
     * Log a function that allows to execute the request with same arguments again
     * @remarks
     * Do not use this options in the production environment because it will log a closure that captures the arguments of requests. This may cause memory leak.
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
     * Controls if AsyncCall send an ErrorResponse when the requested method is not defined.
     * @remarks
     * Set this options to false, AsyncCall will ignore the request (but print a log) if the method is not defined.
     * @defaultValue true
     */
    methodNotFound?: boolean
    /**
     * Controls if AsyncCall send an ErrorResponse when the message is not valid.
     * @remarks
     * Set this options to false, AsyncCall will ignore the request that cannot be parsed as a valid JSON RPC payload. This is useful when the message channel is also used to transfer other kinds of messages.
     * @defaultValue true
     */
    unknownMessage?: boolean
}

/**
 * Options for {@link AsyncCall}
 * @public
 */
export interface AsyncCallOptions {
    /**
     * This option is used for better log print.
     * @defaultValue `rpc`
     */
    key?: string
    /**
     * How to serialize and deserialize the JSON RPC payload
     *
     * @remarks
     * See {@link Serialization}.
     * There is some built-in serializer:
     *
     * - {@link NoSerialization} (Not doing anything to the message)
     *
     * - {@link JSONSerialization} (Using JSON.parse/stringify in the backend)
     *
     * - {@link https://github.com/jack-works/async-call-rpc#web-deno-and-node-bson BSONSerialization} (use the {@link https://npmjs.org/bson | bson} as the serializer)
     *
     * @defaultValue {@link NoSerialization}
     */
    serializer?: Serialization
    /**
     * Provide the logger of AsyncCall
     * @remarks
     * See {@link Console}
     * @defaultValue globalThis.console
     */
    logger?: Console
    /**
     * The message channel to exchange messages between server and client
     * @example
     * {@link https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/websocket.client.ts | Example for CallbackBasedChannel} or {@link https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/websocket.server.ts | Example for EventBasedChannel}
     */
    channel: CallbackBasedChannel | EventBasedChannel
    /**
     * Choose log level.
     * @remarks
     * - `true` is a reasonable default value, which means all options are the default options in the {@link AsyncCallLogLevel}
     *
     * - `false` is disable all logs
     *
     * - `"all"` is enable all logs (stronger than `true`).
     * @defaultValue true
     */
    log?: AsyncCallLogLevel | boolean | 'all'
    /**
     * Control the behavior that different from the JSON RPC spec. See {@link AsyncCallStrictJSONRPC}
     * @remarks
     * - `true` is to enable all strict options
     * - `false` is to disable all strict options
     * @defaultValue true
     */
    strict?: AsyncCallStrictJSONRPC | boolean
    /**
     * Choose flavor of parameter structures defined in the spec
     * @remarks
     *
     * See {@link https://www.jsonrpc.org/specification#parameter_structures}
     *
     * When using `by-name`, only first parameter of the requests are sent to the remote and it must be an object.
     *
     * @privateRemarks
     * TODO: review the edge cases when using "by-name".
     * @defaultValue "by-position"
     */
    parameterStructures?: 'by-position' | 'by-name'
    /**
     * Prefer local implementation than remote.
     * @remarks
     * If you call a RPC method and it is also defined in the local, open this flag will call the local implementation directly instead of send a RPC request. No logs / serialization will be performed if a local implementation is used.
     * @defaultValue false
     */
    preferLocalImplementation?: boolean
    /**
     * The ID generator of each JSON RPC request
     * @defaultValue () =\> Math.random().toString(36).slice(2)
     */
    idGenerator?(): string | number
    /**
     * Control how to report error response according to the exception
     */
    mapError?: ErrorMapFunction<unknown>
    /**
     * If the instance should be "thenable".
     * @defaultValue undefined
     * @remarks
     * If this options is set to `true`, it will return a `then` method normally (forwards the call to the remote).
     *
     * If this options is set to `false`, it will return `undefined` even the remote has a method called "then".
     *
     * If this options is set to `undefined`, it will return `undefined` and show a warning. You must explicitly set this option to `true` or `false` to dismiss the warning.
     *
     * The motivation of this option is to resolve the problem caused by Promise auto-unwrapping.
     *
     * Consider this code:
     *
     * ```ts
     * async function getRPC() {
     *     return AsyncCall(...)
     * }
     * ```
     *
     * According to the JS semantics, it will invoke the "then" method immediately on the returning instance which is unwanted in most scenarios.
     *
     * To avoid this problem, methods called "then" are omitted from the type signatures. Strongly suggest to not use "then" as your RPC method name.
     */
    thenable?: boolean
}

/**
 * JSON RPC Request object
 * @public
 */
export type JSONRPCRequest = {
    jsonrpc: '2.0'
    id?: string | number | null
    method: string
    params: readonly unknown[] | object
}
/**
 * @public
 * @param error - The exception
 * @param request - The request object
 */
export type ErrorMapFunction<T = unknown> = (
    error: unknown,
    request: Readonly<JSONRPCRequest>,
) => {
    code: number
    message: string
    data?: T
}

/**
 * Make all function in the type T becomes async functions and filtering non-Functions out.
 *
 * @remarks
 * Only generics signatures on function that returning an Promise<T> will be preserved due to the limitation of TypeScript.
 *
 * Method called `then` are intentionally removed because it is very likely to be a foot gun in promise auto-unwrap.
 * @internal
 */
export type _AsyncVersionOf<T> = {
    readonly // Explicitly exclude key called "then" because it will cause problem in promise auto-unwrap.
    [key in keyof T as key extends 'then' ? never : T[key] extends Function ? key : never]: T[key] extends (
        ...args: any
    ) => Promise<any>
        ? T[key] // If it is returning Promise<any>, we use T[key] to preserve generics on function signatures
        : T[key] extends (...args: infer Args) => infer Return // otherwise we convert it to async functions
        ? (...args: Args) => Promise<Return extends PromiseLike<infer U> ? U : Return>
        : never
}

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
 * @typeParam OtherSideImplementedFunctions - The type of the API that server expose. For any function on this interface, it will be converted to the async version.
 * @returns Same as the `OtherSideImplementedFunctions` type parameter, but every function in that interface becomes async and non-function value is removed. Method called "then" are also removed.
 * @public
 */
export function AsyncCall<OtherSideImplementedFunctions = {}>(
    thisSideImplementation: null | undefined | object | Promise<object>,
    options: AsyncCallOptions,
): _AsyncVersionOf<OtherSideImplementedFunctions> {
    let isThisSideImplementationPending = true
    let resolvedThisSideImplementationValue: unknown = undefined
    let rejectedThisSideImplementation: unknown = undefined
    // This promise should never fail
    const awaitThisSideImplementation = async () => {
        try {
            resolvedThisSideImplementationValue = await thisSideImplementation
        } catch (e) {
            rejectedThisSideImplementation = e
            console_error('AsyncCall failed to start', e)
        } finally {
            isThisSideImplementationPending = false
        }
    }

    const {
        serializer = NoSerialization,
        key: logKey = 'rpc',
        strict = true,
        log = true,
        parameterStructures = 'by-position',
        preferLocalImplementation = false,
        idGenerator = generateRandomID,
        mapError,
        logger,
        channel,
        thenable,
    } = options

    if (thisSideImplementation instanceof Promise) awaitThisSideImplementation()
    else {
        resolvedThisSideImplementationValue = thisSideImplementation
        isThisSideImplementationPending = false
    }

    const [banMethodNotFound, banUnknownMessage] = normalizeStrictOptions(strict)
    const [
        log_beCalled,
        log_localError,
        log_remoteError,
        log_pretty,
        log_requestReplay,
        log_sendLocalStack,
    ] = normalizeLogOptions(log)
    const {
        log: console_log,
        error: console_error = console_log,
        debug: console_debug = console_log,
        groupCollapsed: console_groupCollapsed = console_log,
        groupEnd: console_groupEnd = console_log,
        warn: console_warn = console_log,
    } = (logger || console) as Console
    type PromiseParam = [resolve: (value?: any) => void, reject: (reason?: any) => void]
    const requestContext = new Map<string | number, { f: PromiseParam; stack: string }>()
    const onRequest = async (data: Request): Promise<Response | undefined> => {
        if (isThisSideImplementationPending) await awaitThisSideImplementation()
        else {
            // not pending
            if (rejectedThisSideImplementation) return makeErrorObject(rejectedThisSideImplementation, '', data)
        }
        let frameworkStack: string = ''
        try {
            const { params, method, id: req_id, remoteStack } = data
            // ? We're mapping any method starts with 'rpc.' to a Symbol.for
            const key = (method.startsWith('rpc.') ? Symbol.for(method) : method) as keyof object
            const executor: unknown =
                resolvedThisSideImplementationValue && (resolvedThisSideImplementationValue as any)[key]
            if (!isFunction(executor)) {
                if (!banMethodNotFound) {
                    if (log_localError) console_debug('Missing method', key, data)
                    return
                } else return ErrorResponseMethodNotFound(req_id)
            }
            const args = isArray(params) ? params : [params]
            frameworkStack = removeStackHeader(new Error().stack)
            const promise = new Promise((resolve) => resolve(executor.apply(resolvedThisSideImplementationValue, args)))
            if (log_beCalled) {
                if (log_pretty) {
                    const logArgs: unknown[] = [
                        `${logKey}.%c${method}%c(${args.map(() => '%o').join(', ')}%c)\n%o %c@${req_id}`,
                        'color: #d2c057',
                        '',
                        ...args,
                        '',
                        promise,
                        'color: gray; font-style: italic;',
                    ]
                    if (log_requestReplay) {
                        // This function will be logged to the console so it must be 1 line
                        // prettier-ignore
                        const replay = () => { debugger; return executor.apply(resolvedThisSideImplementationValue, args) }
                        replay.toString = replayFunction
                        logArgs.push(replay)
                    }
                    if (remoteStack) {
                        console_groupCollapsed(...logArgs)
                        console_log(remoteStack)
                        console_groupEnd()
                    } else console_log(...logArgs)
                } else console_log(`${logKey}.${method}(${[...args].toString()}) @${req_id}`)
            }
            const result = await promise
            if (result === AsyncCallIgnoreResponse) return
            return SuccessResponse(req_id, await promise)
        } catch (e) {
            return makeErrorObject(e, frameworkStack, data)
        }
    }
    const onResponse = async (data: Response): Promise<void> => {
        let errorMessage = '',
            remoteErrorStack = '',
            errorCode = 0,
            errorType = ERROR
        if (hasKey(data, 'error')) {
            const e = data.error
            errorMessage = e.message
            errorCode = e.code
            const detail = e.data

            if (isObject(detail) && hasKey(detail, 'stack') && isString(detail.stack)) remoteErrorStack = detail.stack
            else remoteErrorStack = '<remote stack not available>'

            if (isObject(detail) && hasKey(detail, 'type') && isString(detail.type)) errorType = detail.type
            else errorType = ERROR

            if (log_remoteError)
                log_pretty
                    ? console_error(
                          `${errorType}: ${errorMessage}(${errorCode}) %c@${data.id}\n%c${remoteErrorStack}`,
                          'color: gray',
                          '',
                      )
                    : console_error(`${errorType}: ${errorMessage}(${errorCode}) @${data.id}\n${remoteErrorStack}`)
        }
        if (data.id === null || data.id === undefined) return
        const { f: [resolve, reject] = [null, null], stack: localErrorStack = '' } = requestContext.get(data.id) || {}
        if (!resolve || !reject) return // drop this response
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
        return
    }
    const rawMessageReceiver = async (_: unknown): Promise<undefined | Response | (Response | undefined)[]> => {
        let data: unknown
        let result: Response | undefined = undefined
        try {
            data = await deserialization(_)
            if (isJSONRPCObject(data)) {
                return (result = await handleSingleMessage(data))
            } else if (isArray(data) && data.every(isJSONRPCObject) && data.length !== 0) {
                return Promise.all(data.map(handleSingleMessage))
            } else {
                if (banUnknownMessage) {
                    let id = (data as any).id
                    if (id === undefined) id = null
                    return ErrorResponseInvalidRequest(id)
                } else {
                    // ? Ignore this message. The message channel maybe also used to transfer other message too.
                    return undefined
                }
            }
        } catch (e) {
            if (log_localError) console_error(e, data, result)
            return ErrorResponseParseError(e, mapError || defaultErrorMapper(e && e.stack))
        }
    }
    const rawMessageSender = async (res: undefined | Response | (Response | undefined)[]) => {
        if (!res) return
        if (isArray(res)) {
            const reply = res.filter((x) => x && hasKey(x, 'id'))
            if (reply.length === 0) return
            return serialization(reply)
        } else {
            return serialization(res)
        }
    }
    const serialization = (x: unknown) => serializer.serialization(x)
    const deserialization = (x: unknown) => serializer.deserialization(x)
    const isEventBasedChannel = (x: typeof channel): x is EventBasedChannel => hasKey(x, 'send') && isFunction(x.send)
    const isCallbackBasedChannel = (x: typeof channel): x is CallbackBasedChannel =>
        hasKey(x, 'setup') && isFunction(x.setup)

    if (isCallbackBasedChannel(channel)) {
        channel.setup(
            (data) => rawMessageReceiver(data).then(rawMessageSender),
            (data) => {
                const _ = deserialization(data)
                if (isJSONRPCObject(_)) return true
                return Promise_resolve(_).then(isJSONRPCObject)
            },
        )
    }
    if (isEventBasedChannel(channel)) {
        const m = channel as EventBasedChannel | CallbackBasedChannel
        m.on &&
            m.on((_) =>
                rawMessageReceiver(_)
                    .then(rawMessageSender)
                    .then((x) => x && m.send!(x)),
            )
    }
    function makeErrorObject(e: any, frameworkStack: string, data: Request) {
        if (isObject(e) && hasKey(e, 'stack'))
            e.stack = frameworkStack
                .split('\n')
                .reduce((stack, fstack) => stack.replace(fstack + '\n', ''), '' + e.stack)
        if (log_localError) console_error(e)
        return ErrorResponseMapped(data, e, mapError || defaultErrorMapper(log_sendLocalStack ? e.stack : undefined))
    }

    async function sendPayload(payload: unknown, removeQueueR = false) {
        if (removeQueueR) payload = [...(payload as BatchQueue)]
        const data = await serialization(payload)
        return channel.send!(data)
    }
    function rejectsQueue(queue: BatchQueue, error: unknown) {
        for (const x of queue) {
            if (hasKey(x, 'id')) {
                const ctx = requestContext.get(x.id!)
                ctx && ctx.f[1](error)
            }
        }
    }
    const handleSingleMessage = async (
        data: SuccessResponse | ErrorResponse | Request,
    ): Promise<SuccessResponse | ErrorResponse | undefined> => {
        if (hasKey(data, 'method')) {
            const r = onRequest(data)
            if (hasKey(data, 'id')) return r
            try {
                await r
            } catch {}
            return undefined // Does not care about return result for notifications
        }
        return onResponse(data) as Promise<undefined>
    }
    return new Proxy({ __proto__: null } as any, {
        get(cache, method: string | symbol) {
            if (method === 'then') {
                if (thenable === undefined) {
                    console_warn(
                        makeHostedMessage(
                            HostedMessages.Instance_is_treated_as_Promise_please_explicitly_mark_if_it_is_thenable_or_not_via_the_options,
                            new TypeError('RPC used as Promise: '),
                        ),
                    )
                }
                if (thenable !== true) return undefined
            }
            if (isString(method) && cache[method]) return cache[method]
            const factory = (notify: boolean) => (...params: unknown[]) => {
                let stack = removeStackHeader(new Error().stack)
                let queue: BatchQueue | undefined = undefined
                if (method === AsyncCallBatch) {
                    queue = params.shift() as any
                    method = params.shift() as any
                }
                if (typeof method === 'symbol') {
                    const RPCInternalMethod = Symbol.keyFor(method) || (method as any).description
                    if (RPCInternalMethod) {
                        if (RPCInternalMethod.startsWith('rpc.')) method = RPCInternalMethod
                        else return Promise_reject(new TypeError('Not start with rpc.'))
                    }
                } else if (method.startsWith('rpc.'))
                    return Promise_reject(
                        makeHostedMessage(
                            HostedMessages.Can_not_call_method_starts_with_rpc_dot_directly,
                            new TypeError(),
                        ),
                    )
                return new Promise<void>((resolve, reject) => {
                    if (preferLocalImplementation && !isThisSideImplementationPending && isString(method)) {
                        const localImpl: unknown =
                            resolvedThisSideImplementationValue && (resolvedThisSideImplementationValue as any)[method]
                        if (isFunction(localImpl)) return resolve(localImpl(...params))
                    }
                    const id = idGenerator()
                    const [param0] = params
                    const sendingStack = log_sendLocalStack ? stack : ''
                    const param =
                        parameterStructures === 'by-name' && params.length === 1 && isObject(param0) ? param0 : params
                    const request = Request(notify ? undefined : id, method as string, param, sendingStack)
                    if (queue) {
                        queue.push(request)
                        if (!queue.r) queue.r = [() => sendPayload(queue, true), (e) => rejectsQueue(queue!, e)]
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
            isString(method) && Object.defineProperty(cache, method, { value: f, configurable: true })
            return f
        },
    }) as _AsyncVersionOf<OtherSideImplementedFunctions>
}
// Assume a console object in global if there is no custom logger provided
declare const console: Console
