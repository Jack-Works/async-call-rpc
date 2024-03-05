import { isObject, undefined } from './constants.ts'
import type { Serialization } from '../types.ts'

/**
 * Serialization implementation that do nothing
 * @remarks {@link Serialization}
 * @public
 * @deprecated Will be removed in next major version
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
 * @param undefinedKeepingBehavior - How to keep "undefined" in result of SuccessResponse?
 *
 * If it is not handled properly, JSON.stringify will emit an invalid JSON RPC object.
 *
 * Options:
 * - `"null"`(**default**): convert it to null.
 * - `"keep"`: try to keep it by additional property "undef".
 * - `false`: Don't keep it, let it break.
 * @remarks {@link Serialization}
 * @public
 */
export const JSONSerialization = (
    replacerAndReceiver: [((key: string, value: any) => any)?, ((key: string, value: any) => any)?] = [
        undefined,
        undefined,
    ],
    space?: string | number | undefined,
    undefinedKeepingBehavior: 'keep' | 'null' | false = 'null',
): Serialization => ({
    serialization(from) {
        if (undefinedKeepingBehavior && isObject(from) && 'result' in from && from.result === undefined) {
            const alt = { ...from }
            alt.result = null
            if (undefinedKeepingBehavior === 'keep') (alt as any).undef = true
            from = alt
        }
        return JSON.stringify(from, replacerAndReceiver[0], space)
    },
    deserialization(serialized) {
        const result = JSON.parse(serialized as string, replacerAndReceiver[1])
        if (
            isObject(result) &&
            'result' in result &&
            result.result === null &&
            'undef' in result &&
            result.undef === true
        ) {
            result.result = undefined
            delete result.undef
        }
        return result
    },
})
