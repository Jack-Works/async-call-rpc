import { TestCallbackBasedChannel, createChannelPairFromConstructor } from './utils/channels.js'
import { reproduceRandomID } from './utils/reproduce.js'
import { delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'should work for basic use case',
    withSnapshotDefault('async-call-basic', async ({ init }) => {
        const server = init()
        // Method calls
        await Promise.all([
            expect(server.add(1, 2)).resolves.toMatchInlineSnapshot(`3`),
            expect(server.echo('string')).resolves.toMatchInlineSnapshot(`"string"`),
            expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: impl error]`),
            expect(server.throwEcho('1')).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: 1]`),
            // Unknown methods
            expect((server as any).not_found()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Method not found]`),
            // Keep this reference
            expect(server.withThisRef()).resolves.toMatchInlineSnapshot(`3`),
        ])

        // Keep identity
        expect(server.add).toBe(server.add)
    }),
)

it(
    '(generator) should work for basic use case',
    withSnapshotDefault('async-call-generator-basic', async ({ initIterator }) => {
        const server = initIterator()
        // Normal call
        {
            const iter = server.echo([1, 2, 3])
            expect(await iter.next()).toMatchInlineSnapshot(`
              {
                "done": false,
                "value": 1,
              }
            `)
            expect(await iter.next()).toMatchInlineSnapshot(`
              {
                "done": false,
                "value": 2,
              }
            `)
            expect(await iter.next()).toMatchInlineSnapshot(`
              {
                "done": false,
                "value": 3,
              }
            `)
            expect(await iter.next()).toMatchInlineSnapshot(`
              {
                "done": true,
                "value": undefined,
              }
            `)
        }
        // Abort
        {
            const iter = server.magic()
            expect(await iter.next(0)).toMatchInlineSnapshot(`
              {
                "done": false,
                "value": undefined,
              }
            `)
            expect(await iter.next(1)).toMatchInlineSnapshot(`
              {
                "done": false,
                "value": 1,
              }
            `)
            expect(await iter.throw(new Error('2'))).toMatchInlineSnapshot(`
              {
                "done": false,
                "value": [Error: 2],
              }
            `)
            expect(await iter.next('well')).toMatchInlineSnapshot(`
              {
                "done": false,
                "value": "well",
              }
            `)
            expect(await iter.return('bye')).toMatchInlineSnapshot(`
              {
                "done": true,
                "value": "bye",
              }
            `)
            expect(await iter.next(3)).toMatchInlineSnapshot(`
              {
                "done": true,
                "value": undefined,
              }
            `)
        }
        // Keep identity
        expect(server.echo).toBe(server.echo)
    }),
)

it(
    'default generateRandomID',
    withSnapshotDefault('generateRandomID', async ({ init }) => {
        await reproduceRandomID(async () => {
            const server = init({ options: { idGenerator: undefined } })
            await server.add(1, 2)
        })
    }),
)

it(
    '(generator) default generateRandomID',
    withSnapshotDefault('generateRandomID-2', async ({ initIterator }) => {
        await reproduceRandomID(async () => {
            const server = initIterator({ options: { idGenerator: undefined } })
            for await (const _x of server.echo([])) {
            }
        })
    }),
)

it(
    'can used with CallbackBasedChannel',
    withSnapshotDefault(
        'CallbackBasedChannel',
        async ({ init }) => {
            const server = init({})
            await server.add(1, 2)
        },
        { createChannelPair: (log) => createChannelPairFromConstructor(log, TestCallbackBasedChannel) },
    ),
)
it(
    'ignores invalid channel message in CallbackBasedChannel (by 2nd parameter of setup function)',
    withSnapshotDefault(
        'CallbackBasedChannel-2',
        async ({ init, channel }) => {
            init({})
            if (!('send' in channel.client)) throw new Error('test error')
            channel.client.send!({ invalid: true })
            await delay(40)
        },
        { createChannelPair: (log) => createChannelPairFromConstructor(log, TestCallbackBasedChannel) },
    ),
)
