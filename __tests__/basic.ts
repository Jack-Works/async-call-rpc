import { JestCallbackBasedChannel } from './utils/channels'
import { reproduceRandomID } from './utils/reproduce'
import { delay, withSnapshotDefault } from './utils/test'

withSnapshotDefault('basic use case of Async Call should work', 'async-call-basic', async (call) => {
    const server = call()
    // Method calls
    await Promise.all([
        expect(server.add(1, 2)).resolves.toMatchInlineSnapshot(`3`),
        expect(server.echo('string')).resolves.toMatchInlineSnapshot(`"string"`),
        expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`"impl error"`),
        expect(server.throwEcho('1')).rejects.toThrowErrorMatchingInlineSnapshot(`"1"`),
        // Unknown methods
        expect((server as any).not_found()).rejects.toThrowErrorMatchingInlineSnapshot(`"Method not found"`),
        // Keep this reference
        expect(server.withThisRef()).resolves.toMatchInlineSnapshot(`3`),
    ])

    // Keep identity
    expect(server.add).toBe(server.add)
})

withSnapshotDefault(
    'basic use case of Async Call Generator should work',
    'async-call-generator-basic',
    async (_, call) => {
        const server = call()
        // Normal call
        {
            const iter = server.echo([1, 2, 3])
            expect(await iter.next()).toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": 1,
                }
            `)
            expect(await iter.next()).toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": 2,
                }
            `)
            expect(await iter.next()).toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": 3,
                }
            `)
            expect(await iter.next()).toMatchInlineSnapshot(`
                Object {
                  "done": true,
                  "value": undefined,
                }
            `)
        }
        // Abort
        {
            const iter = server.magic()
            expect(await iter.next(0)).toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": undefined,
                }
            `)
            expect(await iter.next(1)).toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": 1,
                }
            `)
            expect(await iter.throw(new Error('2'))).toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": [Error: 2],
                }
            `)
            expect(await iter.next('well')).toMatchInlineSnapshot(`
                Object {
                  "done": false,
                  "value": "well",
                }
            `)
            // @ts-expect-error ts cannot get this type correctly.
            expect(await iter.return('bye')).toMatchInlineSnapshot(`
                Object {
                  "done": true,
                  "value": "bye",
                }
            `)
            expect(await iter.next(3)).toMatchInlineSnapshot(`
                Object {
                  "done": true,
                  "value": undefined,
                }
            `)
        }
        // Keep identity
        expect(server.echo).toBe(server.echo)
    },
)

withSnapshotDefault('default generateRandomID', 'generateRandomID', async (f) => {
    await reproduceRandomID(async () => {
        const server = f({ opts: { idGenerator: undefined } })
        await server.add(1, 2)
    })
})

withSnapshotDefault('default generateRandomID', 'generateRandomID-2', async (_, f) => {
    await reproduceRandomID(async () => {
        const server = f({ opts: { idGenerator: undefined } })
        for await (const x of server.echo([])) {
        }
    })
})

withSnapshotDefault(
    'CallbackBasedChannel',
    'CallbackBasedChannel',
    async (f) => {
        const server = f({})
        await server.add(1, 2)
    },
    800,
    JestCallbackBasedChannel,
)

withSnapshotDefault(
    'CallbackBasedChannel JSON-RPC invalid ignore (by 2nd parameter of setup function)',
    'CallbackBasedChannel-2',
    async (f, _, __, raw) => {
        const server = f({})
        await raw.client.send({ invalid: true })
        await delay(40)
    },
    800,
    JestCallbackBasedChannel,
)
