import type { Serialization } from 'async-call-rpc'

export const BSON_Serialization = (bson: typeof import('bson')): Serialization => ({
    async deserialization(data: unknown) {
        if (data instanceof Blob) data = await data.arrayBuffer()
        if (data instanceof ArrayBuffer) data = new Uint8Array(data)
        // @ts-ignore
        return bson.deserialize(data)
    },
    serialization(data: any) {
        // @ts-ignore
        return bson.serialize(data)
    },
})
