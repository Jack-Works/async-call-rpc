import { delay, withSnapshotDefault } from './utils/test'
import { ErrorResponse, Request, SuccessResponse } from '../src/utils/jsonrpc'

withSnapshotDefault('bad data', 'bad-data', async (f, _, log, raw) => {
    const server = f({ opts: { strict: false } })
    await raw.client.send(0)
    await raw.client.send({})
    await raw.client.send({ jsonrpc: '1.0' })
    await raw.client.send({ jsonrpc: '2.0', params: 1 })
    await raw.client.send(ErrorResponse(undefined, NaN, 'what'))
})

withSnapshotDefault('bad state', 'bad-state', async (f, _, log, raw) => {
    const server = f()
    await raw.server.send(SuccessResponse(123, {}))
    await delay(20)
})

withSnapshotDefault('bad state (generator)', 'bad-state-generator', async (f, _, log, raw) => {
    const server = _()
    raw.client.send(Request('a', 'rpc.async-iterator.next', ['b', undefined]))
    const iter = (server as any).not_found()
    expect(iter.next()).rejects.toThrowErrorMatchingInlineSnapshot(`"not_found is not a function"`)
    await delay(40)
})

withSnapshotDefault(
    'bad state (generator) allow method not found',
    'bad-state-generator-non-strict',
    async (f, _, log, raw) => {
        const server = _({ opts: { strict: false } })
        await raw.client.send(Request('a', 'rpc.async-iterator.next', ['b', undefined]))
        const iter = (server as any).not_found()
        await delay(40)
    },
)
