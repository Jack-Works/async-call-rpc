import { AsyncCall, MessageChannel } from '../src/Async-Call'
import { EventEmitter } from 'events'

test('AsyncCall basic test', async () => {
    const { client, server } = createChannelPair()
    const f = { add: (x: number, y: number) => x + y }
    AsyncCall(f, { messageChannel: server, log: false })
    const c = AsyncCall<typeof f>({}, { messageChannel: client, log: false })

    expect(await c.add(1, 3)).toBe(4)
}, 200)

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
