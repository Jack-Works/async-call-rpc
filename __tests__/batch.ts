import { batch } from '../src/index.js'
import { withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'can send batch request',
    withSnapshotDefault('async-call-batch', async (f, _, log) => {
        const [server, send, drop] = batch(f())

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
            log('In this part it should be no log')
            drop()
            expect(a).rejects.toThrowErrorMatchingInlineSnapshot(`"Aborted"`)
            expect(b).rejects.toThrowErrorMatchingInlineSnapshot(`"Aborted"`)
            log('Part 2 end')
        }
        // Keep identity
        expect(server.add).toBe(server.add)
    }),
)
