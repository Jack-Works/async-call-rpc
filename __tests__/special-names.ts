import { withSnapshotDefault } from './utils/test'

withSnapshotDefault('AsyncCall with symbol methods', 'async-call-symbols', async (f) => {
    const server: any = f()
    await expect(server[Symbol.iterator]()).rejects.toThrowErrorMatchingInlineSnapshot(`"Not start with rpc."`)
})

withSnapshotDefault('AsyncCall with rpc.* methods', 'async-call-preserved-names', async (f) => {
    const server: any = f()
    await expect(server['rpc.test']()).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Error 2: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#2"`,
    )
    expect(() => server.then()).toThrowErrorMatchingInlineSnapshot(`"server.then is not a function"`)
})
