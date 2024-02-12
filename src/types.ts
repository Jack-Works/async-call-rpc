/**
 * This interface represents a "on message" - "send response" model.
 * @remarks
 * Usually used for there is only 1 remote (act like a client).
 * Example: {@link https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/node/websocket.server.ts | Example for EventBasedChannel}
 * @public
 */
export interface EventBasedChannel<Data = unknown> {
    /**
     * Register the message listener.
     * @param listener - The message listener.
     * @returns a function that unregister the listener.
     */
    on(listener: (data: Data, hint?: 'request' | 'response' | undefined) => void): void | (() => void)
    /**
     * Send the data to the remote side.
     * @param data - The data should send to the remote side.
     */
    send(data: Data): void | Promise<void>
}

/**
 * This interface represents a "callback" model.
 * @remarks
 * Usually used for there are many remotes (act like a server).
 * Example: {@link https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/web/websocket.client.ts | Example for CallbackBasedChannel}
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
        jsonRPCHandlerCallback: (
            jsonRPCPayload: unknown,
            hint?: undefined | 'request' | 'response',
        ) => Promise<unknown | undefined>,
        isValidJSONRPCPayload: (data: unknown, hint?: undefined | 'request' | 'response') => boolean | Promise<boolean>,
    ): (() => void) | void
}
/**
 * Log options
 * @remarks
 * This option controls how AsyncCall log requests to the console.
 * @public
 * @privateRemarks
 * TODO: rename to AsyncCallLogOptions
 * TODO: split to server log and client log
 */
export interface AsyncCallLogLevel {
    /**
     * Log all incoming requests
     * @defaultValue true
     * @privateRemarks
     * TODO: rename to called
     */
    beCalled?: boolean
    /**
     * Log all errors when responding requests
     * @defaultValue true
     */
    localError?: boolean
    /**
     * Log errors from the remote
     * @defaultValue true
     */
    remoteError?: boolean
    /**
     * Send the stack to the remote when making requests
     * @defaultValue false
     * @privateRemarks
     * TODO: rename this field to sendRequestStack and move it to AsyncCallOptions.
     */
    sendLocalStack?: boolean
    /**
     * Style of the log
     * @remarks
     * If this option is set to "pretty", it will log with some CSS to make the log easier to read in the browser devtools.
     * Check out this article to know more about it: {@link https://dev.to/annlin/consolelog-with-css-style-1mmp | Console.log with CSS Style}
     * @defaultValue 'pretty'
     */
    type?: 'basic' | 'pretty'
    /**
     * If log a function that can replay the request
     * @remarks
     * Do not use this options in the production environment because it will log a closure that captures all arguments of requests. This may cause memory leak.
     * @defaultValue false
     */
    requestReplay?: boolean
}

/**
 * Strict options
 * @remarks
 * Control the behavior that different from the JSON-RPC specification.
 * @public
 */
export interface AsyncCallStrictOptions {
    /**
     * Controls if AsyncCall send an ErrorResponse when the requested method is not defined.
     * @remarks
     * If this option is set to false, AsyncCall will ignore the request and print a log if the method is not defined.
     * @defaultValue true
     */
    methodNotFound?: boolean
    /**
     * Controls if AsyncCall send an ErrorResponse when the message is not valid.
     * @remarks
     * If this option is set to false, AsyncCall will ignore the request that cannot be parsed as a valid JSON RPC payload.
     * This is useful when the message channel is also used to transfer other kinds of messages.
     * @defaultValue true
     */
    unknownMessage?: boolean
    // TODO: implement this if there is need
    /**
     * Controls if redundant arguments on the client triggers a warning or error.
     * @see {@link https://www.jsonrpc.org/specification#parameter_structures}
     * @remarks
     * If this option is set and parameterStructure is "by-name",
     * and the client calls with more than 1 argument, it will trigger a warning or error.
     *
     * @defaultValue false
     */
    // redundantArguments?: false | 'error' | 'warning'
}
/**
 * Strict options
 * @remarks
 * Control the behavior that different from the JSON-RPC specification.
 * @public
 * @deprecated renamed to {@link AsyncCallStrictOptions}
 */
