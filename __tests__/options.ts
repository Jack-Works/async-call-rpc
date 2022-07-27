import { reproduceError } from './utils/reproduce'
import { withSnapshotDefault } from './utils/test'

withSnapshotDefault('AsyncCall options logger', 'async-call-default-logger', async (f, _, log) => {
    log('In other tests we provide logger.', "So we'd test no logger here.", 'It should use globalThis.logger')
    const old = console
    globalThis.console = { log } as any
    const server = f({ opts: { logger: undefined } })
    globalThis.console = old
    await server.add(1, 2)
})

withSnapshotDefault('AsyncCall options log=all', 'async-call-log-all', async (f) => {
    await reproduceError(async () => {
        const server = f({ opts: { log: 'all' } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    })
})

withSnapshotDefault('AsyncCall options log=false', 'async-call-log-false', async (f) => {
    const server = f({ opts: { log: false } })
    await server.add(1, 2)
    await server.throws().catch(() => {})
})

withSnapshotDefault('AsyncCall options log=true', 'async-call-log-true', async (f) => {
    const server = f({ opts: { log: true } })
    await server.add(1, 2)
    await server.throws().catch(() => {})
})

withSnapshotDefault('AsyncCall options log=object', 'async-call-log-object', async (f) => {
    const server = f({ opts: { log: { type: 'basic', beCalled: true, localError: false } } })
    await server.add(1, 2)
    await server.throws().catch(() => {})
})

withSnapshotDefault('AsyncCall options requestReplay', 'async-call-log-requestReplay', async (f) => {
    const logs = [] as any[]
    const fn = jest.fn()
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
})

withSnapshotDefault('AsyncCall options parameterStructures', 'async-call-parameterStructures-by-name', async (f) => {
    const server = f({ opts: { parameterStructures: 'by-name' } })
    await expect(server.byPos({ a: 1, b: 2 })).resolves.toMatchInlineSnapshot(`3`)
})

withSnapshotDefault('AsyncCall preferLocalImplementation', 'async-call-preferLocalImplementation', async (f) => {
    const server = f({ opts: { preferLocalImplementation: true } })
    await expect(server.add(1, 2)).resolves.toMatchInlineSnapshot(`3`)
})

withSnapshotDefault('AsyncCall custom error mapper', 'async-call-custom-error-mapper', async (f) => {
    const server = f({
        opts: { mapError: (e) => ({ code: -233, message: 'Oh my message', data: { custom_data: true } }) },
    })
    await expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`"Oh my message"`)
})

withSnapshotDefault('AsyncCall thenable = false', 'async-call-thenable-false', async (f) => {
    const a = f({
        opts: { thenable: false },
    })
    expect(a).toHaveProperty('then', undefined)
})
