import { withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    '(generator) behavior correct',
    withSnapshotDefault('generator-detailed', async ({ initIterator }) => {
        const server = initIterator()
        const gen = server.endless()
        expect(await gen.next()).toMatchInlineSnapshot(`
          {
            "done": false,
            "value": 1,
          }
        `)
        expect(await gen.return({} as never)).toMatchInlineSnapshot(`
          {
            "done": false,
            "value": 1,
          }
        `)
        expect(await gen.throw({})).toMatchInlineSnapshot(`
          {
            "done": false,
            "value": 2,
          }
        `)
        expect(await gen.next({})).toMatchInlineSnapshot(`
          {
            "done": false,
            "value": 1,
          }
        `)
        expect(await gen.next({})).toMatchInlineSnapshot(`
          {
            "done": false,
            "value": 1,
          }
        `)

        const gen2 = server.echo([])
        expect(await gen2.next()).toMatchInlineSnapshot(`
          {
            "done": true,
            "value": undefined,
          }
        `)
        expect(await gen2.next()).toMatchInlineSnapshot(`
          {
            "done": true,
            "value": undefined,
          }
        `)
        expect(await gen2.return(1 as any)).toMatchInlineSnapshot(`
          {
            "done": true,
            "value": 1,
          }
        `)
        await expect(gen2.throw(1 as any)).rejects.toThrowErrorMatchingInlineSnapshot('1')
    }),
)
