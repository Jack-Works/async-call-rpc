import { delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'
it(
    'non strict behaviors',
    withSnapshotDefault(
        'async-call-non-strict',
        async ({ init, channel }) => {
            const server: any = init({ options: { strict: false } })
            if (!('send' in channel.client)) throw new Error('test error')

            // send unknown message should not return an error
            channel.client.send!('unknown message')
            // this promise should never resolves
            const promise: Promise<void> = server.not_defined_method()
            let fail = false
            promise.finally(() => (fail = true))
            await delay(800)
            if (fail) throw new Error('This promise should never resolves')
        },
        { timeout: 1000 },
    ),
)

it(
    'strict behaviors',
    withSnapshotDefault('async-call-strict', async ({ init, channel }) => {
        const server: any = init()
        if (!('send' in channel.client)) throw new Error('test error')
        channel.client.send!('unknown message')
        await expect(server.not_defined_method()).rejects.toThrowErrorMatchingInlineSnapshot(
            `[Error: Method not found]`,
        )
    }),
)

it(
    'partial strict behaviors',
    withSnapshotDefault('async-call-strict-partial', async ({ init, channel }) => {
        const server: any = init({ options: { strict: { methodNotFound: true } } })
        if (!('send' in channel.client)) throw new Error('test error')
        channel.client.send!('unknown message')
        await expect(server.not_defined_method()).rejects.toThrowErrorMatchingInlineSnapshot(
            `[Error: Method not found]`,
        )
    }),
)
