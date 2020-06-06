# Async Call

See the document at [./docs/async-call-rpc.md](https://jack-works.github.io/async-call/async-call-rpc.html)

-   This package ships ES2018 syntax (leave async function untransformed).

-   Runtime requirement: At least ECMAScript 6, `globalThis`, well known Symbol `Symbol.asyncIterator` if you use Async Call remote generator function support.

## Entry

There are two entry, `base` or `full`. The `full` version support a private JSON RPC extension (The remote ECMAScript async generator `AsyncGeneratorCall`).

### Browser / Deno

```js
import * as full from 'https://unpkg.com/async-call-rpc@latest/out/full.mjs'
import * as base from 'https://unpkg.com/async-call-rpc@latest/out/base.mjs'
```

### Browser (UMD)

Please checkout https://www.jsdelivr.com/package/npm/async-call-rpc?path=out

### Node:

```js
// Full version
require('async-rpc-call') // or
import * as RPC from 'async-rpc-call'

// Base version
require('async-rpc-call/base') // or
import * as RPC from 'async-rpc-call/base'
```

## Playground

```js
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
import('https://unpkg.com/async-call-rpc').then((x) => {
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
        PlayGroundChannel[actor].addEventListener('targetEventChannel', (e) => {
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
