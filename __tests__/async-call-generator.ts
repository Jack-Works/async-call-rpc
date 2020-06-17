import { createGeneratorServer } from './shared'

test('Async Generator Call', async () => {
    const server = createGeneratorServer()
    let i = 0
    const number = [1, 2]
    for await (const x of server.gen(...number)) i += x
    expect(i).toBe(3)
})
