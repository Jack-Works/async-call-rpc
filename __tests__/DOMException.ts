import { reproduceDOMException, reproduceError } from './utils/reproduce'
import { delay, withSnapshotDefault } from './utils/test'

withSnapshotDefault('DOMException', 'DOMException', async (f) => {
    await reproduceDOMException(false, async () => {
        const server = f()
        const promise = server.DOMException()
        await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"message"`)
        await expect(promise).rejects.toBeInstanceOf(DOMException)
    })
})

withSnapshotDefault('Recover Error with bad implementation', 'recover-error-with-bad-implementation', async (f) => {
    await reproduceError(() =>
        reproduceDOMException(true, async () => {
            const server = f()
            const promise = server.DOMException()
            await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"message"`)
        }),
    )
})
