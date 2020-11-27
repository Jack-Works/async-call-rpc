import { CallbackBasedChannel, EventBasedChannel } from '../../src'
import { EventEmitter } from 'events'
import { Logger } from './logger'
import { delay } from './test'

export class JestEventBasedChannel implements EventBasedChannel {
    log = new EventEmitter()
    constructor(public otherSide: JestCallbackBasedChannel | JestEventBasedChannel, private logger: Logger) {
        this.log.addListener('message', this.logger.receive)
    }
    on(callback: any) {
        this.log.addListener('message', callback)
        return () => this.log.removeListener('message', callback)
    }
    async send(data: any) {
        this.logger.send(data)
        await delay(25)
        this.otherSide.log.emit('message', data)
    }
}
export class JestCallbackBasedChannel implements CallbackBasedChannel {
    log = new EventEmitter()
    constructor(public otherSide: JestCallbackBasedChannel | JestEventBasedChannel, private logger: Logger) {
        this.log.addListener('message', this.logger.receive)
    }
    setup(jsonRPCHandlerCallback: Function) {
        this.log.addListener('message', async (msg) => {
            const payload = await jsonRPCHandlerCallback(msg)
            this.logger.send(payload)
            await delay(25)
            this.otherSide.log.emit('message', payload)
        })
    }
    async send(data: any) {
        this.logger.send(data)
        await delay(25)
        this.otherSide.log.emit('message', data)
    }
}
export function createChannelPair(
    logger: { server: Logger; client: Logger },
    C: typeof JestCallbackBasedChannel | typeof JestEventBasedChannel = JestEventBasedChannel,
) {
    const server = new C(undefined!, logger.server)
    const client = new C(server, logger.client)
    server.otherSide = client
    return { server, client }
}
