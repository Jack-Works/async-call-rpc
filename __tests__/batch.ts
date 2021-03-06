import { batch } from '../src'
import { withSnapshotDefault } from './utils/test'

withSnapshotDefault('AsyncCall batch request', 'async-call-batch', async (f, _, log) => {
    const [server, send, drop] = batch(f())
    {
        const a = server.add(2, 3)
        const b = server.echo(1)
        log('Before this line no request was sent')
        send()
        expect(await a).toMatchInlineSnapshot(`5`)
        expect(await b).toMatchInlineSnapshot(`1`)
        log('Part 1 end')
    }
    {
        log('Part 2 start')
        const a = server.add(2, 3)
        const b = server.echo(1)
        log('In this part there should be no log')
        drop()
        expect(a).rejects.toThrowErrorMatchingInlineSnapshot(`"Aborted"`)
        expect(b).rejects.toThrowErrorMatchingInlineSnapshot(`"Aborted"`)
        log('Part 2 end')
    }
    // Keep identity
    expect(server.add).toBe(server.add)
})
