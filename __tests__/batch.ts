import { batch } from '../src/index.js'
import { withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'can send batch request',
    withSnapshotDefault('async-call-batch', async ({ init, log }) => {
        const [server, send, drop] = batch(init())

        // brand check
        expect(Object.getPrototypeOf(server)).toBeNull()
        expect(() => Object.setPrototypeOf(server, {})).toThrow()
        expect(Object.getPrototypeOf(server)).toBeNull()
        Object.setPrototypeOf(server, null)

        // should not send anything
        send()
        {
            const a = server.add(2, 3)
            const b = server.echo(1)
            log('Before this line no request was sent')
            send()
            expect(await a).toMatchInlineSnapshot(`5`)
            expect(await b).toMatchInlineSnapshot(`1`)
            log('After this line no request was sent')
            send()
            log('Part 1 end')
        }
        {
            log('Part 2 start')
            const a = server.add(2, 3)
            const b = server.echo(1)
            log('In this part it should has no log')
            drop()
            expect(a).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Aborted]`)
            expect(b).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Aborted]`)
            log('Part 2 end')
        }
        // Keep identity
        expect(server.add).toBe(server.add)
    }),
)

it(
    'can create multiple batch',
    withSnapshotDefault('async-call-multiple-batch', async ({ init, log }) => {
        const _server = init()
        const [server, send, drop] = batch(_server)
        const [server2, send2] = batch(_server)

        // should not send anything
        send()
        {
            const a = server.add(2, 3)
            const b = server.echo(1)
            const a2 = server2.add(4, 5)
            const b2 = server2.echo(2)

            log('Before this line no request from batch 1 was sent')
            send()
            await a
            await b
            log('After this line no request from batch 1 was sent')
            send()

            log('Before this line no request from batch 2 was sent')
            send2()
            await a2
            await b2
            log('After this line no request from batch 2 was sent')
            send2()

            log('Part 1 end')
        }
        {
            log('Part 2 start')
            const a = server.add(2, 3)
            const b = server.echo(1)
            const a2 = server2.add(4, 5)
            const b2 = server2.echo(2)

            drop()
            await expect(a).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Aborted]`)
            await expect(b).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Aborted]`)

            send2()
            await a2
            await b2

            log('Part 2 end')
        }
    }),
)
