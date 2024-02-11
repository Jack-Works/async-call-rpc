import { delay, withSnapshotDefault } from './utils/test.js'
import { defaultErrorMapper } from '../src/utils/jsonrpc.js'
import { JSONSerialization } from '../src/index.js'
import { makeRequest, makeSuccessResponse, makeErrorResponse } from '../src/utils/jsonrpc.js'
import { reproduceError } from './utils/reproduce.js'
import { expect, it } from 'vitest'

it(
    'can handle deserialize failed',
    withSnapshotDefault('deserialize-failed', async ({ init, channel }) => {
        await reproduceError(async () => {
            init({ options: { serializer: JSONSerialization() } })
            if (!('send' in channel.client)) throw new Error('test error')
            await channel.client.send!('invalid JSON')
            await delay(50)
        })
    }),
)

it('can handle bad exception', () => {
    const f = defaultErrorMapper('', 0)
    const r = makeRequest(0, '1', [])
    const bad1 = {
        get message() {
            throw 1
        },
    }
    const bad2 = {
        message: 'normal',
        get constructor() {
            throw 2
        },
    }
    function _() {
        // @ts-expect-error
        this.message = 'normal message'
    }
    Object.defineProperty(_, 'name', {
        get() {
            throw 3
        },
    })
    const bad3 = new (_ as any)()
    expect(f(bad1, r)).toMatchInlineSnapshot(`
      {
        "code": 0,
        "data": {
          "type": "Object",
        },
        "message": "",
      }
    `)
    expect(f(bad2, r)).toMatchInlineSnapshot(`
      {
        "code": 0,
        "data": {
          "type": "Error",
        },
        "message": "normal",
      }
    `)
    expect(f(bad3, r)).toMatchInlineSnapshot(`
      {
        "code": 0,
        "data": {
          "type": "Error",
        },
        "message": "normal message",
      }
    `)
})

it(
    'can handle bad channel data',
    withSnapshotDefault('bad-data', async ({ init, channel }) => {
        init({ options: { strict: false } })
        if (!('send' in channel.client) || !channel.client.send) throw new Error('test error')
        await channel.client.send(0)
        await channel.client.send({})
        await channel.client.send({ jsonrpc: '1.0' })
        await channel.client.send({ jsonrpc: '2.0', params: 1 })
        await channel.client.send(makeErrorResponse(undefined, NaN, 'what'))
    }),
)

it(
    'can handle invalid state: response without a request',
    withSnapshotDefault('bad-state', async ({ init, channel }) => {
        init()
        if (!('send' in channel.server)) throw new Error('test error')
        await channel.server.send!(makeSuccessResponse(123, {}))
        await delay(20)
    }),
)

it(
    '(generator) can handle invalid state: missing generator instance',
    withSnapshotDefault('bad-state-generator', async ({ initIterator, channel }) => {
        const server = initIterator()
        if (!('send' in channel.client)) throw new Error('test error')
        channel.client.send!(makeRequest('a', 'rpc.async-iterator.next', ['b', undefined]))
        const iter = (server as any).not_found()
        expect(iter.next()).rejects.toThrowErrorMatchingInlineSnapshot(`[TypeError: not_found is not a function]`)
        await delay(100)
    }),
)

it(
    '(generator) can handle invalid state: allows method not found',
    withSnapshotDefault('bad-state-generator-non-strict', async ({ initIterator, channel }) => {
        const server = initIterator({ options: { strict: false } })
        if (!('send' in channel.client)) throw new Error('test error')
        await channel.client.send!(makeRequest('a', 'rpc.async-iterator.next', ['b', undefined]))
        ;(server as any).not_found()
        await delay(40)
    }),
)