export interface AsyncCallStrictJSONRPC extends AsyncCallStrictOptions {}

/**
 * Options for {@link AsyncCall}
 * @public
 */
export interface AsyncCallOptions<EncodedRequest = unknown, EncodedResponse = unknown> {
    /**
     * Name used when pretty log is enabled.
     * @defaultValue `rpc`
     * @deprecated Renamed to "name".
     */
    key?: string
    /**
     * Name used when pretty log is enabled.
     * @defaultValue `rpc`
     */
    name?: string
    /**
     * Serializer of the requests and responses.
     * @deprecated Use "encoding" option instead. This option will be removed in the next major version.
     * @see {@link Serialization}.
     */
    serializer?: Serialization
    /**
     * Encoder of requests and responses.
     * @see {@link IsomorphicEncoder} or {@link IsomorphicEncoderFull}.
     * @remarks
     * There are some built-in encoders:
     *
     * - JSONEncoder: is using JSON.parser and JSON.stringify under the hood.
     * @defaultValue undefined
     */
    encoder?:
        | IsomorphicEncoder<EncodedRequest, EncodedResponse>
        | IsomorphicEncoderFull<EncodedRequest, EncodedResponse>
    /**
     * Provide the logger
     * @see {@link ConsoleInterface}
     * @defaultValue globalThis.console
     * @privateRemarks
     * TODO: allow post-create tweak?
     */
    logger?: ConsoleInterface
    /**
     * The message channel to exchange messages between server and client
     * @example
     * {@link https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/web/websocket.client.ts | Example for CallbackBasedChannel} or {@link https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/node/websocket.server.ts | Example for EventBasedChannel}
     * @privateRemarks
     * TODO: split to ClientChannel (onResponse, send) and IsomorphicChannel
     */
    channel:
        | CallbackBasedChannel<EncodedRequest | EncodedResponse>
        | EventBasedChannel<EncodedRequest | EncodedResponse>
        | Promise<
              | CallbackBasedChannel<EncodedRequest | EncodedResponse>
              | EventBasedChannel<EncodedRequest | EncodedResponse>
          >
    /**
     * Choose log level.
     * @remarks
     * - `true` is a reasonable default value, which means all options are the default in the {@link AsyncCallLogLevel}
     *
     * - `false` is disable all logs
     *
     * - `"all"` is enable all logs (stronger than `true`).
     * @defaultValue true
     * @privateRemarks
     * TODO: allow post-create tweak?
     */
    log?: AsyncCallLogLevel | boolean | 'all'
    /**
     * Control the behavior that different from the JSON-RPC spec
     * @see {@link AsyncCallStrictJSONRPC}
     * @remarks
     * - `true` is to enable all strict options
     * - `false` is to disable all strict options
     * @defaultValue true
     */
    strict?: AsyncCallStrictJSONRPC | boolean
    /**
     * Choose flavor of parameter structures defined in the spec
     * @see {@link https://www.jsonrpc.org/specification#parameter_structures}
     * @remarks
     * When using `by-name`, only first parameter is sent to the remote and it must be an object.
     *
     * @deprecated renamed to "parameterStructure"
     * @defaultValue "by-position"
     */
    parameterStructures?: 'by-position' | 'by-name'
    /**
     * Choose flavor of parameter structures defined in the spec
     * @see {@link https://www.jsonrpc.org/specification#parameter_structures}
     * @remarks
     * When using `by-name`, only first parameter is sent to the remote and it must be an object.
     *
     * @privateRemarks
     * TODO: review the edge cases when using "by-name".
     * TODO: throw an error/print a warning when using "by-name" and the first parameter is not an object/more than 1 parameter is given.
     * @defaultValue "by-position"
     */
    parameterStructure?: 'by-position' | 'by-name'
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
     * Change the {@link ErrorResponseDetail}.
     * @privateRemarks
     * TODO: provide a JSONRPCError class to allow customizing ErrorResponseDetail without mapError.
     */
    mapError?: ErrorMapFunction<unknown>
    /**
     * If the instance is "thenable".
     * @defaultValue undefined
     * @remarks
     * If this options is set to `true`, it will return a `then` method normally (forwards the request to the remote).
     *
     * If this options is set to `false`, it will return `undefined`, which means a method named "then" on the remote is not reachable.
     *
     * If this options is set to `undefined`, it will return `undefined` and show a warning. You must explicitly set this option to `true` or `false` to dismiss the warning.
     *
     * This option is used to resolve the problem caused by Promise auto-unwrapping.
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
    /**
     * AbortSignal to stop the instance.
     * @see {@link https://mdn.io/AbortSignal}
     * @remarks
     * `signal` is used to stop the instance. If the `signal` is aborted, then all new requests will be rejected, except for the pending ones.
     */
    signal?: AbortSignalLike
    /**
     * AbortSignal to force stop the instance.
     * @see {@link https://mdn.io/AbortSignal}
     * @remarks
     * `signal` is used to stop the instance. If the `signal` is aborted, then all new requests will be rejected, and the pending requests will be forcibly rejected and pending results will be ignored.
     */
    forceSignal?: AbortSignalLike
}

