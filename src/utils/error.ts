class CustomError extends Error {
    constructor(public name: string, message: string, public code: number, public stack: string) {
        super(message)
    }
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
        if (type.startsWith(DOMExceptionHeader) && globalDOMException) {
            const [, name] = type.split(DOMExceptionHeader)
            return new globalDOMException(message, name)
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
})() as DOMException | undefined
type DOMException = { new (message: string, name: string): any }
