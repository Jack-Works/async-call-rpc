import type { AbortSignalLike } from '../types.ts'

class CustomError extends Error {
    // TODO: support cause
    constructor(
        public name: string,
        message: string,
        public code: number,
        public stack: string,
    ) {
        super(message)
    }
}
export const Err_Cannot_find_a_running_iterator_with_given_ID: unique symbol = {} as any
export const Err_Only_string_can_be_the_RPC_method_name: unique symbol = {} as any
export const Err_Cannot_call_method_starts_with_rpc_dot_directly: unique symbol = {} as any
export const Err_Then_is_accessed_on_local_implementation_Please_explicitly_mark_if_it_is_thenable_in_the_options: unique symbol =
    {} as any
const Messages = [
    Err_Cannot_find_a_running_iterator_with_given_ID,
    Err_Only_string_can_be_the_RPC_method_name,
    Err_Cannot_call_method_starts_with_rpc_dot_directly,
    Err_Then_is_accessed_on_local_implementation_Please_explicitly_mark_if_it_is_thenable_in_the_options,
] as const
// https://github.com/Jack-Works/async-call-rpc/wiki/Error-messages
export const makeHostedMessage = (id: (typeof Messages)[number], error: Error) => {
    const n = Messages.indexOf(id)
    error.message += `Error ${n}: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#` + n
    return error
}
// ! side effect
/** These Error is defined in ECMAScript spec */
const errors: Record<string, typeof EvalError> = {
    // @ts-expect-error
    __proto__: null,
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,
}
export const DOMExceptionHeader = 'DOMException:'
/**
 * AsyncCall support somehow transfer ECMAScript Error
 */
export const RecoverError = (type: string, message: string, code: number, stack: string): Error => {
    try {
        let E
        if (type.startsWith(DOMExceptionHeader) && (E = globalDOMException())) {
            const name = type.slice(DOMExceptionHeader.length)
            return new E(message, name)
        } else if (type in errors) {
            const e = new errors[type]!(message)
            e.stack = stack
            // @ts-expect-error
            e.code = code
            return e
        } else {
            return new CustomError(type, message, code, stack)
        }
    } catch {
        return new Error(`E${code} ${type}: ${message}\n${stack}`)
    }
}
export const removeStackHeader = (stack: unknown) => String(stack).replace(/^.+\n.+\n/, '')
// ! side effect
export const globalDOMException = (() => {
    try {
        // @ts-expect-error
        return DOMException
    } catch {}
}) as () => DOMException | undefined
type DOMException = { new (message: string, name: string): any }
export function onAbort(signal: AbortSignalLike | undefined, callback: () => void) {
    signal && signal.addEventListener('abort', callback, { once: true })
}
