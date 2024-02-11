import { batch, notify } from '../src/index.js'
import { delay, withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

// try those orders:
// notify(batch(server)[0])
// notify(batch(server)[0].fn)
// batch(notify(server))

it(
    'batch and notify can be used with style 1',
    withSnapshotDefault('async-call-batch-notify-1', async ({ init, log }) => {
        const server = init()
        const [b, send] = batch(server)
        const n = notify(b)
        await expect(Promise.all([n.add(1, 2), n.throws(), notify(b.add)(3, 4)])).resolves.toMatchInlineSnapshot(`
          [
            undefined,
            undefined,
            undefined,
          ]
        `)
        log('No log before this line')
        send()
        await delay(50)
    }),
)

it(
    'batch and notify can be used with style 2',
    withSnapshotDefault('async-call-batch-notify-2', async ({ init, log }) => {
        const server = init()
        const [b, _send, drop] = batch(server)
        const n = notify(b)
        await expect(Promise.all([n.add(1, 2), n.throws()])).resolves.toMatchInlineSnapshot(`
          [
            undefined,
            undefined,
          ]
        `)
        log('No log in this file')
        drop()
        await delay(50)
    }),
)

it(
    'batch and notify can be used with style 3',
    withSnapshotDefault('async-call-batch-notify-3', async ({ init, log }) => {
        const server = init()
        const [b, send] = batch(notify(server))
        await expect(Promise.all([b.add(1, 2), b.throws()])).resolves.toMatchInlineSnapshot(`
          [
            undefined,
            undefined,
          ]
        `)
        log('No log before this file')
        send()
        await delay(50)
    }),
)
