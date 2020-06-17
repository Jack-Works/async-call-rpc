class CustomError extends Error {
    constructor(public name: string, message: string, public code: number, public stack: string) {
        super(message)
    }
}
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
export function RecoverError(type: string, message: string, code: number, stack: string): Error {
    try {
        if (type.startsWith(DOMExceptionHeader) && DOMException) {
            const [, name] = type.split(DOMExceptionHeader)
            return new DOMException(message, name)
        } else if (type in errors) {
            const e = new errors[type](message)
            e.stack = stack
            Object.assign(e, { code })
            return e
        } else {
            return new CustomError(type, message, code, stack)
        }
    } catch {
        return new Error(`E${code} ${type}: ${message}\n${stack}`)
    }
}
export function removeStackHeader(stack = '') {
    return stack.replace(/^.+\n.+\n/, '')
}
function getDOMException(): { new (message: string, name: string): any } | undefined {
    const x = Reflect.get(globalThis, 'DOMException')
    if (typeof x === 'function') return x
    return undefined
}
export const DOMException = getDOMException()
