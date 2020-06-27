import { NoSerialization, JSONSerialization, AsyncCall, notify } from '../src/Async-Call'
import { createServer, sleep, mockError } from './shared'

test('AsyncCall basic test', async () => {
    const snapshot = mockConsoleLog('no logs')
    const c = createServer()
    expect(await c.add(1, 3)).toBe(4)
    expect(await c.undef()).toBe(undefined)
    expect(c.throws()).rejects.toMatchInlineSnapshot(`[Error: impl error]`)
    expect(c[0]()).rejects.toMatchInlineSnapshot(`[Error: Method not found]`)
    snapshot()
}, 2000)

test('Should preserve this binding', async () => {
    class X {
        f = 1
        n() {
            return this.f
        }
    }
    const c = createServer({}, new X())
    expect(c.n()).resolves.toBe(1)
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
    await expect(c.add2()).rejects.toMatchInlineSnapshot(`[Error: Method not found]`)
    // TODO: test unknown message
}, 2000)

test('AsyncCall preferLocal', async () => {
    const x = AsyncCall<any>(
        { f: () => 1 },
        {
            messageChannel: {
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
        log: { beCalled: true, localError: true, remoteError: true, sendLocalStack: false },
        idGenerator: idGen,
    })
    await s4.add(1, 2)
    await s4.throws().catch((e) => e)

    snapshot()
}, 5000)

test('AsyncCall internal JSON RPC methods', async () => {
    // TODO
    const s = createServer()
    expect(s['rpc.internal']()).rejects.toMatchInlineSnapshot(
        `[TypeError: [AsyncCall] Can't call internal methods directly]`,
    )
}, 2000)

test('AsyncCall notify test', async () => {
    const f = jest.fn()
    const server = createServer({}, { add: f })
    const c = notify(server)
    const add = notify(c.add)
    const add2 = notify(server.add)
    await expect(add()).resolves.toBeUndefined()
    await expect(add2()).resolves.toBeUndefined()
    await expect(c.add()).resolves.toBeUndefined()
    // @ts-ignore
    await expect(c.undef2()).resolves.toBeUndefined()
    await sleep(200)
    expect(f).toBeCalled()
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
