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
    async serialization(from) {
        return from
    },
    async deserialization(serialized) {
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
    replacerAndReceiver: [Parameters<JSON['stringify']>[1], Parameters<JSON['parse']>[1]] = [undefined, undefined],
    space?: string | number | undefined,
) =>
    ({
        async serialization(from) {
            return JSON.stringify(from, replacerAndReceiver[0], space)
        },
        async deserialization(serialized) {
            return JSON.parse(serialized as string, replacerAndReceiver[1])
        },
    } as Serialization)
//#endregion