/**
 * AbortSignal
 * @public
 * @see {@link https://mdn.io/AbortSignal}
 * @remarks
 * This is a subset of the AbortSignal interface defined in the [WinterCG](https://wintercg.org/).
 */
export interface AbortSignalLike {
    readonly aborted: boolean
    addEventListener(type: 'abort', listener: () => void, options: { once: boolean }): void
    removeEventListener(type: 'abort', listener: () => void): void
    throwIfAborted(): void
    reason: any
}

/**
 * @public
 * @param error - The exception
 * @param request - The request object
 * @privateRemarks
 * TODO: remove T generic parameter
 */
export type ErrorMapFunction<T = unknown> = (
    error: unknown,
    request: Readonly<Request>,
) => {
    code: number
    message: string
    data?: T
}

/**
 * Make all functions in T becomes an async function and filter non-Functions out.
 *
 * @remarks
 * Only generics signatures on function that returning an Promise<T> will be preserved due to the limitation of TypeScript.
 *
 * Method called `then` are intentionally removed because it is very likely to be a foot gun in promise auto-unwrap.
 * @public
 */
export type AsyncVersionOf<T> =
    T extends Record<keyof T, (...args: any) => PromiseLike<any>>
        ? 'then' extends keyof T
            ? Omit<Readonly<T>, 'then'>
            : // in this case we don't want to use Readonly<T>, so it will provide a better experience
              T
        : _AsyncVersionOf<T>
