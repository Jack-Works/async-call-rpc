import { reproduceDOMException, reproduceError } from './utils/reproduce.js'
import { withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'able to serialize DOMException',
    withSnapshotDefault('DOMException', async (f) => {
        await reproduceDOMException(false, async () => {
            const server = f()
            const promise: Promise<never> = server.DOMException()
            try {
                await promise
                expect.fail('this request should not success')
            } catch (error: any) {
                if (!(error instanceof DOMException)) expect.fail('should be an instance of DOMException')
                expect(error.message).toMatchInlineSnapshot('"message"')
                expect(error.name).toMatchInlineSnapshot('"name"')
            }
        })
    }),
)

it(
    'able to recover from Error constructor with a bad implementation',
    withSnapshotDefault('recover-error-with-bad-implementation', async (f) => {
        await reproduceError(() =>
            reproduceDOMException(true, async () => {
                const server = f()
                const promise = server.DOMException()
                await expect(promise).rejects.toThrowError()
            }),
        )
    }),
)
