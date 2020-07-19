/**
 * This interface represents a "on message"-"send response" model.
 * @remarks
 * Usually used for there is only 1 remote (act like a client).
 * @public
 * @example
 *
 * [Example for EventBasedChannel](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/websocket.server.ts).
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
 * @public
 * @example
 *
 * [Example for CallbackBasedChannel](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/websocket.client.ts).
 */
export interface CallbackBasedChannel<Data = unknown> extends Partial<EventBasedChannel<Data>> {
    /**
     * Setup the CallbackBasedChannel..
     * @param jsonRPCHandlerCallback - A function that will execute the JSON RPC request then give the result back. If the result is undefined, it means no response is created.
     * @param isValidPayload - A util function that will try to validate if the message is a valid JSON RPC request. It will be asynchronous if possible.
     */
    setup(
        jsonRPCHandlerCallback: (jsonRPCPayload: unknown) => Promise<unknown | undefined>,
        isValidJSONRPCPayload: (data: unknown) => boolean | Promise<boolean>,
    ): (() => void) | void
}
