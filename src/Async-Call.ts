/**
 * See the document at https://github.com/Jack-Works/async-call/
 */

import { Serialization, NoSerialization } from './utils/serialization'
export { JSONSerialization, NoSerialization, Serialization } from './utils/serialization'
import type { Console } from './utils/console'
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
import { ERROR, isArray, isFunction, isString, Promise_reject, Promise_resolve, undefined } from './utils/constants'

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
     * Choose log level.
     * @remarks
     * See {@link AsyncCallLogLevel}. `true` is a reasonable default value, `false` is disable log, `"all"` is enable all logs (stronger than `true`).
     * @defaultValue true
     */
    log?: AsyncCallLogLevel | boolean | 'all'
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
     * @deprecated Cause it doesn't work well
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
    /**
     * If the instance should be "thenable".
     * @defaultValue undefined
     * @remarks
     * If the value is *true*, it will return a *then* method normally (forwards the call to the remote).
     *
     * If the value is *false*, it will return *undefined* even the remote has a method called "then".
     *
     * If the value is *undefined*, it will return *undefined* and show a warning. You must explicitly set this option to *true* or *false* to dismiss the warning.
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
 * @internal
 */
export type _IgnoreResponse<T> = T extends (...args: infer Args) => unknown
    ? (...args: Args) => Promise<void>
    : {
          [key in keyof T as T[key] extends Function ? key : never]: T[key] extends (...args: infer Args) => unknown
              ? (...args: Args) => Promise<void>
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
 * @typeParam OtherSideImplementedFunctions - The type of the API that server expose. For any function on this interface, AsyncCall will convert it to the Promised type.
 * @returns Same as the `OtherSideImplementedFunctions` type parameter, but every function in that interface becomes async and non-function value is removed.
 * @public
 */
export function AsyncCall<OtherSideImplementedFunctions = {}>(
    thisSideImplementation: object | Promise<object> = {},
    options: AsyncCallOptions,
): _AsyncVersionOf<OtherSideImplementedFunctions> {
    let resolvedThisSideImplementation: object | undefined = undefined
    let rejectedThisSideImplementation: Error | undefined = undefined
    // This promise should never fail
    const awaitThisSideImplementation = () => {
        return Promise_resolve(thisSideImplementation).then(
            (x) => (resolvedThisSideImplementation = x),
            (e) => {
                resolvedThisSideImplementation = {}
                rejectedThisSideImplementation = e
                console_error('AsyncCall server failed to start', e)
            },
        )
    }

    const {
        serializer = NoSerialization,
        key: logKey = 'jsonrpc',
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
    else resolvedThisSideImplementation = thisSideImplementation

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
        if (!resolvedThisSideImplementation) await awaitThisSideImplementation()
        if (rejectedThisSideImplementation) return makeErrorObject(rejectedThisSideImplementation, '', data)
        let frameworkStack: string = ''
        try {
            const { params, method, id: req_id, remoteStack } = data
            // ? We're mapping any method starts with 'rpc.' to a Symbol.for
            const key = (method.startsWith('rpc.') ? Symbol.for(method) : method) as keyof object
            const executor: unknown = resolvedThisSideImplementation![key]
            if (!isFunction(executor)) {
                if (!banMethodNotFound) {
                    if (log_localError) console_debug('Missing method', key, data)
                    return
                } else return ErrorResponseMethodNotFound(req_id)
            }
            const args = isArray(params) ? params : [params]
            frameworkStack = removeStackHeader(new Error().stack)
            const promise = new Promise((resolve) => resolve(executor.apply(resolvedThisSideImplementation, args)))
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
                    if (log_requestReplay)
                        logArgs.push(() => {
                            debugger
                            return executor.apply(resolvedThisSideImplementation, args)
                        })
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
            // ? This is a Notification, we MUST not return it.
            if (!hasKey(res, 'id')) return
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
                .reduce((stack, fstack) => stack.replace(fstack + '\n', ''), '' + e.stack || '')
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
            await r
            return
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
                        else return Promise_reject('Not start with rpc.')
                    }
                } else if (method.startsWith('rpc.'))
                    return Promise_reject(
                        makeHostedMessage(
                            HostedMessages.Can_not_call_method_starts_with_rpc_dot_directly,
                            new TypeError(),
                        ),
                    )
                if (preferLocalImplementation && resolvedThisSideImplementation && isString(method)) {
                    const localImpl: unknown = resolvedThisSideImplementation[method as keyof object]
                    if (localImpl && isFunction(localImpl)) {
                        return new Promise((resolve) => resolve(localImpl(...params)))
                    }
                }
                return new Promise<void>((resolve, reject) => {
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
