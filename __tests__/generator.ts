import { withSnapshotDefault } from './utils/test'

withSnapshotDefault('generator behavior in detail', 'generator-detailed', async (_, f) => {
    const server = f()
    const gen = server.endless()
    expect(await gen.next()).toMatchInlineSnapshot(`
        Object {
          "done": false,
          "value": 1,
        }
    `)
    expect(await gen.return({} as any)).toMatchInlineSnapshot(`
        Object {
          "done": false,
          "value": 1,
        }
    `)
    expect(await gen.throw({})).toMatchInlineSnapshot(`
        Object {
          "done": false,
          "value": 2,
        }
    `)
    expect(await gen.next({})).toMatchInlineSnapshot(`
        Object {
          "done": false,
          "value": 1,
        }
    `)
    expect(await gen.next({})).toMatchInlineSnapshot(`
        Object {
          "done": false,
          "value": 1,
        }
    `)

    const gen2 = server.echo([])
    expect(await gen2.next()).toMatchInlineSnapshot(`
        Object {
          "done": true,
          "value": undefined,
        }
    `)
    expect(await gen2.next()).toMatchInlineSnapshot(`
        Object {
          "done": true,
          "value": undefined,
        }
    `)
    expect(await gen2.return(1 as any)).toMatchInlineSnapshot(`
        Object {
          "done": true,
          "value": 1,
        }
    `)
    await expect(gen2.throw(1 as any)).rejects.toThrowErrorMatchingInlineSnapshot(`undefined`)
})
