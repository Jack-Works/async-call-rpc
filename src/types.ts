/**
 * ! This file MUST NOT contain any import statement.
 * ! This file is part of public API of this package (for Deno users).
 */

/**
 * This interface represents a "on message" - "send response" model.
 * @remarks
 * Usually used for there is only 1 remote (act like a client).
 * Example: {@link https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/websocket.server.ts | Example for EventBasedChannel}
 * @public
 */
export interface EventBasedChannel<Data = unknown> {
    /**
     * Register the message listener.
     * @param listener - The message listener.
     * @returns a function that unregister the listener.
     */
    on(listener: (data: Data) => void): void | (() => void)
    /**
     * Send the data to the remote side.
     * @param data - The data should send to the remote side.
     */
    send(data: Data): void
}

/**
 * This interface represents a "callback" model.
 * @remarks
 * Usually used for there are many remotes (act like a server).
 * Example: {@link https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/websocket.client.ts | Example for CallbackBasedChannel}
 * @public
 */
export interface CallbackBasedChannel<Data = unknown> extends Partial<EventBasedChannel<Data>> {
    /**
     * Setup the CallbackBasedChannel.
     * @param jsonRPCHandlerCallback - A function that will execute the JSON RPC request then give the result back. If the result is undefined, it means no response is created.
     * @param isValidPayload - A util function that will try to validate if the message is a valid JSON RPC request. It will be synchronous if possible.
     * @returns a function that unregister the setup.
     */
    setup(
        jsonRPCHandlerCallback: (jsonRPCPayload: unknown) => Promise<unknown | undefined>,
        isValidJSONRPCPayload: (data: unknown) => boolean | Promise<boolean>,
    ): (() => void) | void
}
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
     * - {@link https://github.com/jack-works/async-call-rpc#web-deno-and-node-bson | BSONSerialization} (use the {@link https://npmjs.org/bson | bson} as the serializer)
     *
     * @defaultValue {@link NoSerialization}
     */
    serializer?: Serialization
    /**
     * Provide the logger of AsyncCall
     * @remarks
     * See {@link ConsoleInterface}
     * @defaultValue globalThis.console
     */
    logger?: ConsoleInterface
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
 * @public
 */
export type AsyncVersionOf<T> = T extends Record<keyof T, (...args: any) => PromiseLike<any>>
    ? 'then' extends keyof T
        ? Omit<Readonly<T>, 'then'>
        : // in this case we don't want to use Readonly<T>, so it will provide a better experience
          T
    : _AsyncVersionOf<T>
/** @internal */
export type _AsyncVersionOf<T> = {
    readonly // Explicitly exclude key called "then" because it will cause problem in promise auto-unwrap.
    [key in keyof T as key extends 'then' ? never : T[key] extends Function ? key : never]: T[key] extends (
        ...args: any
    ) => Promise<any>
        ? T[key] // If it is returning Promise<any>, we use T[key] to preserve generics on function signatures
        : T[key] extends (...args: infer Args) => infer Return // otherwise we convert it to async functions
        ? (...args: Args) => Promise<Awaited<Return>>
        : never
}
/**
 * The minimal Console interface that AsyncCall needs.
 * @public
 * @remarks
 * The method not provided will use "log" as it's fallback.
 */
export interface ConsoleInterface {
    warn?(...args: unknown[]): void
    debug?(...args: unknown[]): void
    log(...args: unknown[]): void
    groupCollapsed?(...args: unknown[]): void
    groupEnd?(...args: unknown[]): void
    error?(...args: unknown[]): void
}
export type { ConsoleInterface as Console }

/**
 * Serialize and deserialize of the JSON RPC payload
 * @public
 */
export interface Serialization {
    /**
     * Serialize data
     * @param from - original data
     */
    serialization(from: any): unknown | PromiseLike<unknown>
    /**
     * Deserialize data
     * @param serialized - Serialized data
     */
    deserialization(serialized: unknown): unknown | PromiseLike<unknown>
}
