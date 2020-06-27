import { DOMException, DOMExceptionHeader } from './error'
import { ErrorMapFunction } from '../Async-Call'

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

export function Request(id: ID, method: string, params: readonly unknown[] | object, remoteStack?: string): Request {
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
export function SuccessResponse(id: ID, result: unknown): SuccessResponse {
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

export function ErrorResponse<T>(id: ID, code: number, message: string, data?: T): ErrorResponse<T> {
    if (id === undefined) id = null
    code = Math.floor(code)
    if (Number.isNaN(code)) code = -1
    const x: ErrorResponse<T> = { jsonrpc, id, error: { code, message, data } }
    deleteUndefined(x.error, 'data')
    return x
}
// Pre defined error in section 5.1
ErrorResponse.ParseError = <T>(e: unknown, mapper: ErrorMapFunction<T>): ErrorResponse<T> => {
    const obj = ErrorResponseMapped({} as any, e, mapper)
    const o = obj.error as Mutable<ErrorResponse['error']>
    o.code = -32700
    o.message = 'Parse error'
    return obj
}

// Not using.
// InvalidParams -32602 'Invalid params'
// InternalError -32603 'Internal error'
ErrorResponse.InvalidRequest = (id: ID) => ErrorResponse(id, -32600, 'Invalid Request')
ErrorResponse.MethodNotFound = (id: ID) => ErrorResponse(id, -32601, 'Method not found')

type AsyncCallErrorDetail = {
    stack?: string
    type?: string
}
export function ErrorResponseMapped<T>(request: Request, e: unknown, mapper: ErrorMapFunction<T>): ErrorResponse<T> {
    const { id } = request
    const { code, message, data } = mapper(e, request)
    return ErrorResponse(id, code, message, data)
}

export const defaultErrorMapper = (stack = '', code = -1): ErrorMapFunction<AsyncCallErrorDetail> => (e) => {
    let message = ''
    if (isObject(e) && hasKey(e, 'message') && typeof e.message === 'string') message = e.message
    let type = toString('Error', () => (e as any)?.constructor?.name)
    if (DOMException && e instanceof DOMException) type = DOMExceptionHeader + e.name
    if (typeof e === 'string' || typeof e === 'number' || typeof e === 'boolean' || typeof e === 'bigint') {
        type = 'Error'
        message = String(e)
    }
    const data: AsyncCallErrorDetail = stack ? { stack, type } : { type }
    return { code, message, data }
}

/**
 * A JSONRPC response object
 */
export type Response = SuccessResponse | ErrorResponse

export function isJSONRPCObject(data: any): data is Response | Request {
    if (!isObject(data)) return false
    if (!hasKey(data, 'jsonrpc')) return false
    if (data.jsonrpc !== jsonrpc) return false
    if (hasKey(data, 'params')) {
        const params = (data as Request).params
        if (!Array.isArray(params) && !isObject(params)) return false
    }
    return true
}

export function isObject(params: any): params is object {
    return typeof params === 'object' && params !== null
}

export function hasKey<T, Q extends string>(
    obj: T,
    key: Q,
): obj is T &
    {
        [key in Q]: unknown
    } {
    return key in obj
}

function toString(def: string, val: () => any) {
    let str = def
    try {
        str = val()
    } catch {}
    if (typeof str !== 'string') return def
    return str
}
function deleteUndefined<O>(x: O, key: keyof O) {
    if (x[key] === undefined) delete x[key]
}
function deleteFalsy<T>(x: T, key: keyof T) {
    if (!x[key]) delete x[key]
}
type Mutable<T> = { -readonly [key in keyof T]: T[key] }
