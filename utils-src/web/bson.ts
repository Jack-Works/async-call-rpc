import type { Serialization } from 'async-call-rpc'
import type { serialize as S, deserialize as D } from 'bson'

/**
 * @deprecated This will be removed in the next major version.
 */
export const BSON_Serialization = ({
    deserialize,
    serialize,
}: {
    serialize: typeof S
    deserialize: typeof D
}): Serialization => ({
    async deserialization(data: unknown) {
        if (data instanceof Blob) data = await data.arrayBuffer()
        if (data instanceof ArrayBuffer) data = new Uint8Array(data)
        return deserialize(data as any)
    },
    serialization(data: any) {
        return serialize(data)
    },
})
