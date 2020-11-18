import { createGeneratorServer, timeout } from './shared'

test('Async Generator Call', async () => {
    const server = createGeneratorServer()
    let i = 0
    const number = [1, 2]
    for await (const x of server.gen(...number)) i += x
    expect(i).toBe(3)
    // @ts-expect-error
    await expect(server.gen2().next()).rejects.toMatchInlineSnapshot(`[TypeError: gen2 is not a function]`)
    expect(() => server[Symbol.for('xyz')]).toThrow()

    const server2 = createGeneratorServer({ strict: false })
    // @ts-expect-error
    await expect(timeout(server2.non().next())).rejects.toMatchInlineSnapshot(`[Error: Timeout]`)
})

test('AsyncGeneratorCall should not distinguishable to real async generators', async () => {
    async function* gen() {
        yield 1
        yield 2
        yield 3
    }
    // Normal
    {
        const server = createGeneratorServer({}, { gen })
        const remote = server.gen()
        const local = gen()

        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
    }
    // Throws
    {
        const server = createGeneratorServer({}, { gen })
        const remote = server.gen()
        const local = gen()

        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        // ?: this one failed cause AsyncCall will automatically wrap any non-Error throws into Error
        // await expect(remote.throw(1)).rejects.toStrictEqual(await local.throw(1).catch((x) => x))
        await expect(local.throw(1)).rejects.toMatchInlineSnapshot(`1`)
        await expect(remote.throw(1)).rejects.toMatchInlineSnapshot(`[Error: 1]`)
        await expect(remote.next(3)).resolves.toStrictEqual(await local.next(3))
        await expect(remote.return(2 as any)).resolves.toStrictEqual(await local.return(2 as any))
        // ?: After we go to this line, the inner status of generator has been marked to "done"
        // ?: so it will throw the error directly instead of try to send them to remote.
        await expect(local.throw(1)).rejects.toMatchInlineSnapshot(`1`)
        await expect(remote.throw(1)).rejects.toMatchInlineSnapshot(`1`)
    }
    // Returns
    {
        const server = createGeneratorServer({}, { gen })
        const remote = server.gen()
        const local = gen()

        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.return(4 as any)).resolves.toStrictEqual(await local.return(4 as any))
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.throw(5)).rejects.toStrictEqual(await local.throw(5).catch((x) => x))
    }
})

test('AsyncGeneratorCall complex handling', async () => {
    async function* gen() {
        yield 1
        try {
            yield 2
        } catch (e) {
            yield e
        }
    }
    // Normal
    {
        const server = createGeneratorServer({}, { gen })
        const remote = server.gen()
        const local = gen()

        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
    }
    // Throws
    {
        const server = createGeneratorServer({}, { gen })
        const remote = server.gen()
        const local = gen()

        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.throw(6)).resolves.toStrictEqual(await local.throw(6).catch((x) => x))
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.return(7 as any)).resolves.toStrictEqual(await local.return(7 as any))
    }
    // Returns
    {
        const server = createGeneratorServer({}, { gen })
        const remote = server.gen()
        const local = gen()

        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.return(8 as any)).resolves.toStrictEqual(await local.return(8 as any))
        await expect(remote.next()).resolves.toStrictEqual(await local.next())
        await expect(remote.throw(9)).rejects.toStrictEqual(await local.throw(9).catch((x) => x))
    }
})
