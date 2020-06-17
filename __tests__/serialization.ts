import { NoSerialization, JSONSerialization } from '../src/utils/serialization'

test('NoSerialization', () => {
    const x = Symbol()
    expect(NoSerialization.serialization(x)).toBe(x)
    expect(NoSerialization.deserialization(x)).toBe(x)
})

test('JSONSerialization', () => {
    const y = { rand: 123, y: true, z: undefined }
    const json = JSONSerialization()
    const result = json.serialization(y)
    expect(result).toMatchInlineSnapshot(`"{\\"rand\\":123,\\"y\\":true}"`)
    expect(json.deserialization(result)).not.toStrictEqual(y)
    delete y.z
    expect(json.deserialization(result)).toStrictEqual(y)
})

test('JSONSerialization with replacer', () => {
    const y = { foundation: 'Mozilla', model: 'box', week: 45, transport: 'car', month: 7 }
    const json = JSONSerialization([replacer, (key, value) => (typeof value === 'number' ? value * 2 : value)], 4)
    const result = json.serialization(y)
    expect(result).toMatchInlineSnapshot(`
        "{
            \\"week\\": 45,
            \\"month\\": 7
        }"
    `)
    expect(json.deserialization(result)).not.toStrictEqual(y)
    expect(json.deserialization(result)).toMatchInlineSnapshot(`
        Object {
          "month": 14,
          "week": 90,
        }
    `)
})

function replacer(key: any, value: any) {
    if (typeof value === 'string') {
        return undefined
    }
    return value
}
