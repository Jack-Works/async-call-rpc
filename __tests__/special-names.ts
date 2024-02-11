import { withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'be called with symbol-keyed methods',
    withSnapshotDefault('async-call-symbols', async ({ init }) => {
        const server: any = init()
        await expect(server[Symbol.iterator]()).rejects.toThrowErrorMatchingInlineSnapshot(
            `[TypeError: Not start with rpc.]`,
        )
    }),
)

it(
    'be called with "rpc.*" methods',
    withSnapshotDefault('async-call-preserved-names', async ({ init }) => {
        const server: any = init()
        await expect(server['rpc.test']()).rejects.toThrowErrorMatchingInlineSnapshot(
            `[TypeError: Error 2: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#2]`,
        )
        expect(() => server.then()).toThrowErrorMatchingInlineSnapshot(`[TypeError: server.then is not a function]`)
    }),
)

it(
    '(generator) be called with symbol methods',
    withSnapshotDefault('async-call-generator-symbols', async ({ initIterator }) => {
        const server: any = initIterator()
        expect(() => server[Symbol.toStringTag]()).toThrowErrorMatchingInlineSnapshot(
            `[TypeError: Error 1: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#1]`,
        )
    }),
)
