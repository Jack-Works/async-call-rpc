//#region Serialization
/**
 * Serialization and deserialization of the JSON RPC payload
 * @public
 */
export interface Serialization {
    /**
     * Do serialization
     * @param from - original data
     */
    serialization(from: any): unknown | PromiseLike<unknown>
    /**
     * Do deserialization
     * @param serialized - Serialized data
     */
    deserialization(serialized: unknown): unknown | PromiseLike<unknown>
}

/**
 * Serialization implementation that do nothing
 * @remarks {@link Serialization}
 * @public
 */
export const NoSerialization: Serialization = {
    serialization(from) {
        return from
    },
    deserialization(serialized) {
        return serialized
    },
}

/**
 * Create a serialization by JSON.parse/stringify
 *
 * @param replacerAndReceiver - Replacer and receiver of JSON.parse/stringify
 * @param space - Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @remarks {@link Serialization}
 * @public
 */
export const JSONSerialization = (
    replacerAndReceiver: [((key: string, value: any) => any)?, ((key: string, value: any) => any)?] = [
        undefined,
        undefined,
    ],
    space?: string | number | undefined,
): Serialization => ({
    serialization(from) {
        return JSON.stringify(from, replacerAndReceiver[0], space)
    },
    deserialization(serialized) {
        return JSON.parse(serialized as string, replacerAndReceiver[1])
    },
})
//#endregion
