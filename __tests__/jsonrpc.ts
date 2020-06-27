import {
    Request,
    SuccessResponse,
    ErrorResponse,
    hasKey,
    isJSONRPCObject,
    isObject,
    ErrorResponseMapped,
} from '../src/utils/jsonrpc'
test('Request', () => {
    expect(Request('id', 'method', ['param1', 'param2'], 'stack')).toMatchSnapshot('req1')
    expect(Request('id2', 'method', { param1: 'abc', param2: 'def' }, 'stack')).toMatchSnapshot('req2')
})

test('SuccessResponse', () => {
    expect(SuccessResponse('id2', undefined)).toMatchSnapshot('undefined')
    expect(SuccessResponse('id3', { data: 'result' })).toMatchSnapshot('success')
})

test('ErrorResponse', () => {
    expect(ErrorResponse('id2', -123, 'message', { _data_: 1 })).toMatchSnapshot('normal error')
    expect(ErrorResponse('id2', -123.456, 'message')).toMatchSnapshot('invalid code')
    expect(ErrorResponse(undefined, 0, '')).toMatchSnapshot()
    expect(ErrorResponse('', -0, '')).toMatchSnapshot()
    expect(ErrorResponse('', NaN, '')).toMatchSnapshot()
    expect(ErrorResponse.InvalidRequest('id')).toMatchSnapshot('invalid req')
    expect(ErrorResponse.MethodNotFound('id')).toMatchSnapshot('method not found')
    expect(
        ErrorResponse.ParseError(new Error(), () => ({
            code: 2345,
            message: 'My message',
            data: { my_data: true },
        })),
    ).toMatchSnapshot('parse error')
})

test('hasKey', () => {
    expect(hasKey({ a: 1 }, 'a')).toBe(true)
    expect(hasKey({ a: 1 }, 'b')).toBe(false)
})

test('isJSONRPCObject', () => {
    expect(isJSONRPCObject(Request('id', '', [], ''))).toBe(true)
    expect(isJSONRPCObject(SuccessResponse('id', undefined))).toBe(true)
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
