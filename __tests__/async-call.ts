import { NoSerialization, JSONSerialization } from '../src/Async-Call'
import { createServer } from './shared'

test('AsyncCall basic test', async () => {
    const c = createServer()
    expect(await c.add(1, 3)).toBe(4)
    expect(await c.undef()).toBe(undefined)
    expect(c.throws()).rejects
}, 200)

test('AsyncCall Serialization', async () => {
    const c = createServer({ serializer: NoSerialization })
    await expect(c.undef()).resolves.toBe(undefined)
    const c2 = createServer({ serializer: JSONSerialization() })
    await expect(c2.undef()).resolves.toBe(undefined)
}, 200)

test('AsyncCall strict JSON RPC', async () => {
    const c = createServer({ strict: true })
    // @ts-expect-error
    await expect(c.add2()).rejects
    await expect(c.undef()).resolves.toBe(null)
})

test('AsyncCall internal JSON RPC methods', async () => {
    // TODO
})
