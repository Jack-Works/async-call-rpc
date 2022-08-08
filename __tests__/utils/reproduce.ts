export function reproduceIDGenerator() {
    let id = 0
    return () => id++
}
export async function reproduceRandomID(f: Function) {
    const old = Number.prototype.toString
    let last = 1
    Number.prototype.toString = function (radix) {
        if (radix === 36) return 'random-id-' + last++
        return old.call(this, radix)
    }
    try {
        return await f()
    } catch (e) {
        throw e
    } finally {
        Number.prototype.toString = old
    }
}
export async function reproduceDOMException(badImpl: boolean, f: Function) {
    const old = globalThis.DOMException
    Object.defineProperty(globalThis, 'DOMException', {
        configurable: true,
        value: class DOMException extends old {
            static nextThrow = false
            constructor(...args: any) {
                super(...args)
                this.stack = '<mocked stack>'
                if (badImpl) {
                    if (DOMException.nextThrow) {
                        DOMException.nextThrow = false
                        throw new Error('')
                    } else DOMException.nextThrow = true
                }
            }
        } as any,
    })
    try {
        return await f()
    } catch (e) {
        throw e
    } finally {
        Object.defineProperty(globalThis, 'DOMException', { configurable: true, value: old })
    }
}
export async function reproduceError(f: Function) {
    const orig = Error
    globalThis.Error = class Error extends orig {
        constructor(msg: string) {
            super(msg)
            this.stack = '<mocked stack>'
        }
    } as any
    const old = JSON.parse
    JSON.parse = (...args) => {
        try {
            return old(...args)
        } catch (e: any) {
            e.stack = '<mocked stack>'
            throw e
        }
    }
    try {
        return await f()
    } catch (e) {
        throw e
    } finally {
        globalThis.Error = orig
        JSON.parse = old
    }
}
