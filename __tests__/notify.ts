import { notify } from '../src/index.js'
import { withSnapshotDefault } from './utils/test.js'
import { expect, it } from 'vitest'

it(
    'can send notify-only request',
    withSnapshotDefault('async-call-notify', async ({ init, log }) => {
        const orig_s = init()
        const server = notify(orig_s)
        log(
            'Before this line should have no response.',
            'Even throwing functions should succeed too.',
            'No response should be sent from the server.',
        )
        await expect(server.add(2, 3)).resolves.toBeUndefined()
        await expect(server.throws()).resolves.toBeUndefined()
        await expect((server as any).not_found()).resolves.toBeUndefined()

        // Should also works for the function on the instance
        await expect(notify(server.echo)(1)).resolves.toBeUndefined()
        await expect(notify(orig_s.throws)()).resolves.toBeUndefined()

        // Keep identity
        expect(server.add).toBe(server.add)
    }),
)
