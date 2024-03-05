import { globalDOMException as DOMException, DOMExceptionHeader } from './error.ts'
import type { ErrorMapFunction } from '../Async-Call.ts'
import { ERROR, isArray, isFunction, isObject, undefined } from './constants.ts'
import type { Request, SuccessResponse, ErrorResponse, ID, Response } from '../types.ts'

export const jsonrpc = '2.0'
export const makeRequest = (
    id: ID,
    method: string,
    params: readonly unknown[] | object,
    remoteStack?: string,
): Request => {
    const x: Request = { jsonrpc, id, method, params, remoteStack }
    deleteUndefined(x, 'id')
    deleteFalsy(x, 'remoteStack')
    return x
}
export const makeSuccessResponse = (id: ID, result: unknown): SuccessResponse => {
    const x: SuccessResponse = { jsonrpc, id, result }
    deleteUndefined(x, 'id')
    return x
}
export const makeErrorResponse = <T>(id: ID, code: number, message: string, data?: T): ErrorResponse<T> => {
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
export const ErrorResponseInvalidRequest = (id: ID) => makeErrorResponse(id, -32600, 'Invalid Request')
export const ErrorResponseMethodNotFound = (id: ID) => makeErrorResponse(id, -32601, 'Method not found')

type AsyncCallErrorDetail = {
    stack?: string
    type?: string
}
export const ErrorResponseMapped = <T>(request: Request, e: unknown, mapper: ErrorMapFunction<T>): ErrorResponse<T> => {
    const { id } = request
    const { code, message, data } = mapper(e, request)
    return makeErrorResponse(id, code, message, data)
}

export const defaultErrorMapper =
    (stack = '', code = -1): ErrorMapFunction<AsyncCallErrorDetail> =>
    (e) => {
        let message = toString('', () => (e as any).message)
        let type = toString(ERROR, (ctor = (e as any).constructor) => isFunction(ctor) && ctor.name)
        const E = DOMException()
        if (E && e instanceof E) type = DOMExceptionHeader + e.name
        const eType = typeof e
        if (eType == 'string' || eType === 'number' || eType == 'boolean' || eType == 'bigint') {
            type = ERROR
            message = String(e)
        }
        const data: AsyncCallErrorDetail = stack ? { stack, type } : { type }
        return { code, message, data }
    }

export const isJSONRPCObject = (data: any): data is Response | Request => {
    if (!isObject(data)) return false
    if (!('jsonrpc' in data)) return false
    if (data.jsonrpc !== jsonrpc) return false
    if ('params' in data) {
        const params = data.params
        if (!isArray(params) && !isObject(params)) return false
    }
    return true
}

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
