import { preservePauseOnException } from '../src/utils/preservePauseOnException'

test('preservePauseOnException', async () => {
    let msg = ''
    console.error = (e: string) => (msg = e)
    await expect(
        preservePauseOnException(
            () => {},
            async () => 1,
            undefined,
            [],
        ),
    ).resolves.toBe(1)
    expect(msg).toMatchInlineSnapshot(`"Please close preservePauseOnException."`)
})
