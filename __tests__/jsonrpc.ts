import { Request, SuccessResponse, ErrorResponse, hasKey, isJSONRPCObject, isObject } from '../src/utils/jsonrpc'
test('Request', () => {
    expect(Request('id', 'method', ['param1', 'param2'], 'stack')).toMatchSnapshot('req1')
    expect(Request('id2', 'method', { param1: 'abc', param2: 'def' }, 'stack')).toMatchSnapshot('req2')
})

test('SuccessResponse', () => {
    expect(SuccessResponse('id', undefined, false)).toMatchSnapshot('undefined-keeping')
    expect(SuccessResponse('id2', undefined, true)).toMatchSnapshot('undefined-dropping')
    expect(SuccessResponse('id3', { data: 'result' }, false)).toMatchSnapshot('success')
})

test('ErrorResponse', () => {
    const err = new Error()
    err.stack = 'stack'
    expect(ErrorResponse('id2', -123, 'message', 'stack', err)).toMatchSnapshot('normal error')
    expect(ErrorResponse('id', 123, 'message', 'stack', '')).toMatchSnapshot('invalid error object')
    expect(ErrorResponse('id2', -123.456, 'message', 'stack', { stack: 'item' })).toMatchSnapshot('invalid code')
    expect(ErrorResponse(undefined, 0, '', '')).toMatchSnapshot()
    expect(ErrorResponse('', -0, '', '')).toMatchSnapshot()
    expect(ErrorResponse('', NaN, '', '')).toMatchSnapshot()
    expect(ErrorResponse.InternalError('id', 'msg')).toMatchSnapshot('internal error')
    expect(ErrorResponse.InvalidParams('id')).toMatchSnapshot('invalid params')
    expect(ErrorResponse.InvalidRequest('id')).toMatchSnapshot('invalid req')
    expect(ErrorResponse.MethodNotFound('id')).toMatchSnapshot('method not found')
    expect(ErrorResponse.ParseError('stack')).toMatchSnapshot('parse error')
})

test('hasKey', () => {
    expect(hasKey({ a: 1 }, 'a')).toBe(true)
    expect(hasKey({ a: 1 }, 'b')).toBe(false)
})

test('isJSONRPCObject', () => {
    expect(isJSONRPCObject(Request('id', '', [], ''))).toBe(true)
    expect(isJSONRPCObject(SuccessResponse('id', undefined, false))).toBe(true)
    expect(isJSONRPCObject(ErrorResponse('id', 0, 'msg', 'stack'))).toBe(true)
    expect(isJSONRPCObject({})).toBe(false)
    expect(isJSONRPCObject(undefined)).toBe(false)
    expect(isJSONRPCObject({ jsonrpc: '1.0' })).toBe(false)
    expect(isJSONRPCObject({ jsonrpc: '2.0', params: 1 })).toBe(false)
})

test('isObject', () => {
    expect(isObject('')).toBeFalsy()
    expect(isObject({})).toBeTruthy()
    expect(isObject(null)).toBeFalsy()
})
