import { delay, withSnapshotDefault } from './utils/test'
import { defaultErrorMapper, ErrorResponse, Request, SuccessResponse } from '../src/utils/jsonrpc'
import { JSONSerialization } from '../src'
import { reproduceError } from './utils/reproduce'

withSnapshotDefault('deserialize failed', 'deserialize-failed', async (f, _, log, raw) => {
    await reproduceError(async () => {
        const server = f({ opts: { serializer: JSONSerialization() } })
        await raw.client.send('invalid JSON')
        await delay(50)
    })
})

test('bad exception', () => {
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
        // @ts-ignore
        this.message = 'normal message'
    }
    Object.defineProperty(_, 'name', {
        get() {
            throw 3
        },
    })
    const bad3 = new (_ as any)()
    expect(f(bad1, r)).toMatchInlineSnapshot(`
        Object {
          "code": 0,
          "data": Object {
            "type": "Object",
          },
          "message": "",
        }
    `)
    expect(f(bad2, r)).toMatchInlineSnapshot(`
        Object {
          "code": 0,
          "data": Object {
            "type": "Error",
          },
          "message": "normal",
        }
    `)
    expect(f(bad3, r)).toMatchInlineSnapshot(`
        Object {
          "code": 0,
          "data": Object {
            "type": "Error",
          },
          "message": "normal message",
        }
    `)
})

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
    await delay(100)
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
