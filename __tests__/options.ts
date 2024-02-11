import { reproduceError } from './utils/reproduce.js'
import { withSnapshotDefault } from './utils/test.js'
import { expect, it, vi } from 'vitest'

it(
    'options.logger',
    withSnapshotDefault('async-call-default-logger', async ({ init, log }) => {
        log('In other tests we provide logger.', "So we'd test no logger here.", 'It should use globalThis.logger')
        const old = console
        globalThis.console = { log } as any
        const server = init({ options: { logger: undefined } })
        globalThis.console = old
        await server.add(1, 2)
    }),
)

it(
    'options.log=all',
    withSnapshotDefault('async-call-log-all', async ({ init }) => {
        await reproduceError(async () => {
            const server = init({ options: { log: 'all' } })
            await server.add(1, 2)
            await server.throws().catch(() => {})
        })
    }),
)

it(
    'options.log=false',
    withSnapshotDefault('async-call-log-false', async ({ init }) => {
        const server = init({ options: { log: false } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    }),
)

it(
    'options.log=true',
    withSnapshotDefault('async-call-log-true', async ({ init }) => {
        const server = init({ options: { log: true } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    }),
)

it(
    'options.log=object',
    withSnapshotDefault('async-call-log-object', async ({ init }) => {
        const server = init({ options: { log: { type: 'basic', beCalled: true, localError: false } } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    }),
)

it(
    'options.requestReplay',
    withSnapshotDefault('async-call-log-requestReplay', async ({ init }) => {
        const logs = [] as any[]
        const fn = vi.fn()
        const server = init({
            options: {
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
    withSnapshotDefault('async-call-parameterStructures-by-name', async ({ init }) => {
        const server = init({ options: { parameterStructures: 'by-name' } })
        await expect(server.byPos({ a: 1, b: 2 })).resolves.toMatchInlineSnapshot(`3`)
    }),
)

it(
    'options.preferLocalImplementation',
    withSnapshotDefault('async-call-preferLocalImplementation', async ({ init }) => {
        const server = init({ options: { preferLocalImplementation: true } })
        await expect(server.add(1, 2)).resolves.toMatchInlineSnapshot(`3`)
    }),
)

it(
    'custom error mapper',
    withSnapshotDefault('async-call-custom-error-mapper', async ({ init }) => {
        const server = init({
            options: { mapError: () => ({ code: -233, message: 'Oh my message', data: { custom_data: true } }) },
        })
        await expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Oh my message]`)
    }),
)

it(
    'thenable = false',
    withSnapshotDefault('async-call-thenable-false', async ({ init }) => {
        const a = init({
            options: { thenable: false },
        })
        expect(a).toHaveProperty('then', undefined)
    }),
)
