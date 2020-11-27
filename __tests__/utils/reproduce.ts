export function reproduceIDGenerator() {
    let id = 0
    return () => id++
}
export function reproduceError() {
    const orig = Error
    globalThis.Error = class E extends Error {
        constructor(msg: string) {
            super(msg)
            this.stack = '<mocked stack>'
        }
    } as any
    const old = JSON.parse
    JSON.parse = (...args) => {
        try {
            return old(...args)
        } catch (e) {
            e.stack = '<mocked stack>'
            throw e
        }
    }
    return () => {
        globalThis.Error = orig
        JSON.parse = old
    }
}