/** @internal */
export type _AsyncVersionOf<T> = {
    // Explicitly exclude key called "then" because it will cause problem in promise auto-unwrap.
    readonly [key in keyof T as key extends 'then' ? never : T[key] extends Function ? key : never]: T[key] extends (
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
 * Encoder of the client.
 * @public
 */
export interface ClientEncoding<EncodedRequest = unknown, EncodedResponse = unknown> {
    /**
     * Encode the request object.
     * @param data - The request object
     */
    encodeRequest(data: Requests): EncodedRequest | PromiseLike<EncodedRequest>
    /**
     * Decode the response object.
     * @param encoded - The encoded response object
     */
    decodeResponse(encoded: EncodedResponse): Responses | PromiseLike<Responses>
}
/**
 * Encoder of the server.
 * @public
 */
export interface ServerEncoding<EncodedRequest = unknown, EncodedResponse = unknown> {
    /**
     * Encode the response object.
     * @param data - The response object
     */
    decodeRequest(encoded: EncodedRequest): Requests | PromiseLike<Requests>
    /**
     * Decode the request object.
     * @param encoded - The encoded request object
     */
    encodeResponse(data: Responses): EncodedResponse | PromiseLike<EncodedResponse>
}
/**
 * Encoder that work for both server and client.
 * @public
 */
export interface IsomorphicEncoder<EncodedRequest = unknown, EncodedResponse = unknown> {
    /**
     * Encode the request or response object.
     * @param data - The request or response object
     */
    encode(data: Requests | Responses): EncodedRequest | EncodedResponse | PromiseLike<EncodedRequest | EncodedResponse>
    /**
     * Decode the request or response object.
     * @param encoded - The encoded request or response object
     */
    decode(encoded: EncodedRequest | EncodedResponse): Requests | Responses | PromiseLike<Requests | Responses>
}
/**
 * Encoder that work for both server and client.
 * @public
 */
export interface IsomorphicEncoderFull<EncodedRequest = unknown, EncodedResponse = unknown>
    extends ClientEncoding<EncodedRequest, EncodedResponse>,
        ServerEncoding<EncodedRequest, EncodedResponse>,
        Partial<Pick<IsomorphicEncoder, 'decode'>> {}

/**
 * Serialize and deserialize of the JSON-RPC payload
 * @public
 * @deprecated Use {@link IsomorphicEncoder} instead.
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
//#region JSON-RPC spec types

/**
 * A request object or an array of request objects.
 * @public
 */
export type Requests = Request | readonly Request[]
/**
 * A response object or an array of response objects.
 * @public
 */
export type Responses = Response | readonly Response[]
/**
 * ID of a JSON-RPC request/response.
 * @public
 */
export type ID = string | number | null | undefined
/**
 * JSON-RPC Request object.
 * @public
 * @see https://www.jsonrpc.org/specification#request_object
 */
export interface Request {
    readonly jsonrpc: '2.0'
    readonly id?: ID
    readonly method: string
    readonly params: readonly unknown[] | object
    /**
     * Non-standard field. It records the caller's stack of this Request.
     */
    // TODO: Rename to "x-stack" in the next major version.
    readonly remoteStack?: string | undefined
}

/**
 * JSON-RPC SuccessResponse object.
 * @public
 * @see https://www.jsonrpc.org/specification#response_object
 */
export interface SuccessResponse {
    readonly jsonrpc: '2.0'
    readonly id?: ID
    result: unknown
    /**
     * Non-standard property
     * @remarks
     * This is a non-standard field that used to represent the result field should be `undefined` instead of `null`.
     *
     * A field with value `undefined` will be omitted in `JSON.stringify`,
     * and if the `"result"` field is omitted, this is no longer a valid JSON-RPC response object.
     *
     * By default, AsyncCall will convert `undefined` to `null` to keep the response valid, but it _won't_ add this field.
     *
     * Set `keepUndefined` in JSONEncoderOptions to `"keep"` will add this field.
     *
     * This field starts with a space, so TypeScript will hide it when providing completion.
     */
    // TODO: rename to "x-undefined" or " _u" in the next major version
    undef?: unknown
}
/**
 * JSON-RPC ErrorResponse object.
 * @public
 * @see https://www.jsonrpc.org/specification#error_object
 */
export interface ErrorResponse<Error = unknown> {
    readonly jsonrpc: '2.0'
    readonly id?: ID
    readonly error: ErrorResponseDetail<Error>
}
/**
 * The "error" record on the JSON-RPC ErrorResponse object.
 * @public
 * @see https://www.jsonrpc.org/specification#error_object
 */
export interface ErrorResponseDetail<Error = unknown> {
    readonly code: number
    readonly message: string
    readonly data?: Error
}
/**
 * A JSON-RPC response object
 * @public
 * @see https://www.jsonrpc.org/specification#response_object
 */
export type Response = SuccessResponse | ErrorResponse
//#endregion
