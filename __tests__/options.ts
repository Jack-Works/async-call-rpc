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
    const recover = reproduceError()
    try {
        const server = f({ opts: { log: 'all' } })
        await server.add(1, 2)
        await server.throws().catch(() => {})
    } finally {
        recover()
    }
})
