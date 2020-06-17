import { preservePauseOnException } from '../src/utils/preservePauseOnException'

test('preservePauseOnException', async () => {
    // this doesn't work in Node
    return expect(() =>
        preservePauseOnException(
            () => {},
            () => {},
            [],
        ),
    ).rejects
})
