import { expect, it } from 'vitest'
import { delay, withSnapshotDefault } from './utils/test.js'

it(
    'works with AbortSignal on the client side',
    withSnapshotDefault('async-call-client-abort-signal', async ({ init, log }) => {
        const clientSignal = new AbortController()
        const clientForceSignal = new AbortController()
        const server = init<{ delay(ms: number, comment: string): Promise<void> }>({
            client: { signal: clientSignal.signal, forceSignal: clientForceSignal.signal },
            impl: { delay },
        })
        server.delay(200, 'first').then(() => (promiseResolved = true))
        const promise2 = server.delay(400, 'second').then(() => (promise2Resolved = true))

        let promiseResolved = false
        let promise2Resolved = false

        await delay(100) // T=0
        log('soft abort')
        clientSignal.abort()

        // new requests rejected
        const p = expect(server.delay(0, 'post abort')).rejects.toThrowErrorMatchingInlineSnapshot(
            `[AbortError: This operation was aborted]`,
        )
        await delay(100) // T=100
        expect(promiseResolved || promise2Resolved, 'pending promises should not be rejected').toBe(false)

        await delay(200) // T=300
        expect(promiseResolved, 'current promise should be able to resolve').toBe(true)

        log('hard abort')
        clientForceSignal.abort()
        // pending requests should be rejected
        await p
        await expect(promise2).rejects.toThrowErrorMatchingInlineSnapshot(`[AbortError: This operation was aborted]`)

        await delay(200)
    }),
)

it(
    'works with AbortSignal on the server side',
    withSnapshotDefault('async-call-server-abort-signal', async ({ init, log }) => {
        const serverSignal = new AbortController()
        const serverForceSignal = new AbortController()
        const server = init<{ delay(ms: number, comment: string): Promise<void> }>({
            server: { signal: serverSignal.signal, forceSignal: serverForceSignal.signal },
            impl: { delay },
        })
        server.delay(200, 'first').then(() => (promiseResolved = true))
        const promise2 = server.delay(400, 'second').then(() => (promise2Resolved = true))

        let promiseResolved = false
        let promise2Resolved = false

        // wait request to be send to the client
        await delay(100) // T=0
        log('soft abort')
        serverSignal.abort()

        // new requests rejected
        const p = expect(server.delay(0, 'post abort')).rejects.toThrowErrorMatchingInlineSnapshot(
            `[AbortError: This operation was aborted]`,
        )

        await delay(100) // T=100
        expect(promiseResolved || promise2Resolved, 'pending promises should not be rejected').toBe(false)

        await delay(200) // T=300
        expect(promiseResolved, 'current promise should be able to resolve').toBe(true)

        log('hard abort')
        serverForceSignal.abort()
        // pending requests should be rejected
        await p
        await expect(promise2).rejects.toThrowErrorMatchingInlineSnapshot(`[AbortError: This operation was aborted]`)
    }),
)
