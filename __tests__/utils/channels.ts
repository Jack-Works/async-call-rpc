import type { CallbackBasedChannel, EventBasedChannel } from '../../src/index.js'
import { EventEmitter } from 'events'
import type { Logger } from './logger.js'
import { delay } from './test.js'

export class TestEventBasedChannel implements EventBasedChannel {
    channel = new EventEmitter()
    constructor(public otherSide: TestCallbackBasedChannel | TestEventBasedChannel, private logger: Logger) {
        this.channel.addListener('message', this.logger.receive)
    }
    on(callback: any) {
        this.channel.addListener('message', callback)
        return () => this.channel.removeListener('message', callback)
    }
    async send(data: any) {
        this.logger.send(data)
        await delay(25)
        this.otherSide.channel.emit('message', data)
    }
}
export class TestCallbackBasedChannel implements CallbackBasedChannel {
    channel = new EventEmitter()
    constructor(public otherSide: TestCallbackBasedChannel | TestEventBasedChannel, private logger: Logger) {
        this.channel.addListener('message', this.logger.receive)
    }
    setup(jsonRPCHandlerCallback: Function, isValidJSONRPCPayload: (data: unknown) => boolean | Promise<boolean>) {
        this.channel.addListener('message', async (msg) => {
            if (!(await isValidJSONRPCPayload(msg)))
                return this.logger.log.log('Invalid JSON RPC received, ignore', msg)
            const payload = await jsonRPCHandlerCallback(msg)
            if (!payload) return
            this.logger.send(payload)
            await delay(25)
            this.otherSide.channel.emit('message', payload)
        })
    }
    async send(data: any) {
        this.logger.send(data)
        await delay(25)
        this.otherSide.channel.emit('message', data)
    }
}
export function createChannelPair(
    logger: { server: Logger; client: Logger },
    C: typeof TestCallbackBasedChannel | typeof TestEventBasedChannel = TestEventBasedChannel,
) {
    const server = new C(undefined!, logger.server)
    const client = new C(server, logger.client)
    server.otherSide = client
    return { server, client }
}
