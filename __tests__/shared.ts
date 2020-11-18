import { EventEmitter } from 'events'
import { AsyncCallOptions, AsyncCall, EventBasedChannel, CallbackBasedChannel } from '../src/Async-Call'
import { AsyncGeneratorCall } from '../src/Async-Call-Generator'

const impl = {
    add: (x: number, y: number) => x + y,
    args: ({ x, y }: { x: number; y: number }) => x + y,
    undef: () => {},
    throws: async () => {
        throw new Error('impl error')
    },
}
export class JestChannel implements EventBasedChannel {
    log = new EventEmitter()
    constructor(public otherSide: JestChannel) {}
    on(callback: any) {
        this.log.addListener('message', callback)
        return () => this.log.removeListener('message', callback)
    }
    send(data: any) {
        this.otherSide.log.emit('message', data)
    }
}
export class JestChannelCallbackBased extends JestChannel implements CallbackBasedChannel {
    constructor(ctor) {
        super(ctor)
        if (ctor === undefined) {
            Object.defineProperty(this, 'send', { value: undefined })
        } else {
            Object.defineProperty(this, 'setup', { value: undefined })
        }
    }
    setup(cb) {
        this.log.addListener('message', async (msg) => this.otherSide.log.emit('message', await cb(msg)))
    }
}
type ctor = typeof JestChannel | typeof JestChannelCallbackBased
export function createChannelPair(ctor: ctor = JestChannel) {
    const server = new ctor(undefined!) as JestChannel
    const client = new ctor(server as any) as JestChannel
    // @ts-ignore
    server.otherSide = client
    return { server, client }
}
export function createServer<T extends object = typeof impl>(
    opt: Omit<AsyncCallOptions, 'channel'> = {},
    _: T = impl as any,
    ctor: ctor = JestChannel,
) {
    const { client, server } = createChannelPair(ctor)
    AsyncCall(_, {
        channel: server,
        log: false,
        ...opt,
    })
    return AsyncCall<T>({}, { channel: client, log: false, ...opt })
}
const impl2 = {
    *gen(...number: number[]) {
        yield* number
    },
}
export function createGeneratorServer<T extends object = typeof impl2>(
    opt: Omit<AsyncCallOptions, 'channel'> = {},
    _: T = impl2 as any,
) {
    const { client, server } = createChannelPair()
    AsyncGeneratorCall(_, { channel: server, log: false, ...opt })
    return AsyncGeneratorCall<T>({}, { channel: client, log: false, ...opt })
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
    const orig = Error
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
    return () => {
        globalThis.Error = orig
        JSON.parse = old
    }
}
