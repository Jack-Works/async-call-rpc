class Exception extends Error {
    constructor(public message: string, public name: string) {
        super(message)
    }
}
test('DOMException', async () => {
    const { defaultErrorMapper, ErrorResponseMapped, Request } = await import('../src/utils/jsonrpc')
    const { DOMException, DOMExceptionHeader, RecoverError } = await import('../src/utils/error')
    expect(DOMException).not.toBeUndefined()
    const e = RecoverError(DOMExceptionHeader + 'MyError', 'Message', 0, '')
    expect(e).toMatchSnapshot()
    expect(e).toBeInstanceOf(Exception)

    expect(
        ErrorResponseMapped(Request(1, 'x', [], ''), new Exception('msg2', 'name'), defaultErrorMapper()),
    ).toMatchSnapshot()
})

beforeAll(() => {
    globalThis.DOMException = Exception as any
    globalThis.document = {
        // @ts-ignore
        createElement() {
            globalThis[Symbol.for('unhandledRejection')] = (e) => {
                _.contentWindow.onunhandledrejection({ reason: e } as any)
            }
            const _ = {
                style: {},
                click: () => _.onclick(),
                remove: () => {},
                onclick: () => {},
                contentDocument: globalThis.document,
                contentWindow: globalThis as typeof window,
            }
            return _
        },
        // @ts-ignore
        body: { appendChild() {} },
    }
})
