import {
    AsyncCall,
    JSONEncoder,
    NoSerialization,
    type IsomorphicEncoder,
    type IsomorphicEncoderFull,
} from '../src/index.js'
import { TestEventBasedChannel, createChannelPairFromConstructor } from './utils/channels.js'
import { createLogger, type Logger } from './utils/logger.js'
import { delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

//#region JSONEncoder
it(
    'should work with JSONEncoder()',
    withSnapshotDefault('encoder-json', async ({ init }) => {
        const server = init({ options: { encoder: JSONEncoder() } })
        expect(await server.undefined()).toMatchInlineSnapshot('null')
        expect(await server.deep_undefined()).toMatchInlineSnapshot(`
          {
            "a": {
              "b": {},
            },
          }
        `)
    }),
)

it(
    'should work with JSONEncoder.Default',
    withSnapshotDefault('encoder-json-Default', async ({ init }) => {
        const server = init({ options: { encoder: JSONEncoder.Default } })
        expect(await server.undefined()).toMatchInlineSnapshot('null')
        expect(await server.deep_undefined()).toMatchInlineSnapshot(`
          {
            "a": {
              "b": {},
            },
          }
        `)
    }),
)

it(
    'should NOT work with JSONEncoder({ keepUndefined: false })',
    withSnapshotDefault('encoder-json-no-keep', async ({ init }) => {
        const server = init({ options: { encoder: JSONEncoder({ keepUndefined: false }) } })
        server.undefined()
        expect(await server.deep_undefined()).toMatchInlineSnapshot(`
          {
            "a": {
              "b": {},
            },
          }
        `)
        await delay(100)
    }),
)
//#endregion

it(
    'should work when neither encoder nor serialization is defined',
    withSnapshotDefault('no-encoder-no-serialization', async ({ init }) => {
        const server = init()
        expect(await server.undefined()).toMatchInlineSnapshot('undefined')
    }),
)
it('should throw when both encoder and serialization is defined', async () => {
    const { log } = createLogger(['server', 'client'])
    const { server } = createChannelPairFromConstructor({ client: log.client, server: log.server })
    expect(() => {
        AsyncCall({}, { encoder: JSONEncoder.Default, serializer: NoSerialization, channel: server })
    }).toThrowErrorMatchingInlineSnapshot(`[TypeError: Please remove serializer.]`)
})
const RecordingEncoder = (log: (...args: any) => void): IsomorphicEncoder & Partial<IsomorphicEncoderFull> => ({
    encode(data) {
        log('encode', data)
        return data
    },
    encodeRequest(data) {
        log('encodeRequest', data)
        return data
    },
    encodeResponse(data) {
        log('encodeResponse', data)
        return data
    },
    decodeResponse(encoded) {
        log('decodeResponse', encoded)
        return encoded as any
    },
    decodeRequest(data) {
        log('decodeRequest', data)
        return data as any
    },
    decode(encoded) {
        log('decode', encoded)
        return encoded as any
    },
})
it(
    'should work with IsomorphicEncoderFull encoder with hint',
    withSnapshotDefault('encode-isomorphic-full-hinted', async ({ init, log }) => {
        const encoder = RecordingEncoder(log)
        const server = init({ options: { encoder } })
        expect(await server.undefined()).toMatchInlineSnapshot('undefined')
    }),
)
it(
    'should work with IsomorphicEncoder encoder with hint',
    withSnapshotDefault('encode-isomorphic-hinted', async ({ init, log }) => {
        const encoder = RecordingEncoder(log)
        delete encoder.decodeRequest
        delete encoder.decodeResponse
        delete encoder.encodeRequest
        delete encoder.encodeResponse
        const server = init({ options: { encoder } })
        expect(await server.undefined()).toMatchInlineSnapshot('undefined')
    }),
)
const notHinted = {
    createChannelPair(logger: Record<'client' | 'server', Logger>) {
        const server = new TestEventBasedChannel(undefined!, logger.server, false)
        const client = new TestEventBasedChannel(server, logger.client, false)
        server.otherSide = client
        return { server, client }
    },
}
it(
    'should work with IsomorphicEncoderFull encoder without hint',
    withSnapshotDefault(
        'encode-isomorphic-full-not-hinted',
        async ({ init, log }) => {
            const encoder = RecordingEncoder(log)
            const server = init({ options: { encoder } })
            expect(await server.undefined()).toMatchInlineSnapshot('undefined')
        },
        notHinted,
    ),
)
it(
    'should work with IsomorphicEncoder encoder without hint',
    withSnapshotDefault(
        'encode-isomorphic-not-hinted',
        async ({ init, log }) => {
            const encoder = RecordingEncoder(log)
            delete encoder.decodeRequest
            delete encoder.decodeResponse
            delete encoder.encodeRequest
            delete encoder.encodeResponse
            const server = init({ options: { encoder } })
            expect(await server.undefined()).toMatchInlineSnapshot('undefined')
        },
        notHinted,
    ),
)
