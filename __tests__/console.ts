import { getConsole } from '../src/utils/console'

test('default console', () => {
    const _ = getConsole()
    expect(_.debug).toBe(console.debug)
    expect(_.error).toBe(console.error)
    expect(_.groupCollapsed).toBe(console.groupCollapsed)
    expect(_.groupEnd).toBe(console.groupEnd)
    expect(_.log).toBe(console.log)
})

test('no console', () => {
    const old = console
    delete globalThis.console
    expect(() => getConsole().log()).toThrow()
    globalThis.console = old
})

test('custom console', () => {
    const num = Math.random()
    let called: unknown = 0
    getConsole({ log: (x) => (called = x) }).log(num)
    expect(called).toBe(num)
})
