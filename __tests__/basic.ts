import { TestCallbackBasedChannel } from './utils/channels.js'
import { reproduceRandomID } from './utils/reproduce.js'
import { delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'should work for basic use case',
    withSnapshotDefault('async-call-basic', async (call) => {
        const server = call()
        // Method calls
        await Promise.all([
            expect(server.add(1, 2)).resolves.toMatchInlineSnapshot(`3`),
            expect(server.echo('string')).resolves.toMatchInlineSnapshot(`"string"`),
            expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot('"impl error"'),
            expect(server.throwEcho('1')).rejects.toThrowErrorMatchingInlineSnapshot('"1"'),
            // Unknown methods
            expect((server as any).not_found()).rejects.toThrowErrorMatchingInlineSnapshot('"Method not found"'),
            // Keep this reference
            expect(server.withThisRef()).resolves.toMatchInlineSnapshot(`3`),
        ])

        // Keep identity
        expect(server.add).toBe(server.add)
    }),
)

it(
    '(generator) should work for basic use case',
    withSnapshotDefault('async-call-generator-basic', async (_, call) => {
        const server = call()
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
    withSnapshotDefault('generateRandomID', async (f) => {
        await reproduceRandomID(async () => {
            const server = f({ opts: { idGenerator: undefined } })
            await server.add(1, 2)
        })
    }),
)

it(
    '(generator) default generateRandomID',
    withSnapshotDefault('generateRandomID-2', async (_, f) => {
        await reproduceRandomID(async () => {
            const server = f({ opts: { idGenerator: undefined } })
            for await (const _x of server.echo([])) {
            }
        })
    }),
)

it(
    'can used with CallbackBasedChannel',
    withSnapshotDefault(
        'CallbackBasedChannel',
        async (f) => {
            const server = f({})
            await server.add(1, 2)
        },
        800,
        TestCallbackBasedChannel,
    ),
)
it(
    'ignores invalid channel message in CallbackBasedChannel (by 2nd parameter of setup function)',
    withSnapshotDefault(
        'CallbackBasedChannel-2',
        async (f, _, __, raw) => {
            f({})
            await raw.client.send({ invalid: true })
            await delay(40)
        },
        800,
        TestCallbackBasedChannel,
    ),
)
