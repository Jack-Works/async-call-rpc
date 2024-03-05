import type { IsomorphicEncoder, Request, Requests, Response, Responses, SuccessResponse } from '../types.ts'
import { isArray, undefined } from './constants.ts'

/**
 * @public
 * Options of {@link (JSONEncoder:function)}
 */
export interface JSONEncoderOptions {
    /** Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read. */
    space?: string | number | undefined
    /**
     * How to handle `"undefined"` in the result of {@link SuccessResponse}.
     *
     * @remarks
     * If you need a full support of encoding `undefined`, for example, when the result is `{ field: undefined }` and you want to keep it,
     * you need to find another library to do this.
     *
     * If this is not handled properly, `JSON.stringify` will emit an invalid JSON-RPC object (fields with `undefined` value will be omitted).
     *
     * Options:
     * - `"null"`(**default**): convert it to `null`.
     * - `false`: do not do anything, let it break.
     */
    keepUndefined?: false | 'null' | undefined
    /** A function that transforms the results. */
    replacer?: ((this: any, key: string, value: any) => any) | undefined
    /** A function that transforms the results. This function is called for each member of the object. If a member contains nested objects, the nested objects are transformed before the parent object is. */
    reviver?: ((this: any, key: string, value: any) => any) | undefined
}
/**
 * Create a encoder by JSON.parse/stringify
 *
 * @public
 * @param options - Options for this encoder.
 * @remarks {@link IsomorphicEncoder}
 */
export function JSONEncoder({
    keepUndefined = 'null',
    replacer,
    reviver,
    space,
}: JSONEncoderOptions = {}): IsomorphicEncoder {
    return {
        encode(data) {
            if (keepUndefined) {
                isArray(data) ? data.forEach(undefinedEncode) : undefinedEncode(data)
            }
            return JSON.stringify(data, replacer, space)
        },
        decode(encoded) {
            const data: Requests | Responses = JSON.parse(encoded as string, reviver)
            return data
        },
    }
}

const undefinedEncode = (i: Response | Request) => {
    if ('result' in i && i.result === undefined) {
        i.result = null
    }
}

/** @public */
export namespace JSONEncoder {
    export const Default: IsomorphicEncoder<unknown, unknown> = JSONEncoder()
}
