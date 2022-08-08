export * from './types.js'
export type { _IgnoreResponse } from './core/notify.js'
export { JSONSerialization, NoSerialization } from './utils/serialization.js'
export { notify } from './core/notify.js'
export { batch } from './core/batch.js'

import { NoSerialization } from './utils/serialization.js'
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
} from './utils/jsonrpc.js'
import {
    removeStackHeader,
    RecoverError,
    makeHostedMessage,
    Err_Cannot_call_method_starts_with_rpc_dot_directly,
    Err_Then_is_accessed_on_local_implementation_Please_explicitly_mark_if_it_is_thenable_in_the_options,
} from './utils/error.js'
import { generateRandomID } from './utils/generateRandomID.js'
import { normalizeStrictOptions, normalizeLogOptions } from './utils/normalizeOptions.js'
import { AsyncCallIgnoreResponse, AsyncCallNotify, AsyncCallBatch } from './utils/internalSymbol.js'
import type { BatchQueue } from './core/batch.js'
import type {
    CallbackBasedChannel,
    EventBasedChannel,
    AsyncCallOptions,
    ConsoleInterface,
    AsyncVersionOf,
} from './types.js'
import { ERROR, isArray, isFunction, isString, Promise_resolve, replayFunction, undefined } from './utils/constants.js'

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
): AsyncVersionOf<OtherSideImplementedFunctions> {
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
    const [log_beCalled, log_localError, log_remoteError, log_pretty, log_requestReplay, log_sendLocalStack] =
        normalizeLogOptions(log)
    const {
        log: console_log,
        error: console_error = console_log,
        debug: console_debug = console_log,
        groupCollapsed: console_groupCollapsed = console_log,
        groupEnd: console_groupEnd = console_log,
        warn: console_warn = console_log,
    } = (logger || console) as ConsoleInterface
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
            const e = data.error as any
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
            // todo: should check before access e.stack
            return ErrorResponseParseError(e, mapError || defaultErrorMapper(e && (e as any).stack))
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
    const call = (method: string | symbol, args: unknown[], stack: string | undefined, notify = false) => {
        return new Promise<void>((resolve, reject) => {
            let queue: BatchQueue | undefined = undefined
            if (method === AsyncCallBatch) {
                queue = args.shift() as any
                method = args.shift() as any
            }
            if (typeof method === 'symbol') {
                const RPCInternalMethod: string = Symbol.keyFor(method) || (method as any).description
                if (RPCInternalMethod) {
                    if (RPCInternalMethod.startsWith('rpc.')) method = RPCInternalMethod
                    else throw new TypeError('Not start with rpc.')
                }
            } else if (method.startsWith('rpc.')) {
                throw makeHostedMessage(Err_Cannot_call_method_starts_with_rpc_dot_directly, new TypeError())
            }

            if (preferLocalImplementation && !isThisSideImplementationPending && isString(method)) {
                const localImpl: unknown =
                    resolvedThisSideImplementationValue && (resolvedThisSideImplementationValue as any)[method]
                if (isFunction(localImpl)) return resolve(localImpl(...args))
            }
            const id = idGenerator()
            stack = removeStackHeader(stack)
            const param = parameterStructures === 'by-name' && args.length === 1 && isObject(args[0]) ? args[0] : args
            const request = Request(
                notify ? undefined : id,
                method as string,
                param,
                log_sendLocalStack ? stack : undefined,
            )
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
    const getTrap = new Proxy(
        {},
        {
            get(_, method) {
                const f = {
                    // This function will be logged to the console so it must be 1 line
                    [method]: (..._: unknown[]) => call(method, _, new Error().stack),
                }[method as any]!
                const f2 = {
                    [method]: (..._: unknown[]) => call(method, _, new Error().stack, true),
                }[method as any]!
                // @ts-expect-error
                f[AsyncCallNotify] = f2[AsyncCallNotify] = f2
                isString(method) && Object.defineProperty(methodContainer, method, { value: f, configurable: true })
                return f
            },
        },
    )
    const methodContainer = { __proto__: getTrap } as any
    if (thenable === false) methodContainer.then = undefined
    else if (thenable === undefined) {
        Object.defineProperty(methodContainer, 'then', {
            configurable: true,
            get() {
                console_warn(
                    makeHostedMessage(
                        Err_Then_is_accessed_on_local_implementation_Please_explicitly_mark_if_it_is_thenable_in_the_options,
                        new TypeError('RPC used as Promise: '),
                    ),
                )
            },
        })
    }
    return new Proxy(methodContainer, {
        getPrototypeOf: () => null,
        setPrototypeOf: (_, value) => value === null,
    }) as AsyncVersionOf<OtherSideImplementedFunctions>
}
// Assume a console object in global if there is no custom logger provided
declare const console: ConsoleInterface
