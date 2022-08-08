import { replayFunction } from '../src/utils/constants.js'
import { withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'be called with symbol-keyed methods',
    withSnapshotDefault('async-call-symbols', async (f) => {
        const server: any = f()
        await expect(server[Symbol.iterator]()).rejects.toThrowErrorMatchingInlineSnapshot(`"Not start with rpc."`)
    }),
)

it(
    'be called with "rpc.*" methods',
    withSnapshotDefault('async-call-preserved-names', async (f) => {
        const server: any = f()
        await expect(server['rpc.test']()).rejects.toThrowErrorMatchingInlineSnapshot(
            `"Error 2: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#2"`,
        )
        expect(() => server.then()).toThrowErrorMatchingInlineSnapshot(`"server.then is not a function"`)
    }),
)

it(
    '(generator) be called with symbol methods',
    withSnapshotDefault('async-call-generator-symbols', async (_, f) => {
        const server: any = f()
        expect(() => server[Symbol.toStringTag]()).toThrowErrorMatchingInlineSnapshot(
            `"Error 1: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#1"`,
        )
    }),
)

it('should log a replay function that stringified result to be clear', () => {
    expect(replayFunction()).toMatchInlineSnapshot(`"() => replay()"`)
})
