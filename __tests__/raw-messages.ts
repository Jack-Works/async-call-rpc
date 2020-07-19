import { createChannelPair, sleep, JestChannel, mockError } from './shared'
import { AsyncCall, JSONSerialization } from '../src/Async-Call'
import { Request } from '../src/utils/jsonrpc'
import { AsyncGeneratorCall } from '../src/Async-Call-Generator'

test('Batch messages', async () => {
    const json = JSONSerialization()
    const requests = [
        [Request(0, 'f1', []), Request(1, 'f2', { x: 1 })],
        [Request(undefined, 'f1', {})],
        [Request(null, 'f1', {}), Request(null, 'f1', {})],
        [Request(undefined, 'f1', []), Request(undefined, 'f2', { x: 1 })],
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
        Request('id0', 'method', 'invalid' as any),
        // unknown message
        { abc: 1 },
        { jsonrpc: '2.0', id: 'id1' },
    ]
        .map(json.serialization)
        .concat('Not JSON!')
    await channelPeak(
        (server) => AsyncCall({}, { messageChannel: server, log: false, key: 'message', serializer: json }),
        invalidRequests,
    )
    await channelPeak(
        (server) =>
            AsyncCall({}, { messageChannel: server, log: false, key: 'message', strict: false, serializer: json }),
        invalidRequests,
    )
})

test('AsyncGeneratorCall', async () => {
    const json = JSONSerialization()
    const requests = [Request(1, 'rpc.async-iterator.next', ['non-exist'])].map(json.serialization)
    await channelPeak(
        (server) => AsyncGeneratorCall({}, { messageChannel: server, log: false, key: 'message', serializer: json }),
        requests,
    )
})

test('AsyncGeneratorCall non strict', async () => {
    const json = JSONSerialization()
    const requests = [Request(1, 'rpc.async-iterator.next', ['non-exist'])].map(json.serialization)
    await channelPeak(
        (server) =>
            AsyncGeneratorCall(
                {},
                { messageChannel: server, log: false, key: 'message', serializer: json, strict: false },
            ),
        requests,
    )
})

async function channelPeak(buildServer: (channel: JestChannel) => void, out: unknown[]) {
    const { client, server } = createChannelPair()
    buildServer(server)
    const logToClient = []
    const logToServer = []
    server.log.addListener('message', (e) => logToServer.push(e))
    client.log.addListener('message', (e) => logToClient.push(e))
    out.forEach((x) => client.send(x))
    await sleep(200)
    expect(logToClient).toMatchSnapshot('in')
    expect(logToServer).toMatchSnapshot('out')
}
