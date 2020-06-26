import { normalizeLogOptions, normalizeStrictOptions } from '../src/utils/normalizeOptions'

test('normalize log options', () => {
    expect(normalizeLogOptions(true)).toMatchSnapshot()
    expect(normalizeLogOptions(false)).toMatchSnapshot()
    expect(normalizeLogOptions({ beCalled: true, localError: false })).toMatchSnapshot()
})

test('normalize strict options', () => {
    expect(normalizeStrictOptions(true)).toMatchSnapshot()
    expect(normalizeStrictOptions(false)).toMatchSnapshot()
    expect(normalizeStrictOptions({ methodNotFound: false, unknownMessage: false })).toMatchSnapshot()
    expect(normalizeStrictOptions({ methodNotFound: false, unknownMessage: true })).toMatchSnapshot()
    expect(normalizeStrictOptions({ methodNotFound: true, unknownMessage: false })).toMatchSnapshot()
    expect(normalizeStrictOptions({ methodNotFound: true, unknownMessage: true })).toMatchSnapshot()
    expect(normalizeStrictOptions({ methodNotFound: false })).toMatchSnapshot()
    expect(normalizeStrictOptions({ methodNotFound: true })).toMatchSnapshot()
    expect(normalizeStrictOptions({ unknownMessage: false })).toMatchSnapshot()
    expect(normalizeStrictOptions({ unknownMessage: true })).toMatchSnapshot()
})
