beforeAll(() => {
    globalThis.EvalError = class {
        constructor() {
            throw new Error()
        }
    } as any
})

test('error', async () => {
    const { RecoverError, DOMExceptionHeader, DOMException, removeStackHeader } = await import('../src/utils/error')

    expect(DOMExceptionHeader).toMatchInlineSnapshot(`"DOMException:"`)
    expect(DOMException).toBeUndefined() // in Node.
    expect(
        removeStackHeader(`Error
    at z (<anonymous>:3:11)
    at y (<anonymous>:2:11)
    at x (<anonymous>:1:11)
    at <anonymous>:1:30`),
    ).toMatchInlineSnapshot(`
        "    at y (<anonymous>:2:11)
            at x (<anonymous>:1:11)
            at <anonymous>:1:30"
    `)
    const s = RecoverError('SyntaxError', 'unexpected token : at line 0 col 2', -1, 'stack')
    const u = RecoverError('UnknownError', 'msg', 0, 'stack')
    expect(s).toMatchInlineSnapshot(`[SyntaxError: unexpected token : at line 0 col 2]`)
    expect(s instanceof SyntaxError).toBeTruthy()
    expect(u).toMatchInlineSnapshot(`[UnknownError: msg]`)
    expect(s instanceof Error).toBeTruthy()
    expect(RecoverError('EvalError', '', 0, '')).toMatchInlineSnapshot(`
        [Error: E0 EvalError: 
        ]
    `)
})
