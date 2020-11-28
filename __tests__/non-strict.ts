import { delay, withSnapshotDefault } from './utils/test'

withSnapshotDefault(
    'AsyncCall non strict behaviors',
    'async-call-non-strict',
    async (f, _, log, raw) => {
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
)

withSnapshotDefault('AsyncCall strict behaviors', 'async-call-strict', async (f, _, log, raw) => {
    const server: any = f()
    raw.client.send('unknown message')
    await expect(server.not_defined_method()).rejects.toThrowErrorMatchingInlineSnapshot(`"Method not found"`)
})

withSnapshotDefault('AsyncCall partial strict', 'async-call-strict-partial', async (f, _, log, raw) => {
    const server: any = f({ opts: { strict: { methodNotFound: true } } })
    raw.client.send('unknown message')
    await expect(server.not_defined_method()).rejects.toThrowErrorMatchingInlineSnapshot(`"Method not found"`)
})
