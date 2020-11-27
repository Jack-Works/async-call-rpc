import { withSnapshotDefault } from './utils/test'

withSnapshotDefault('basic use case of Async Call should work', 'async-call-basic', async (call) => {
    const server = call()
    // Method calls
    await Promise.all([
        expect(server.add(1, 2)).resolves.toMatchInlineSnapshot(`3`),
        expect(server.echo('string')).resolves.toMatchInlineSnapshot(`"string"`),
        expect(server.throws()).rejects.toThrowErrorMatchingInlineSnapshot(`"impl error"`),
        // Unknown methods
        expect((server as any).not_found()).rejects.toThrowErrorMatchingInlineSnapshot(`"Method not found"`),
        // Keep this reference
        expect(server.withThisRef()).resolves.toMatchInlineSnapshot(`3`),
    ])

    // Keep identity
    expect(server.add).toBe(server.add)
})
