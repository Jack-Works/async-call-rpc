import { DefaultImpl, defaultImpl, delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'launches with resolved implementation',
    withSnapshotDefault('async-call-impl-resolved', async (f) => {
        const server = f({ impl: Promise.resolve(defaultImpl) })
        expect(await server.add(1, 2)).toMatchInlineSnapshot(`3`)
    }),
)

it(
    'launches with rejected implementation',
    withSnapshotDefault('async-call-impl-rejected', async (f) => {
        const server = f({ impl: Promise.reject(new TypeError('Import failed')) })
        await expect((server as any).add(1, 2)).rejects.toThrowErrorMatchingInlineSnapshot(`"Import failed"`)
    }),
)

// It should not treat promise-like as a real Promise
it(
    'should not treat a promise-like as a real Promise',
    withSnapshotDefault('async-call-impl-promise-like', async (f) => {
        const server = f({ impl: { then: () => 1, otherMethods: () => 1 } })
        await expect(server.otherMethods()).resolves.toMatchInlineSnapshot(`1`)
    }),
)

it(
    'launches with pending implementation',
    withSnapshotDefault('async-call-impl-pending', async (f, _, log) => {
        let r: Function
        const impl = new Promise<DefaultImpl>((resolve) => (r = resolve))
        const server = f({ impl })
        const pending = server.add(1, 2)
        log('Request should not resolve before this line')
        await delay(200)
        r!(defaultImpl)
        await expect(pending).resolves.toMatchInlineSnapshot(`3`)
    }),
)
