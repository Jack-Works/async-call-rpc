import { batch, notify } from '../src'
import { delay, withSnapshotDefault } from './utils/test'

// try those orders:
// notify(batch(server)[0])
// notify(batch(server)[0].fn)
// batch(notify(server))

withSnapshotDefault('AsyncCall batch&notify request 1', 'async-call-batch-notify-1', async (f, _, log) => {
    const server = f()
    const [b, send, drop] = batch(server)
    const n = notify(b)
    await expect(Promise.all([n.add(1, 2), n.throws()])).resolves.toMatchInlineSnapshot(`
                Array [
                  undefined,
                  undefined,
                ]
            `)
    log('No log before this line')
    send()
    await delay(50)
})

withSnapshotDefault('AsyncCall batch&notify request 2', 'async-call-batch-notify-2', async (f, _, log) => {
    const server = f()
    const [b, send, drop] = batch(server)
    const n = notify(b)
    await expect(Promise.all([n.add(1, 2), n.throws()])).resolves.toMatchInlineSnapshot(`
                Array [
                  undefined,
                  undefined,
                ]
            `)
    log('No log before this line')
    drop()
    await delay(50)
})
