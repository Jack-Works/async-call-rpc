import { delay, withSnapshotDefault } from './utils/test.js'
import { defaultErrorMapper, ErrorResponse, Request, SuccessResponse } from '../src/utils/jsonrpc.js'
import { JSONSerialization } from '../src/index.js'
import { reproduceError } from './utils/reproduce.js'
import { expect, it } from 'vitest'

it(
    'can handle deserialize failed',
    withSnapshotDefault('deserialize-failed', async (f, _, _log, raw) => {
        await reproduceError(async () => {
            f({ opts: { serializer: JSONSerialization() } })
            await raw.client.send('invalid JSON')
            await delay(50)
        })
    }),
)

it('can handle bad exception', () => {
    const f = defaultErrorMapper('', 0)
    const r = Request(0, '1', [])
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
    withSnapshotDefault('bad-data', async (f, _, _log, raw) => {
        f({ opts: { strict: false } })
        await raw.client.send(0)
        await raw.client.send({})
        await raw.client.send({ jsonrpc: '1.0' })
        await raw.client.send({ jsonrpc: '2.0', params: 1 })
        await raw.client.send(ErrorResponse(undefined, NaN, 'what'))
    }),
)

it(
    'can handle invalid state: response without a request',
    withSnapshotDefault('bad-state', async (f, _, _log, raw) => {
        f()
        await raw.server.send(SuccessResponse(123, {}))
        await delay(20)
    }),
)

it(
    '(generator) can handle invalid state: missing generator instance',
    withSnapshotDefault('bad-state-generator', async (_f, _, _log, raw) => {
        const server = _()
        raw.client.send(Request('a', 'rpc.async-iterator.next', ['b', undefined]))
        const iter = (server as any).not_found()
        expect(iter.next()).rejects.toThrowErrorMatchingInlineSnapshot('"not_found is not a function"')
        await delay(100)
    }),
)

it(
    '(generator) can handle invalid state: allows method not found',
    withSnapshotDefault('bad-state-generator-non-strict', async (_f, _, _log, raw) => {
        const server = _({ opts: { strict: false } })
        await raw.client.send(Request('a', 'rpc.async-iterator.next', ['b', undefined]))
        ;(server as any).not_found()
        await delay(40)
    }),
)
