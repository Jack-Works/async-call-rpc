/**
 * A light implementation of {@link https://www.jsonrpc.org/specification | JSON RPC 2.0}
 *
 * @remarks
 *
 * ```ts
 * interface JSONRPC_Response_object {
 *      // This property is a hint.
 *      // If the client is run in JavaScript,
 *      // it should treat "result: null" as "result: undefined"
 *     resultIsUndefined?: boolean
 * }
 * ```
 *
 * ====================================
 *
 * Implemented internal JSON RPC methods
 *
 * ```ts
 * interface JSONRPC_Internal_Methods {
 *      // These 4 methods represent the Async Iterator protocol in ECMAScript
 *      // this method starts an async iterator, return the id
 *      'rpc.async-iterator.start'(method: string, params: unknown[]): Promise<string>
 *      // this method executes `next` method on the previous iterator started by `rpc.async-iterator.start`
 *      'rpc.async-iterator.next'(id: string, value: unknown): Promise<IteratorResult<unknown>>
 *      // this method executes `return` method on the previous iterator started by `rpc.async-iterator.start`
 *      'rpc.async-iterator.return'(id: string, value: unknown): Promise<IteratorResult<unknown>>
 *      // this method executes `throw` method on the previous iterator started by `rpc.async-iterator.start`
 *      'rpc.async-iterator.throw'(id: string, value: unknown): Promise<IteratorResult<unknown>>
 * }
 * ```
 *
 * @example
 * - Simple usage:
 *
 * As a Server
 * ```ts
 * AsyncCall({
 *      async add(a: number, b: number) {
 *          return a + b
 *      }
 * }, { messageChannel })
 * ```
 *
 * As a client
 * ```ts
 * const server = AsyncCall<{
 *      add(a: number, b: number): Promise<number>
 * }>({}, { messageChannel })
 * server.add(1, 5).then(console.log)
 * ```
 *
 * - Share type in a mono repo
 *
 * Code for UI:
 * ```ts
 * const UI = {
 *      async dialog(text: string) {
 *          alert(text)
 *      },
 * }
 * export type UI = typeof UI
 * const callsClient = AsyncCall<Server>(UI, { messageChannel })
 * callsClient.sendMail('hello world', 'what')
 * ```
 *
 * Code for server
 *
 * ```ts
 * const Server = {
 *      async sendMail(text: string, to: string) {
 *          return true
 *      }
 * }
 * export type Server = typeof Server
 * const calls = AsyncCall<UI>(Server, { messageChannel })
 * calls.dialog('hello')
 * ```
 *
 * - A demo implementation of `messageChannel`
 *
 * ```ts
class PlayGroundChannel {
    static server = document.createElement('a')
    static client = document.createElement('a')
    // actor: 'server' | 'client'
    constructor(actor) {
        this.actor = actor
        PlayGroundChannel[actor].addEventListener('targetEventChannel', e => {
            const detail = e.detail
            for (const f of this.listener) {
                try {
                    f(detail)
                } catch {}
            } //
        })
    } //
    listener = []
    on(_, cb) { this.listener.push(cb) }
    emit(_, data) {
        PlayGroundChannel[this.actor === 'client' ? 'server' : 'client'].dispatchEvent(
            new CustomEvent('targetEventChannel', { detail: data }),
        ) //
    } //
} //
```
 *
 * @packageDocumentation
 */

export * from './Async-Call'
export * from './Async-Call-Generator'
