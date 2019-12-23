# Async Call

See the document at [./docs/async-call-rpc.md](./docs/async-call-rpc.md)

## Playground

```js
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
import('https://unpkg.com/async-call-rpc@latest/out/index.js?module').then(x => {
    Object.assign(globalThis, x)
    console.log('AsyncCall, AsyncGeneratorCall, JSONSerialization, NoSerialization is available in globalThis.')
    console.log('Try to run: await server.add(42, 0)')
    // server code
    AsyncCall(
        {
            async add(a, b) {
                await sleep(1000)
                return a + b
            },
        },
        { messageChannel: new PlayGroundChannel('server'), key: 'my-app' },
    )
    // client code
    globalThis.server = AsyncCall({}, { messageChannel: new PlayGroundChannel('client'), key: 'my-app' })
})

class PlayGroundChannel {
    static server = document.createElement('a')
    static client = document.createElement('a')
    // actor: 'server' | 'client'
    constructor(actor) {
        this.actor = actor
        PlayGroundChannel[actor].addEventListener('targetEventChannel', e => {
            const detail = e.detail
            for (const f of this.listener) {
                try {
                    f(detail)
                } catch {}
            }
        })
    }
    listener = []
    on(_, cb) {
        this.listener.push(cb)
    }
    emit(_, data) {
        PlayGroundChannel[this.actor === 'client' ? 'server' : 'client'].dispatchEvent(
            new CustomEvent('targetEventChannel', { detail: data }),
        )
    }
}
```
