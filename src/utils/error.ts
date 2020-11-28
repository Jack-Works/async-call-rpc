class CustomError extends Error {
    constructor(public name: string, message: string, public code: number, public stack: string) {
        super(message)
    }
}
// https://github.com/Jack-Works/async-call-rpc/wiki/Error-messages
export const enum HostedMessages {
    AsyncCallGenerator_cannot_find_a_running_iterator_with_the_given_ID,
    Only_string_can_be_the_RPC_method_name,
    Can_not_call_method_starts_with_rpc_dot_directly,
    Instance_is_treated_as_Promise_please_explicitly_mark_if_it_is_thenable_or_not_via_the_options,
}
export function makeHostedMessage(id: HostedMessages, error: Error) {
    error.message += `Error ${id}: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#` + id
    return error
}
// ! side effect
/** These Error is defined in ECMAScript spec */
const errors: Record<string, typeof EvalError> = {
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
        const E = globalDOMException()
        if (type.startsWith(DOMExceptionHeader) && E) {
            const [, name] = type.split(DOMExceptionHeader)
            return new E(message, name)
        } else if (type in errors) {
            const e = new errors[type](message)
            e.stack = stack
            // @ts-ignore
            e.code = code
            return e
        } else {
            return new CustomError(type, message, code, stack)
        }
    } catch {
        return new Error(`E${code} ${type}: ${message}\n${stack}`)
    }
}
export const removeStackHeader = (stack = '') => stack.replace(/^.+\n.+\n/, '')
// ! side effect
export const globalDOMException = (() => {
    try {
        // @ts-ignore
        return DOMException
    } catch {}
}) as () => DOMException | undefined
type DOMException = { new (message: string, name: string): any }
