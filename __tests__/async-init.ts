import { TestEventBasedChannel } from './utils/channels.js'
import { type DefaultImpl, defaultImpl, delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'launches with resolved implementation',
    withSnapshotDefault('async-call-impl-resolved', async ({ init }) => {
        const server = init({ impl: Promise.resolve(defaultImpl) })
        expect(await server.add(1, 2)).toMatchInlineSnapshot(`3`)
    }),
)

it(
    'launches with rejected implementation',
    withSnapshotDefault('async-call-impl-rejected', async ({ init }) => {
        const server = init({ impl: Promise.reject(new TypeError('Import failed')) })
        await expect((server as any).add(1, 2)).rejects.toThrowErrorMatchingInlineSnapshot(`[TypeError: Import failed]`)
    }),
)

it(
    'should not treat a promise-like as a real Promise',
    withSnapshotDefault('async-call-impl-promise-like', async ({ init }) => {
        const server = init({ impl: { then: () => 1, otherMethods: () => 1 } })
        await expect(server.otherMethods()).resolves.toMatchInlineSnapshot(`1`)
    }),
)

it(
    'launches with pending implementation',
    withSnapshotDefault('async-call-impl-pending', async ({ init, log }) => {
        let r: Function
        const impl = new Promise<DefaultImpl>((resolve) => (r = resolve))
        const server = init({ impl })
        const pending = server.add(1, 2)
        log('Request should not resolve before this line')
        await delay(200)
        r!(defaultImpl)
        await expect(pending).resolves.toMatchInlineSnapshot(`3`)
    }),
)

it(
    'launches with resolved channel',
    withSnapshotDefault('async-call-channel-resolved', async ({ init, channel }) => {
        const server = init({
            client: { channel: Promise.resolve(channel.client) },
        })
        expect(await server.add(1, 2)).toMatchInlineSnapshot(`3`)
    }),
)

it(
    'launches with rejected channel',
    withSnapshotDefault('async-call-channel-rejected', async ({ init }) => {
        const server = init({
            client: { channel: Promise.reject(new Error()) },
        })
        await expect(server.add(1, 2)).rejects.toMatchInlineSnapshot('[Error]')
    }),
)

it(
    'should not treat a promise-like channel as a real Promise',
    withSnapshotDefault('async-call-channel-promise-like', async ({ init, channel }) => {
        Object.defineProperty(channel.client, 'then', {
            value: () => {
                throw new Error('This method should never be called.')
            },
        })
        const server = init()
        expect(await server.add(1, 2)).toMatchInlineSnapshot(`3`)
    }),
)

it(
    'launches with pending channel',
    withSnapshotDefault('async-call-channel-pending', async ({ init, log, channel }) => {
        let r: Function
        const channelPromise = new Promise<TestEventBasedChannel>((resolve) => (r = resolve))
        const server = init({ client: { channel: channelPromise } })
        const pending = server.add(1, 2)
        log('Request should not resolve before this line')
        await delay(200)
        r!(channel.client)
        await expect(pending).resolves.toMatchInlineSnapshot(`3`)
    }),
)
