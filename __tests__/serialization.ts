import { JSONSerialization, NoSerialization } from '../src'
import { withSnapshotDefault } from './utils/test'
import { BSON_Serialization } from '../utils-src/node/bson'

withSnapshotDefault('serialization-json', 'serialization-json-default', async (f) => {
    const server = f({ opts: { serializer: JSONSerialization() } })
    expect(await server.undefined()).toMatchInlineSnapshot(`null`)
})

withSnapshotDefault('serialization-json with keep undefined', 'serialization-json-keep-undefined', async (f) => {
    const server = f({ opts: { serializer: JSONSerialization(undefined, undefined, 'keep') } })
    expect(await server.undefined()).toMatchInlineSnapshot(`undefined`)
})

withSnapshotDefault('serialization-json with no keep', 'serialization-json-no-keep', async (f) => {
    const server = f({ opts: { serializer: JSONSerialization(undefined, undefined, false) } })
    expect(await server.undefined()).toMatchInlineSnapshot(`undefined`)
})

withSnapshotDefault('serialization-bson', 'serialization-bson', async (f) => {
    const server = f({ opts: { serializer: BSON_Serialization(require('bson')) } })
    expect(await server.add(1, 2)).toMatchInlineSnapshot(`3`)
    expect(await server.undefined()).toMatchInlineSnapshot(`undefined`)
    await expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`"impl error"`)
})

withSnapshotDefault('serialization-no-serialization', 'serialization-no-serialization', async (f) => {
    const server = f({ opts: { serializer: NoSerialization } })
    expect(await server.add(1, 2)).toMatchInlineSnapshot(`3`)
    expect(await server.undefined()).toMatchInlineSnapshot(`undefined`)
    await expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`"impl error"`)
})
