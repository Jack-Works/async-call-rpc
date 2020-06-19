import { createGeneratorServer } from './shared'

test('Async Generator Call', async () => {
    const server = createGeneratorServer({ strict: true })
    let i = 0
    const number = [1, 2]
    for await (const x of server.gen(...number)) i += x
    expect(i).toBe(3)
    // @ts-expect-error
    await expect(server.gen2().next()).rejects.toMatchInlineSnapshot(`[Error: gen2 is not a function]`)
    expect(() => server[Symbol.for('xyz')]).toThrow()
})

test('Async Generator Call manual', async () => {
    const server = createGeneratorServer()
    const iter = server.gen(1, 2)
    // @ts-ignore
    server.gen2(1, 2).next()
    await expect(iter.next()).resolves.toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": 1,
                }
            `)
    await expect(iter.next()).resolves.toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": 2,
                }
            `)
    await expect(iter.next()).resolves.toMatchInlineSnapshot(`
                Object {
                  "done": true,
                  "value": undefined,
                }
            `)
    await expect(iter.next()).resolves.toMatchInlineSnapshot(`
                Object {
                  "done": true,
                  "value": undefined,
                }
            `)
    // @ts-ignore
    await expect(iter.return(2)).resolves.toMatchInlineSnapshot(`
                Object {
                  "done": true,
                  "value": 2,
                }
            `)
    await expect(iter.throw()).rejects.toMatchInlineSnapshot(`[Error]`)
})
