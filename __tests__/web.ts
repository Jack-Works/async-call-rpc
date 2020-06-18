class Exception extends Error {
    constructor(public message: string, public name: string) {
        super(message)
    }
}
test('DOMException', async () => {
    const { ErrorResponse } = await import('../src/utils/jsonrpc')
    const { DOMException, DOMExceptionHeader, RecoverError } = await import('../src/utils/error')
    expect(DOMException).not.toBeUndefined()
    const e = RecoverError(DOMExceptionHeader + 'MyError', 'Message', 0, '')
    expect(e).toMatchSnapshot()
    expect(e).toBeInstanceOf(Exception)

    expect(ErrorResponse('id', 0, 'msg', 'stack', new Exception('msg2', 'name'))).toMatchSnapshot()
})

test('preservePauseOnException', async () => {
    const { preservePauseOnException } = await import('../src/utils/preservePauseOnException')

    const e = () => {}
    await expect(preservePauseOnException(e, async () => 1, [])).resolves.toBe(1)
    // const throws = async () => {
    //     // Jest cannot let us test unhandledRejection well https://github.com/facebook/jest/issues/5620
    //     throw new Error('unhandledRejection test')
    // }
    // await expect(preservePauseOnException(e, throws, [])).rejects.toMatchInlineSnapshot()
}, 200)

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
