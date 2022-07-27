import { withSnapshotDefault } from './utils/test'

withSnapshotDefault('AsyncCall brand check', 'async-call-brand', async (f) => {
    const server = f()

    // Prototype check
    expect(Object.getPrototypeOf(server)).toBeNull()
    Reflect.setPrototypeOf(server, {})
    expect(Object.getPrototypeOf(server)).toBeNull()

    // Method equality check
    expect(server.add).toBe(server.add)

    // Method name check
    expect(server.add.name).toBe('add')

    // Result check
    const q = server.add(0, 1)
    expect(q).toBeInstanceOf(Promise)
    await q
})

withSnapshotDefault('AsyncGeneratorCall brand check', 'async-call-generator-brand', async (_, f) => {
    const server = f()

    // Prototype check
    expect(Object.getPrototypeOf(server)).toBeNull()
    Reflect.setPrototypeOf(server, {})
    expect(Object.getPrototypeOf(server)).toBeNull()

    // Method equality check
    expect(server.echo).toBe(server.echo)

    // Method name check
    expect(server.echo.name).toBe('echo')

    // Result check
    const iter = server.echo([])
    async function* __() {}
    const proto = Object.getPrototypeOf(Object.getPrototypeOf(__()))
    const testSymbol = Symbol('test')
    Object.defineProperty(proto, testSymbol, { configurable: true, value: 1 })
    expect(Reflect.get(iter, testSymbol)).toBe(1)
    Reflect.deleteProperty(proto, testSymbol)
})
