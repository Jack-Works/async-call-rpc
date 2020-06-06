# Async Call

See the document at [./docs/async-call-rpc.md](https://jack-works.github.io/async-call/async-call-rpc.html), [or the playground](https://jack-works.github.io/async-call/)

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
