import { globalDOMException as DOMException, DOMExceptionHeader } from './error.js'
import type { ErrorMapFunction } from '../Async-Call.js'
import { ERROR, isArray, isBoolean, isFunction, isObject, isString, undefined } from './constants.js'

export const jsonrpc = '2.0'
export type ID = string | number | null | undefined
/**
 * JSONRPC Request object.
 */
export interface Request
    extends Readonly<{
        jsonrpc: typeof jsonrpc
        id?: ID
        method: string
        params: readonly unknown[] | object
        remoteStack?: string
    }> {}

export const Request = (id: ID, method: string, params: readonly unknown[] | object, remoteStack?: string): Request => {
    const x: Request = { jsonrpc, id, method, params, remoteStack }
    deleteUndefined(x, 'id')
    deleteFalsy(x, 'remoteStack')
    return x
}

/**
 * JSONRPC SuccessResponse object.
 */
export interface SuccessResponse
    extends Readonly<{
        jsonrpc: typeof jsonrpc
        id?: ID
        result: unknown
    }> {}
export const SuccessResponse = (id: ID, result: unknown): SuccessResponse => {
    const x: SuccessResponse = { jsonrpc, id, result }
    deleteUndefined(x, 'id')
    return x
}

/**
 * JSONRPC ErrorResponse object.
 * @public
 */
export interface ErrorResponse<E = unknown>
    extends Readonly<{
        jsonrpc: typeof jsonrpc
        id?: ID
        error: Readonly<{ code: number; message: string; data?: E }>
    }> {}

export const ErrorResponse = <T>(id: ID, code: number, message: string, data?: T): ErrorResponse<T> => {
    if (id === undefined) id = null
    code = Math.floor(code)
    if (Number.isNaN(code)) code = -1
    const x: ErrorResponse<T> = { jsonrpc, id, error: { code, message, data } }
    deleteUndefined(x.error, 'data')
    return x
}
// Pre defined error in section 5.1
// ! side effect
export const ErrorResponseParseError = <T>(e: unknown, mapper: ErrorMapFunction<T>): ErrorResponse<T> => {
    const obj = ErrorResponseMapped({} as any, e, mapper)
    const o = obj.error as Mutable<ErrorResponse['error']>
    o.code = -32700
    o.message = 'Parse error'
    return obj
}

// Not using.
// InvalidParams -32602 'Invalid params'
// InternalError -32603 'Internal error'
export const ErrorResponseInvalidRequest = (id: ID) => ErrorResponse(id, -32600, 'Invalid Request')
export const ErrorResponseMethodNotFound = (id: ID) => ErrorResponse(id, -32601, 'Method not found')

type AsyncCallErrorDetail = {
    stack?: string
    type?: string
}
export const ErrorResponseMapped = <T>(request: Request, e: unknown, mapper: ErrorMapFunction<T>): ErrorResponse<T> => {
    const { id } = request
    const { code, message, data } = mapper(e, request)
    return ErrorResponse(id, code, message, data)
}

export const defaultErrorMapper =
    (stack = '', code = -1): ErrorMapFunction<AsyncCallErrorDetail> =>
    (e) => {
        let message = toString('', () => (e as any).message)
        let type = toString(ERROR, (ctor = (e as any).constructor) => isFunction(ctor) && ctor.name)
        const E = DOMException()
        if (E && e instanceof E) type = DOMExceptionHeader + e.name
        if (isString(e) || typeof e === 'number' || isBoolean(e) || typeof e === 'bigint') {
            type = ERROR
            message = String(e)
        }
        const data: AsyncCallErrorDetail = stack ? { stack, type } : { type }
        return { code, message, data }
    }

/**
 * A JSONRPC response object
 */
export type Response = SuccessResponse | ErrorResponse

export const isJSONRPCObject = (data: any): data is Response | Request => {
    if (!isObject(data)) return false
    if (!hasKey(data, 'jsonrpc')) return false
    if (data.jsonrpc !== jsonrpc) return false
    if (hasKey(data, 'params')) {
        const params = (data as Request).params
        if (!isArray(params) && !isObject(params)) return false
    }
    return true
}

export { isObject } from './constants.js'

export type hasKey = {
    (obj: SuccessResponse | ErrorResponse | Request, key: 'result'): obj is SuccessResponse
    (obj: SuccessResponse | ErrorResponse | Request, key: 'error'): obj is ErrorResponse
    (obj: SuccessResponse | ErrorResponse | Request, key: 'method'): obj is Request
    <T, Q extends string>(obj: T, key: Q): obj is T & {
        [key in Q]: unknown
    }
}
export const hasKey: hasKey = (obj: any, key: any): obj is any => key in obj

const toString = (_default: string, val: () => any) => {
    try {
        const v = val()
        if (v === undefined) return _default
        return String(v)
    } catch {
        return _default
    }
}
const deleteUndefined = <O>(x: O, key: keyof O) => {
    if (x[key] === undefined) delete x[key]
}
const deleteFalsy = <T>(x: T, key: keyof T) => {
    if (!x[key]) delete x[key]
}
type Mutable<T> = { -readonly [key in keyof T]: T[key] }
