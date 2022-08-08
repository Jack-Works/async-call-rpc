import { reproduceError } from './utils/reproduce.js'
import { withSnapshotDefault } from './utils/test.js'
import { expect, it, vi } from 'vitest'

it(
    'options.logger',
    withSnapshotDefault('async-call-default-logger', async (f, _, log) => {
        log('In other tests we provide logger.', "So we'd test no logger here.", 'It should use globalThis.logger')
        const old = console
        globalThis.console = { log } as any
        const server = f({ opts: { logger: undefined } })
        globalThis.console = old
        await server.add(1, 2)
    }),
)

it(
    'options.log=all',
    withSnapshotDefault('async-call-log-all', async (f) => {
        await reproduceError(async () => {
            const server = f({ opts: { log: 'all' } })
            await server.add(1, 2)
            await server.throws().catch(() => {})
        })
    }),
)

it(
    'options.log=false',
    withSnapshotDefault('async-call-log-false', async (f) => {
        const server = f({ opts: { log: false } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    }),
)

it(
    'options.log=true',
    withSnapshotDefault('async-call-log-true', async (f) => {
        const server = f({ opts: { log: true } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    }),
)

it(
    'options.log=object',
    withSnapshotDefault('async-call-log-object', async (f) => {
        const server = f({ opts: { log: { type: 'basic', beCalled: true, localError: false } } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    }),
)

it(
    'options.requestReplay',
    withSnapshotDefault('async-call-log-requestReplay', async (f) => {
        const logs = [] as any[]
        const fn = vi.fn()
        const server = f({
            opts: {
                log: { requestReplay: true, beCalled: true },
                logger: { log: (...args: any[]) => logs.push(...args) },
            },
            impl: { twice: fn },
        })
        await server.twice()
        const replay = logs.find((x: any) => typeof x === 'function')
        if (!replay) throw new Error('No requestReplay function is logged')
        expect(fn).toBeCalledTimes(1)
        replay()
        expect(fn).toBeCalledTimes(2)
    }),
)

it(
    'options.parameterStructures',
    withSnapshotDefault('async-call-parameterStructures-by-name', async (f) => {
        const server = f({ opts: { parameterStructures: 'by-name' } })
        await expect(server.byPos({ a: 1, b: 2 })).resolves.toMatchInlineSnapshot(`3`)
    }),
)

it(
    'options.preferLocalImplementation',
    withSnapshotDefault('async-call-preferLocalImplementation', async (f) => {
        const server = f({ opts: { preferLocalImplementation: true } })
        await expect(server.add(1, 2)).resolves.toMatchInlineSnapshot(`3`)
    }),
)

it(
    'custom error mapper',
    withSnapshotDefault('async-call-custom-error-mapper', async (f) => {
        const server = f({
            opts: { mapError: () => ({ code: -233, message: 'Oh my message', data: { custom_data: true } }) },
        })
        await expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`"Oh my message"`)
    }),
)

it(
    'thenable = false',
    withSnapshotDefault('async-call-thenable-false', async (f) => {
        const a = f({
            opts: { thenable: false },
        })
        expect(a).toHaveProperty('then', undefined)
    }),
)
