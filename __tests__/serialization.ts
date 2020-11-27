import { JSONSerialization } from '../src'
import { withSnapshotDefault } from './utils/test'

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
