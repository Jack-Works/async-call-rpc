import { defaultImpl, withSnapshotDefault } from './utils/test'

withSnapshotDefault('AsyncCall launch with resolved implementation', 'async-call-impl-resolved', async (f) => {
    const server = f({ impl: Promise.resolve(defaultImpl) })
    expect(await server.add(1, 2)).toMatchInlineSnapshot(`3`)
})

withSnapshotDefault('AsyncCall launch with rejected implementation', 'async-call-impl-rejected', async (f) => {
    const server = f({ impl: Promise.reject(new TypeError('Import failed')) })
    await expect((server as any).add(1, 2)).rejects.toThrowErrorMatchingInlineSnapshot(`"Import failed"`)
})

// It should not treat promise-like as a real Promise
withSnapshotDefault('AsyncCall launch with promise-like', 'async-call-impl-promise-like', async (f) => {
    const server = f({ impl: { then: () => 1, otherMethods: () => 1 } })
    expect(server).not.toHaveProperty('then')
    await expect(server.otherMethods()).resolves.toMatchInlineSnapshot(`1`)
})
