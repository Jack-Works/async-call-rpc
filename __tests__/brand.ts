import { withSnapshotDefault } from './utils/test'

withSnapshotDefault('AsyncCall should return instance of Promise', 'async-call-result-brand', async (f) => {
    const server = f()
    const q = server.add(0, 1)
    expect(q).toBeInstanceOf(Promise)
    await q
})

withSnapshotDefault(
    'AsyncCall should return instance of Async Generator',
    'async-call-generator-result-brand',
    async (_, f) => {
        const server = f()
        const iter = server.echo([])
        async function* __() {}
        const proto = Object.getPrototypeOf(Object.getPrototypeOf(__()))
        proto.x = 1
        expect((iter as any).x).toBe(1)
    },
)
