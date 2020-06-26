import { NoSerialization, JSONSerialization, AsyncCall } from '../src/Async-Call'
import { createServer, timeout, sleep, mockError } from './shared'

test('AsyncCall basic test', async () => {
    const snapshot = mockConsoleLog('no logs')
    const c = createServer()
    expect(await timeout(c.add(1, 3))).toBe(4)
    expect(await timeout(c.undef())).toBe(undefined)
    expect(timeout(c.throws())).rejects.toMatchInlineSnapshot(`[Error: impl error]`)
    snapshot()
}, 200)

test('AsyncCall Serialization', async () => {
    const c = createServer({ serializer: NoSerialization })
    await expect(timeout(c.undef())).resolves.toBe(undefined)
    const c2 = createServer({ serializer: JSONSerialization() })
    await expect(timeout(c2.undef())).resolves.toBe(null)
}, 200)

test('AsyncCall strict JSON RPC', async () => {
    const c = createServer({ strict: true })
    // @ts-expect-error
    await expect(c.add2()).rejects.toMatchInlineSnapshot(`[Error: Method not found]`)
    // TODO: test unknown message
})

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
})

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
    await sleep(200)

    snapshot()
})

test('AsyncCall internal JSON RPC methods', async () => {
    // TODO
    const s = createServer()
    expect(s['rpc.internal']()).rejects.toMatchInlineSnapshot(
        `[TypeError: [AsyncCall] You cannot call JSON RPC internal methods directly]`,
    )
})

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
