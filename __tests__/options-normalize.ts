import { normalizeLogOptions, normalizeStrictOptions } from '../src/utils/normalizeOptions'

test('normalizeLogOptions should be normalized as the following snapshot', () => {
    expect(normalizeLogOptions(true)).toMatchInlineSnapshot(`
        Array [
          true,
          true,
          true,
          true,
        ]
    `)
    expect(normalizeLogOptions(false)).toMatchInlineSnapshot(`Array []`)
    expect(normalizeLogOptions('all')).toMatchInlineSnapshot(`
        Array [
          true,
          true,
          true,
          true,
          true,
          true,
        ]
    `)
    expect(normalizeLogOptions({ type: 'basic' })).toMatchInlineSnapshot(`
        Array [
          true,
          true,
          true,
          false,
          undefined,
          undefined,
        ]
    `)
    expect(normalizeLogOptions({ beCalled: false })).toMatchInlineSnapshot(`
        Array [
          false,
          true,
          true,
          true,
          undefined,
          undefined,
        ]
    `)
})

test('normalizeLogOptions should be normalized as the following snapshot', () => {
    expect(normalizeStrictOptions(true)).toMatchInlineSnapshot(`
        Array [
          true,
          true,
        ]
    `)
    expect(normalizeStrictOptions(false)).toMatchInlineSnapshot(`
        Array [
          false,
          false,
        ]
    `)
    expect(normalizeStrictOptions({ methodNotFound: false })).toMatchInlineSnapshot(`
        Array [
          false,
          undefined,
        ]
    `)
})
