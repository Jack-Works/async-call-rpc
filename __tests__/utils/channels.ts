import type { CallbackBasedChannel, EventBasedChannel } from '../../src/index.js'
import { EventEmitter } from 'events'
import type { Logger } from './logger.js'
import { delay } from './test.js'

export class TestEventBasedChannel implements EventBasedChannel {
    channel = new EventEmitter()
    constructor(
        public otherSide: TestCallbackBasedChannel | TestEventBasedChannel,
        private logger: Logger,
        private hint = true,
    ) {
        this.channel.addListener('message', this.logger.receive)
    }
    on(callback: (data: any, hint?: 'request' | 'response' | undefined) => void) {
        const f = (data: any) => {
            callback(
                data,
                this.hint
                    ? typeof data === 'object'
                        ? 'result' in data
                            ? 'response'
                            : 'request'
                        : undefined
                    : undefined,
            )
        }
        this.channel.addListener('message', f)
        return () => this.channel.removeListener('message', f)
    }
    async send(data: any) {
        this.logger.send(data)
        await delay(25)
        this.otherSide.channel.emit('message', data)
    }
}
export class TestCallbackBasedChannel implements CallbackBasedChannel {
    channel = new EventEmitter()
    constructor(
        public otherSide: TestCallbackBasedChannel | TestEventBasedChannel,
        private logger: Logger,
        private hint = true,
    ) {
        this.channel.addListener('message', this.logger.receive)
    }
    setup(
        jsonRPCHandlerCallback: (
            jsonRPCPayload: unknown,
            hint?: undefined | 'request' | 'response',
        ) => Promise<unknown | undefined>,
        isValidJSONRPCPayload: (data: unknown) => boolean | Promise<boolean>,
    ) {
        this.channel.addListener('message', async (msg) => {
            if (!(await isValidJSONRPCPayload(msg)))
                return this.logger.log.log('Invalid JSON RPC received, ignore', msg)
            const payload = await jsonRPCHandlerCallback(
                msg,
                this.hint
                    ? typeof msg === 'object'
                        ? 'result' in msg
                            ? 'response'
                            : 'request'
                        : undefined
                    : undefined,
            )
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
export function createChannelPairFromConstructor(
    logger: { server: Logger; client: Logger },
    C: typeof TestCallbackBasedChannel | typeof TestEventBasedChannel = TestEventBasedChannel,
) {
    const server = new C(undefined!, logger.server)
    const client = new C(server, logger.client)
    server.otherSide = client
    return { server, client }
}
