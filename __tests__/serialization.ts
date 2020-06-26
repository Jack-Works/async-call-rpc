import { NoSerialization, JSONSerialization } from '../src/utils/serialization'
import { SuccessResponse } from '../src/utils/jsonrpc'

test('NoSerialization', () => {
    const x = Symbol()
    expect(NoSerialization.serialization(x)).toBe(x)
    expect(NoSerialization.deserialization(x)).toBe(x)
})

test('JSONSerialization', () => {
    const y = { rand: 123, y: true, z: undefined }
    const json = JSONSerialization()
    const result = json.serialization(y)
    expect(result).toMatchSnapshot()
    expect(json.deserialization(result)).not.toStrictEqual(y)
    delete y.z
    expect(json.deserialization(result)).toStrictEqual(y)
})

test('JSONSerialization undefined special handling', () => {
    const y = SuccessResponse(1, undefined)
    const test = (behavior: Parameters<typeof JSONSerialization>[2]) => {
        const json = JSONSerialization(undefined, undefined, behavior)
        const s = json.serialization(y)
        expect(s).toMatchSnapshot(String(behavior))
        expect(json.deserialization(s)).toMatchSnapshot(String(behavior))
    }
    test(undefined)
    test(false)
    test('keep')
    test('null')
})

test('JSONSerialization with replacer', () => {
    const y = { foundation: 'Mozilla', model: 'box', week: 45, transport: 'car', month: 7 }
    const json = JSONSerialization([replacer, (key, value) => (typeof value === 'number' ? value * 2 : value)], 4)
    const result = json.serialization(y)
    expect(result).toMatchSnapshot()
    expect(json.deserialization(result)).not.toStrictEqual(y)
    expect(json.deserialization(result)).toMatchSnapshot()
})

function replacer(key: any, value: any) {
    if (typeof value === 'string') {
        return undefined
    }
    return value
}
