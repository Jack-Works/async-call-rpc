import { createChannelPair, sleep, JestChannel, mockError } from './shared'
import { AsyncCall, JSONSerialization } from '../src/Async-Call'
import { Request } from '../src/utils/jsonrpc'

test('Batch messages', async () => {
    const json = JSONSerialization()
    const requests = [
        [Request(0, 'f1', [], ''), Request(1, 'f2', { x: 1 }, '')],
        [Request(undefined, 'f1', {}, '')],
        [Request(null, 'f1', {}, ''), Request(null, 'f1', {}, '')],
        [Request(undefined, 'f1', [], ''), Request(undefined, 'f2', { x: 1 }, '')],
    ].map(json.serialization)
    await expect(
        channelPeak(
            (server) =>
                AsyncCall(
                    { f1: () => 1, f2: (args: { x: number }) => args.x },
                    { messageChannel: server, log: false, key: 'message', serializer: json },
                ),
            requests,
        ),
    ).resolves.toMatchSnapshot()
})

test('Bad messages', async () => {
    mockError()
    const json = JSONSerialization()
    const invalidRequests = [
        // invalid request
        Request('id0', 'method', 'invalid' as any, ''),
        // unknown message
        { abc: 1 },
        { jsonrpc: '2.0', id: 'id1' },
    ]
        .map(json.serialization)
        .concat('Not JSON!')
    await expect(
        channelPeak(
            (server) => AsyncCall({}, { messageChannel: server, log: false, key: 'message', serializer: json }),
            invalidRequests,
        ),
    ).resolves.toMatchSnapshot('Bad & strict')
    await expect(
        channelPeak(
            (server) =>
                AsyncCall({}, { messageChannel: server, log: false, key: 'message', strict: false, serializer: json }),
            invalidRequests,
        ),
    ).resolves.toMatchSnapshot('Bad & non strict')
})

async function channelPeak(buildServer: (channel: JestChannel) => void, out: unknown[]) {
    const { client, server } = createChannelPair()
    buildServer(server)
    const income = []
    client.addListener('message', (e) => income.push(e))
    out.forEach((x) => client.emit('message', x))
    await sleep(200)
    return income.sort()
}
