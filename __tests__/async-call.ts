import { AsyncCall, MessageChannel, AsyncCallOptions, NoSerialization, JSONSerialization } from '../src/Async-Call'
import { EventEmitter } from 'events'

const impl = {
    add: (x: number, y: number) => x + y,
    undef: () => {},
    throws: async () => {
        throw new Error()
    },
}
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

class JestChannel extends EventEmitter implements MessageChannel {
    constructor(public otherSide: JestChannel) {
        super()
    }
    emit(event: any, data: any): boolean {
        return super.emit.call(this.otherSide, event, data)
    }
}
function createChannelPair() {
    const server = new JestChannel(undefined!)
    const client = new JestChannel(server)
    server.otherSide = client
    return { server, client }
}
function createServer<T extends object = typeof impl>(opt: Omit<AsyncCallOptions, 'messageChannel'> = {}, _ = impl) {
    const { client, server } = createChannelPair()
    AsyncCall(impl, { messageChannel: server, log: false, ...opt })
    return AsyncCall<T>({}, { messageChannel: client, log: false, ...opt })
}
