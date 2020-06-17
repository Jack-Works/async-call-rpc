import { normalizeLogOptions, normalizeStrictOptions } from '../src/utils/normalizeOptions'

test('normalize log options', () => {
    expect(normalizeLogOptions(true)).toMatchSnapshot()
    expect(normalizeLogOptions(false)).toMatchSnapshot()
    expect(normalizeLogOptions({ beCalled: true, localError: false })).toMatchSnapshot()
})

test('normalize strict options', () => {
    expect(normalizeStrictOptions(true)).toMatchSnapshot()
    expect(normalizeStrictOptions(false)).toMatchSnapshot()
    expect(normalizeStrictOptions({ noUndefined: true, methodNotFound: false })).toMatchSnapshot()
})
