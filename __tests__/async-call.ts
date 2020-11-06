import { NoSerialization, JSONSerialization, AsyncCall, notify, batch } from '../src/Async-Call'
import { createServer, sleep, mockError, JestChannelCallbackBased, createGeneratorServer } from './shared'

test('AsyncCall basic test', async () => {
    const snapshot = mockConsoleLog('no logs')
    const c = createServer()
    expect(await c.add(1, 3)).toBe(4)
    expect(await c.undef()).toBe(undefined)
    await expect(c.throws()).rejects.toMatchSnapshot()
    await expect(c[0]()).rejects.toMatchSnapshot()
    snapshot()
}, 2000)

test('AsyncCall should keep function identity', () => {
    const c = createServer()
    expect(c.add).toBe(c.add)
    const [b] = batch(c)
    expect(b.add).toBe(b.add)
    const n = notify(c)
    expect(n.add).toBe(n.add)
    const g = createGeneratorServer()
    expect(g.gen).toBe(g.gen)
})

test('AsyncCall should not invoke then method on non Promise', () => {
    const f = jest.fn((x: any) => x)
    createServer(undefined, { then: f })
    expect(f).not.toBeCalled()
})

test('AsyncCall CallbackBased interface', async () => {
    const c = createServer({}, undefined, JestChannelCallbackBased)
    expect(await c.add(1, 3)).toBe(4)
    expect(await c.undef()).toBe(undefined)
    await expect(c.throws()).rejects.toMatchSnapshot()
    await expect(c[0]()).rejects.toMatchSnapshot()
}, 2000)

test('Should preserve this binding', async () => {
    class X {
        f = 1
        n() {
            return this.f
        }
    }
    const c = createServer({}, new X())
    await expect(c.n()).resolves.toBe(1)
}, 2000)

test('AsyncCall Serialization', async () => {
    const c = createServer({ serializer: NoSerialization })
    await expect(c.undef()).resolves.toBe(undefined)
    const c2 = createServer({ serializer: JSONSerialization() })
    await expect(c2.undef()).resolves.toBe(null)
}, 2000)

test('AsyncCall Call by structure', async () => {
    const c = createServer({ serializer: NoSerialization, parameterStructures: 'by-name' })
    await expect(c.args({ x: 1, y: 2 })).resolves.toBe(3)
}, 2000)

test('AsyncCall strict JSON RPC', async () => {
    const c = createServer({ strict: true })
    // @ts-expect-error
    await expect(c.add2()).rejects.toMatchSnapshot()
    // TODO: test unknown message
}, 2000)

test('AsyncCall preferLocal', async () => {
    const x = AsyncCall<any>(
        { f: () => 1 },
        {
            channel: {
                on() {},
                emit() {
                    throw new Error('')
                },
            } as any,
            preferLocalImplementation: true,
        },
    )
    expect(x.f()).resolves.toBe(1)
}, 2000)

test('AsyncCall logs', async () => {
    let i = 2
    const idGen = () => Math.cos(i++)
    mockError()
    const snapshot = mockConsoleLog('normal log')
    const s = createServer({
        log: { beCalled: true, localError: true, remoteError: true, sendLocalStack: true, type: 'pretty' },
        idGenerator: idGen,
    })
    await s.add(1, 2)
    await s.throws().catch((e) => e)

    const s2 = createServer({
        log: { beCalled: true, localError: true, remoteError: true, sendLocalStack: true, type: 'basic' },
        idGenerator: idGen,
    })
    await s2.add(1, 2)
    await s2.throws().catch((e) => e)

    const s3 = createServer({ log: true, strict: { methodNotFound: false }, idGenerator: idGen })
    // @ts-expect-error
    s3.add2(1, 2)
    await sleep(2000)

    const s4 = createServer({
        log: { beCalled: true, localError: true, remoteError: true, sendLocalStack: false, requestReplay: true },
        idGenerator: idGen,
    })
    await s4.add(1, 2)
    await s4.throws().catch((e) => e)

    snapshot()
}, 5000)

test('AsyncCall internal JSON RPC methods', async () => {
    // TODO
    const s = createServer()
    await expect(s['rpc.internal']()).rejects.toMatchSnapshot('call internal directly')
    await expect(s[Symbol.asyncIterator]()).rejects.toMatchSnapshot('call internal with a non-rpc symbol')
}, 2000)

test('AsyncCall notify test', async () => {
    const f = jest.fn(() => 234)
    const server = createServer({}, { add: f })
    const c = notify(server)
    const add = notify(c.add)
    const add2 = notify(server.add)
    await expect(add()).resolves.toBeUndefined()
    await expect(notify(notify(add))()).resolves.toBeUndefined()
    await expect(add2()).resolves.toBeUndefined()
    await expect(notify(notify(add2))()).resolves.toBeUndefined()
    await expect(c.add()).resolves.toBeUndefined()
    // @ts-ignore
    await expect(c.undef2()).resolves.toBeUndefined()
    await sleep(200)
    expect(f).toBeCalled()
}, 2000)

test('AsyncCall batch test', async () => {
    const f = jest.fn((x: any) => x)
    const [server, emit, drop] = batch(createServer({}, { add: f }))
    {
        const list = [server.add(1), server.add(2), notify(server.add)(3), notify(notify(notify(server.add)))(4)]
        await sleep(200)
        expect(f).not.toBeCalled()
        emit()
        await expect(list[0]).resolves.toBe(1)
        await expect(list[1]).resolves.toBe(2)
        await expect(list[2]).resolves.toBeUndefined()
        await expect(list[3]).resolves.toBeUndefined()
    }
    f.mockClear()
    {
        const list = [server.add(11), server.add(12), notify(server.add)(13), notify(notify(notify(server.add)))(4)]
        await sleep(200)
        expect(f).not.toBeCalled()
        drop(new Error('I prefer multiply than add'))
        await expect(list[0]).rejects.toMatchSnapshot()
        await expect(list[1]).rejects.toMatchSnapshot()
        await expect(list[2]).resolves.toBeUndefined()
        await expect(list[3]).resolves.toBeUndefined()
    }
    {
        const [server, emit, drop] = batch(notify(createServer({}, { add: f })))
        const list = [server.add(1), notify(server.add)(2), notify(notify(notify(server.add)))(3)]
        await sleep(200)
        expect(f).not.toBeCalled()
        emit()
        await expect(list[0]).resolves.toBeUndefined()
        await expect(list[1]).resolves.toBeUndefined()
        await expect(list[2]).resolves.toBeUndefined()
    }
}, 2000)

function mockConsoleLog(key: string) {
    const a = (console.log = jest.fn())
    const b = (console.error = jest.fn())
    const c = (console.warn = jest.fn())
    const d = (console.groupCollapsed = jest.fn())
    const e = (console.groupEnd = jest.fn())
    const f = (console.debug = jest.fn())
    return () => {
        expect(a.mock.calls).toMatchSnapshot(key + ' console.log')
        expect(b.mock.calls).toMatchSnapshot(key + ' console.error')
        expect(c.mock.calls).toMatchSnapshot(key + ' console.warn')
        expect(d.mock.calls).toMatchSnapshot(key + ' console.groupCollapsed')
        expect(e.mock.calls).toMatchSnapshot(key + ' console.groupEnd')
        expect(f.mock.calls).toMatchSnapshot(key + ' console.debug')
    }
}
