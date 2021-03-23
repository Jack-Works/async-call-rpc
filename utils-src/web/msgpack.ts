import type { encode as S, decode as D } from '@msgpack/msgpack'
import type { Serialization } from 'async-call-rpc'
export const Msgpack_Serialization = ({ encode, decode }: { encode: typeof S; decode: typeof D }): Serialization => ({
    async deserialization(data: any) {
        if (data instanceof Blob) data = await data.arrayBuffer()
        if (data instanceof ArrayBuffer) data = new Uint8Array(data)
        return decode(data)
    },
    serialization(data: any) {
        return encode(data)
    },
})
