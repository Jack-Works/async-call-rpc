import { delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'
it(
    'non strict behaviors',
    withSnapshotDefault(
        'async-call-non-strict',
        async (f, _, _log, raw) => {
            const server: any = f({ opts: { strict: false } })
            // send unknown message should not return an error
            raw.client.send('unknown message')
            // this promise should never resolves
            const promise: Promise<void> = server.not_defined_method()
            let fail = false
            promise.finally(() => (fail = true))
            await delay(800)
            if (fail) throw new Error('This promise should never resolves')
        },
        1000,
    ),
)

it(
    'strict behaviors',
    withSnapshotDefault('async-call-strict', async (f, _, _log, raw) => {
        const server: any = f()
        raw.client.send('unknown message')
        await expect(server.not_defined_method()).rejects.toThrowErrorMatchingInlineSnapshot(`"Method not found"`)
    }),
)

it(
    'partial strict behaviors',
    withSnapshotDefault('async-call-strict-partial', async (f, _, _log, raw) => {
        const server: any = f({ opts: { strict: { methodNotFound: true } } })
        raw.client.send('unknown message')
        await expect(server.not_defined_method()).rejects.toThrowErrorMatchingInlineSnapshot(`"Method not found"`)
    }),
)
