export type * from './types.ts'
export type { _IgnoreResponse } from './core/notify.ts'
export { JSONSerialization, NoSerialization } from './utils/serialization.ts'
export { JSONEncoder, type JSONEncoderOptions } from './utils/encoder.ts'
export { notify } from './core/notify.ts'
export { batch } from './core/batch.ts'

import {
    makeRequest,
    ErrorResponseMapped,
    makeSuccessResponse,
    isJSONRPCObject,
    defaultErrorMapper,
    ErrorResponseMethodNotFound,
    ErrorResponseInvalidRequest,
    ErrorResponseParseError,
} from './utils/jsonrpc.ts'
import {
    removeStackHeader,
    RecoverError,
    makeHostedMessage,
    Err_Cannot_call_method_starts_with_rpc_dot_directly,
    Err_Then_is_accessed_on_local_implementation_Please_explicitly_mark_if_it_is_thenable_in_the_options,
    onAbort,
} from './utils/error.ts'
import { generateRandomID } from './utils/generateRandomID.ts'
import { normalizeStrictOptions, normalizeLogOptions } from './utils/normalizeOptions.ts'
import { AsyncCallIgnoreResponse, AsyncCallNotify, AsyncCallBatch } from './utils/internalSymbol.ts'
import type { BatchQueue } from './core/batch.ts'
import type {
    CallbackBasedChannel,
    EventBasedChannel,
    AsyncCallOptions,
    ConsoleInterface,
    AsyncVersionOf,
    Request,
    Response,
    SuccessResponse,
    ErrorResponse,
    IsomorphicEncoderFull,
    IsomorphicEncoder,
    Requests,
    Responses,
} from './types.ts'
import { apply, ERROR, isArray, isFunction, isObject, isString, Promise_resolve, undefined } from './utils/constants.ts'

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
    type Hint = 'request' | 'response' | undefined

    let isThisSideImplementationPending = true
    let resolvedThisSideImplementationValue: unknown
    let rejectedThisSideImplementation: unknown

    let resolvedChannel: EventBasedChannel | CallbackBasedChannel | undefined
    let channelPromise: Promise<EventBasedChannel | CallbackBasedChannel> | undefined
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
    const onChannelResolved = (channel: EventBasedChannel | CallbackBasedChannel) => {
        resolvedChannel = channel
        if (isCallbackBasedChannel(channel)) {
            channel.setup(
                (data, hint) => rawMessageReceiver(data, hint).then(rawMessageSender),
                (data, hint) => {
                    let _ = hintedDecode(data, hint)

                    if (isJSONRPCObject(_)) return true
                    return Promise_resolve(_).then(isJSONRPCObject)
                },
            )
        }
        if (isEventBasedChannel(channel)) {
            const m = channel
            m.on &&
                m.on((_, hint) =>
                    rawMessageReceiver(_, hint)
                        .then(rawMessageSender)
                        .then((x) => x && m.send!(x)),
                )
        }
        return channel
    }

    const {
        serializer,
        encoder,
        key: deprecatedName,
        name,
        strict = true,
        log = true,
        parameterStructures: deprecatedParameterStructures,
        parameterStructure,
        preferLocalImplementation = false,
        idGenerator = generateRandomID,
        mapError,
        logger,
        channel,
        thenable,
        signal,
        forceSignal,
    } = options

    // Note: we're not shorten this error message because it will be removed in the next major version.
    if (serializer && encoder) throw new TypeError('Please remove serializer.')
    if (name && deprecatedName) throw new TypeError('Please remove key.')
    if (deprecatedParameterStructures && parameterStructure) throw new TypeError('Please remove parameterStructure.')
    const paramStyle = deprecatedParameterStructures || parameterStructure || 'by-position'
    const logKey = name || deprecatedName || 'rpc'

    const throwIfAborted = () => {
        signal && signal.throwIfAborted()
        forceSignal && forceSignal.throwIfAborted()
    }

    const {
        encode: encodeFromOption,
        encodeRequest: encodeRequestFromOption,
        encodeResponse: encodeResponseFromOption,
        decode,
        decodeRequest,
        decodeResponse,
    } = (encoder || {}) as IsomorphicEncoder & IsomorphicEncoderFull

    const encodeRequest: (data: Requests | Responses) => any = encoder
        ? (data) => apply(encodeRequestFromOption || encodeFromOption, encoder, [data])
        : serializer
          ? (data) => serializer.serialization(data)
          : Object

    const encodeResponse: (data: Requests | Responses) => any = encoder
        ? (data) => apply(encodeResponseFromOption || encodeFromOption, encoder, [data])
        : serializer
          ? (data) => serializer.serialization(data)
          : Object

    const hintedDecode: (data: unknown, hint: Hint) => unknown = encoder
        ? (data, hint) =>
              hint == 'request'
                  ? apply(decodeRequest || decode, encoder, [data])
                  : hint == 'response'
                    ? apply(decodeResponse || decode, encoder, [data])
                    : apply(decode, encoder, [data])
        : serializer
          ? (data) => serializer.deserialization(data)
          : Object

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
    type PromiseParam = [resolve: (value?: any) => void, reject: (reason?: any) => void, stack?: string]
    const requestContext = new Map<string | number, PromiseParam>()

    onAbort(forceSignal, () => {
        requestContext.forEach((x) => x[1](forceSignal!.reason))
        requestContext.clear()
    })

    const onRequest = async (data: Request): Promise<Response | undefined> => {
        if ((signal && signal.aborted) || (forceSignal && forceSignal.aborted))
            return makeErrorObject((signal && signal.reason) || (forceSignal && forceSignal.reason), '', data)
        if (isThisSideImplementationPending) await awaitThisSideImplementation()
        // TODO: in next major version we should not send this message since it might contain sensitive info.
        else if (rejectedThisSideImplementation) return makeErrorObject(rejectedThisSideImplementation, '', data)
        let frameworkStack: string = ''
        try {
            const { params, method, id: req_id, remoteStack } = data
            // ? We're mapping any method starts with 'rpc.' to a Symbol.for
            const key = (method.startsWith('rpc.') ? Symbol.for(method) : method) as keyof object
            const executor: unknown = resolvedThisSideImplementationValue && resolvedThisSideImplementationValue[key]
            if (!isFunction(executor)) {
                if (!banMethodNotFound) {
                    if (log_localError) console_debug('Missing method', key, data)
                    return
                } else return ErrorResponseMethodNotFound(req_id)
            }
            const args = isArray(params) ? params : [params]
            frameworkStack = removeStackHeader(new Error().stack)
            const promise = new Promise((resolve) =>
                resolve(apply(executor, resolvedThisSideImplementationValue, args)),
            )
            if (log_beCalled) {
                if (log_pretty) {
                    const logArgs: unknown[] = [
                        `${logKey}.%c${method}%c(${args.map(() => '%o').join(', ')}%c)\n%o %c@${req_id}`,
                        'color:#d2c057',
                        '',
                        ...args,
                        '',
                        promise,
                        'color:gray;font-style:italic;',
                    ]
                    if (log_requestReplay) {
                        const replay = () => {
                            debugger
                            return apply(executor, resolvedThisSideImplementationValue, args)
                        }
                        // this function will be logged, keep it short.
                        // Do not inline it, it's hard to keep it in a single line after build step.
                        logArgs.push(() => replay())
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
            return makeSuccessResponse(req_id, result)
        } catch (e) {
            return makeErrorObject(e, frameworkStack, data)
        }
    }
    const onResponse = async (data: Response): Promise<void> => {
        let errorMessage = '',
            remoteErrorStack = '',
            errorCode = 0,
            errorType = ERROR
        if ('error' in data) {
            const e = data.error
            errorMessage = e.message
            errorCode = e.code
            const detail = e.data

            if (isObject(detail) && 'stack' in detail && isString(detail.stack)) remoteErrorStack = detail.stack
            else remoteErrorStack = '<remote stack not available>'

            if (isObject(detail) && 'type' in detail && isString(detail.type)) errorType = detail.type
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
        const { id } = data
        if (id === null || id === undefined || !requestContext.has(id)) return
        const [resolve, reject, localErrorStack = ''] = requestContext.get(id)!
        requestContext.delete(id)
        if ('error' in data) {
            reject(
                // TODO: add a hook to customize this
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
    const rawMessageReceiver = async (
        _: unknown,
        hint: Hint,
    ): Promise<undefined | Response | (Response | undefined)[]> => {
        let data: unknown
        let result: Response | undefined = undefined
        try {
            data = await hintedDecode(_, hint)
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
            let stack: string | undefined
            try {
                stack = '' + (e as any).stack
            } catch {}
            return ErrorResponseParseError(e, mapError || defaultErrorMapper(stack))
        }
    }
    const rawMessageSender = async (res: undefined | Response | (Response | undefined)[]) => {
        if (!res) return
        if (isArray(res)) {
            const reply = res.filter((x): x is Response => (x && 'id' in x) as boolean)
            if (reply.length === 0) return
            return encodeResponse(reply)
        } else {
            return encodeResponse(res)
        }
    }

    if (channel instanceof Promise) channelPromise = channel.then(onChannelResolved)
    else onChannelResolved(channel)

    const makeErrorObject = (e: any, frameworkStack: string, data: Request) => {
        if (isObject(e) && 'stack' in e)
            e.stack = frameworkStack
                .split('\n')
                .reduce((stack, fstack) => stack.replace(fstack + '\n', ''), '' + e.stack)
        if (log_localError) console_error(e)
        return ErrorResponseMapped(data, e, mapError || defaultErrorMapper(log_sendLocalStack ? e.stack : undefined))
    }

    const sendPayload = async (payload: Requests | BatchQueue, removeQueueR?: true) => {
        if (removeQueueR) payload = [...(payload as BatchQueue)]
        const data = await encodeRequest(payload)
        return (resolvedChannel || (await channelPromise))!.send!(data)
    }
    const rejectsQueue = (queue: BatchQueue, error: unknown) => {
        for (const x of queue) {
            if ('id' in x) {
                const ctx = requestContext.get(x.id!)
                ctx && ctx[1](error)
            }
        }
    }
    const handleSingleMessage = async (
        data: SuccessResponse | ErrorResponse | Request,
    ): Promise<SuccessResponse | ErrorResponse | undefined> => {
        if ('method' in data) {
            if ('id' in data) {
                if (!forceSignal) return onRequest(data)
                return new Promise((resolve, reject) => {
                    const handleForceAbort = () => resolve(makeErrorObject(forceSignal.reason, '', data))
                    onRequest(data)
                        .then(resolve, reject)
                        .finally(() => forceSignal.removeEventListener('abort', handleForceAbort))
                    onAbort(forceSignal, handleForceAbort)
                })
            }
            onRequest(data).catch(() => {})
            return // Skip response for notifications
        }
        return onResponse(data) as Promise<undefined>
    }
    const call = (method: string | symbol, args: unknown[], stack: string | undefined, notify = false) => {
        return new Promise<void>((resolve, reject) => {
            throwIfAborted()
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
            const param = paramStyle === 'by-name' && args.length === 1 && isObject(args[0]) ? args[0] : args
            const request = makeRequest(
                notify ? undefined : id,
                method as string,
                param,
                log_sendLocalStack ? stack : undefined,
            )
            if (queue) {
                queue.push(request)
                if (!queue.r) queue.r = [() => sendPayload(queue!, true), (e) => rejectsQueue(queue!, e)]
            } else sendPayload(request).catch(reject)
            if (notify) return resolve()
            requestContext.set(id, [resolve, reject, stack])
        })
    }
    const getTrap = (_: any, method: string | symbol) => {
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
    }
    const methodContainer: any = { __proto__: new Proxy({}, { get: getTrap }) }
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
        // some library will treat this object as a normal object and run algorithm steps in https://tc39.es/ecma262/#sec-ordinaryget
        getOwnPropertyDescriptor(_, method) {
            if (!(method in methodContainer)) getTrap(_, method) // trigger [[Get]]
            return Object.getOwnPropertyDescriptor(methodContainer, method)
        },
    }) as AsyncVersionOf<OtherSideImplementedFunctions>
}
// Assume a console object in global if there is no custom logger provided
declare const console: ConsoleInterface

const isEventBasedChannel = (x: EventBasedChannel | CallbackBasedChannel): x is EventBasedChannel =>
    'send' in x && isFunction(x.send)
const isCallbackBasedChannel = (x: EventBasedChannel | CallbackBasedChannel): x is CallbackBasedChannel =>
    'setup' in x && isFunction(x.setup)
