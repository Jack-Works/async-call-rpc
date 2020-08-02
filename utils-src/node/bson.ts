import type bsonLib from 'bson'
import type { Serialization } from '../../src/Async-Call'

export const BSON_Serialization = (bson: typeof bsonLib): Serialization => ({
    deserialization(data: Buffer) {
        return bson.deserialize(data)
    },
    serialization(data: Buffer) {
        return bson.serialize(data)
    },
})
