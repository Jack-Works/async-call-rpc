import { EventEmitter } from 'events'
import { AsyncCallOptions, AsyncCall, MessageChannel } from '../src/Async-Call'
import { AsyncGeneratorCall } from '../src/Async-Call-Generator'

const impl = {
    add: (x: number, y: number) => x + y,
    args: ({ x, y }: { x: number; y: number }) => x + y,
    undef: () => {},
    throws: async () => {
        throw new Error('impl error')
    },
}
export class JestChannel extends EventEmitter implements MessageChannel {
    constructor(public otherSide: JestChannel) {
        super()
    }
    emit(event: any, data: any): boolean {
        return super.emit.call(this.otherSide, event, data)
    }
}
export function createChannelPair() {
    const server = new JestChannel(undefined!)
    const client = new JestChannel(server)
    server.otherSide = client
    return { server, client }
}
export function createServer<T extends object = typeof impl>(
    opt: Omit<AsyncCallOptions, 'messageChannel'> = {},
    _: T = impl as any,
) {
    const { client, server } = createChannelPair()
    AsyncCall(Math.random() > 0.5 ? _ : sleep(100).then(() => _), { messageChannel: server, log: false, ...opt })
    return AsyncCall<T>({}, { messageChannel: client, log: false, ...opt })
}
const impl2 = {
    *gen(...number: number[]) {
        yield* number
    },
}
export function createGeneratorServer<T extends object = typeof impl2>(
    opt: Omit<AsyncCallOptions, 'messageChannel'> = {},
    _: T = impl2 as any,
) {
    const { client, server } = createChannelPair()
    AsyncGeneratorCall(_, { messageChannel: server, log: false, ...opt })
    return AsyncGeneratorCall<T>({}, { messageChannel: client, log: false, ...opt })
}

export function sleep(x: number) {
    return new Promise((r, rr) => setTimeout(r, x))
}
async function _timeout(x: number): Promise<never> {
    await sleep(x)
    throw new Error('Timeout')
}
export async function timeout<T>(x: Promise<T>): Promise<T> {
    return Promise.race([x, _timeout(400)])
}

export function mockError() {
    globalThis.Error = class E extends Error {
        constructor(msg: string) {
            super(msg)
            this.stack = '<mocked stack>'
        }
    } as any
    const old = JSON.parse
    JSON.parse = (...args) => {
        try {
            return old(...args)
        } catch (e) {
            e.stack = '<mocked stack>'
            throw e
        }
    }
}

test('', () => {})
