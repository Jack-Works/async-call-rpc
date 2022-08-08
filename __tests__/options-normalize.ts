import { normalizeLogOptions, normalizeStrictOptions } from '../src/utils/normalizeOptions.js'
import { expect, it } from 'vitest'

it('should normalize log options', () => {
    expect(normalizeLogOptions(true)).toMatchInlineSnapshot(`
      [
        true,
        true,
        true,
        true,
      ]
    `)
    expect(normalizeLogOptions(false)).toMatchInlineSnapshot('[]')
    expect(normalizeLogOptions('all')).toMatchInlineSnapshot(`
      [
        true,
        true,
        true,
        true,
        true,
        true,
      ]
    `)
    expect(normalizeLogOptions({ type: 'basic' })).toMatchInlineSnapshot(`
      [
        true,
        true,
        true,
        false,
        undefined,
        undefined,
      ]
    `)
    expect(normalizeLogOptions({ beCalled: false })).toMatchInlineSnapshot(`
      [
        false,
        true,
        true,
        true,
        undefined,
        undefined,
      ]
    `)
})

it('should normalize strict options', () => {
    expect(normalizeStrictOptions(true)).toMatchInlineSnapshot(`
      [
        true,
        true,
      ]
    `)
    expect(normalizeStrictOptions(false)).toMatchInlineSnapshot(`
      [
        false,
        false,
      ]
    `)
    expect(normalizeStrictOptions({ methodNotFound: false })).toMatchInlineSnapshot(`
      [
        false,
        undefined,
      ]
    `)
})
