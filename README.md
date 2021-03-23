# Async Call

`async-call-rpc` is a [JSON RPC](https://www.jsonrpc.org/specification) server and client written in TypeScript for any ES6+ environment.

[![Code coverage](https://codecov.io/gh/Jack-Works/async-call-rpc/branch/master/graph/badge.svg)](https://codecov.io/gh/Jack-Works/async-call-rpc)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Jack-Works/async-call-rpc/build)](https://github.com/Jack-Works/async-call-rpc/actions)
[![npm](https://img.shields.io/npm/v/async-call-rpc)](https://npmjs.org/async-call-rpc)
![ES2015+](https://img.shields.io/badge/ECMAScript-2015%2B-brightgreen)

## Links

[CHANGELOG.md](./CHANGELOG.md) | [Document of AsyncCall](https://jack-works.github.io/async-call-rpc/async-call-rpc.asynccall.html) | [Document of AsyncGeneratorCall](https://jack-works.github.io/async-call-rpc/async-call-rpc.asyncgeneratorcall.html) | [Playground](https://jack-works.github.io/async-call-rpc/)

Chapters:

-   [The first concept: `channel`](#the-first-concept-messagechannel)
-   [Example](#example)
-   [Notifications and Batch requests](#notifications-and-batch-requests)
-   [Installation](#installation)
-   [Entries](#entries)
-   [Utils available if both server and client are created by this library](#utils-available-if-both-server-and-client-are-created-by-this-library)
-   [Builtin `channels` (including WebSocket)](#builtin-channels)
-   [Implemented JSON RPC internal methods](#implemented-json-rpc-internal-methods)
-   [Non-standard extension to JSON RPC specification](#non-standard-extension-to-json-rpc-specification)

## Features

-   Zero dependencies!
-   Running in any ES6+ environment (+`globalThis`), no requirement on any Web or Node API
-   Simple to define a server and simple to use as a client
-   Full TypeScript support
-   Support custom serializer to pass complex data types
-   Support async generator (Require both server and client supports 4 JSON RPC internal methods, and `Symbol.asyncIterator`, `(async function* () {}).constructor.prototype` available)

## Cautions

-   NOT support ECMAScript 5 (ES6 `Proxy` is the core of this library)
-   This package is shipping ECMAScript 2018 syntax (including `async function`).
-   The async generator mode might leak memory on the server. Use it by your caution.
-   NOT support JSON RPC 1.0

## The first concept: `channel`

<a id="channel"></a>

The `channel` is the only thing you need to learn to use this library.

This library is designed to not rely on any specific platform. Only require things defined in the ECMAScript specification.
In the ES spec, there is no I/O related API so it's impossible to communicate with the outer world.

You need to implement one of the following interfaces:

-   [CallbackBasedChannel](https://jack-works.github.io/async-call-rpc/async-call-rpc.callbackbasedchannel.html), generally used in the server. [Example](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/websocket.client.ts).
-   [EventBasedChannel](https://jack-works.github.io/async-call-rpc/async-call-rpc.eventbasedchannel.html), generally used in the client. [Example](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/websocket.server.ts)

There are some [built-in channel](#builtin-channels) you can simplify the usage.

The following document will assume you have defined your `channel`.

## Example

### Server example

```ts
// server.ts
export function add(x: number, y: number) {
    return x + y
}
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// init.ts
import { AsyncCall } from 'async-call-rpc'
import * as server from './server'
// create a server
AsyncCall(server, { channel })
```

### Client example

```ts
import { AsyncCall } from 'async-call-rpc'
const server = AsyncCall<typeof server>({}, { channel })
server.add(2, 40).then(console.log) // 42
```

### Isomorphic API

You can notice from the above example,
define a server is using `AsyncCall(serverImplementation, opt)`,
define a client is using `AsyncCall<typeof serverImplementation>({}, opt)`.
So it is possible to define a server and a client at the same time.

## Notifications and Batch requests

AsyncCall can send [Notifications](https://www.jsonrpc.org/specification#notification).

Using notifications means results or remote errors will be dropped. Local errors won't be omitted, e.g. serializer error or network error.

```ts
import { AsyncCall, notify } from 'async-call-rpc'
const server = notify(AsyncCall<typeof server>({}, { channel }))
server.online().then(console.log) // undefined
```

AsyncCall can send [batch request](https://www.jsonrpc.org/specification#batch) too.

```ts
import { AsyncCall, batch } from 'async-call-rpc'
const [server, emit, drop] = batch(AsyncCall<typeof server>({}, { channel }))
const a = server.req1() // pending
const b = server.req2() // pending
const c = server.req3() // pending
emit() // to send all pending requests
// request a, b, c sent

const d = server.req1() // pending
drop() // to drop all pending requests (and corresponding Promises)
// d rejected
```

## Installation

### Install through npm

> npm i async-call-rpc

> yarn add async-call-rpc

### Import from browser or Deno

You can access https://www.jsdelivr.com/package/npm/async-call-rpc?path=out to get the latest URL and SRI.

(Supports type definition for deno out-of-box!)

```js
import { AsyncCall } from 'https://cdn.jsdelivr.net/npm/async-call-rpc@latest/out/base.mjs'
```

### UMD

```html
<script src="https://cdn.jsdelivr.net/npm/async-call-rpc@2.0.1/out/base.js"></script>
<script>
    const { AsyncCall } = globalThis.AsyncCall
</script>
```

### In other JS environment

Load the `out/base.mjs` (ES Module) or `out/base.js` (UMD, CommonJS or AMD) to your project.

## Entries

This library has 2 entry. `base` and `full`. `base` is the default entry point. The `full` version includes the `AsyncGeneratorCall` but the base version doesn't.

### Browser / Deno

Please check out https://www.jsdelivr.com/package/npm/async-call-rpc?path=out

### Node:

```js
// Full version
require('async-rpc-call/full') // or
import * as RPC from 'async-rpc-call/full'

// Base version
require('async-rpc-call/base') // or
import * as RPC from 'async-rpc-call/base'
```

## Builtin channels

They're not part of the core library but provided as utils to increase usability.

### (Node) WebSocket

|                  | Server                                                                                                                                                            | Client                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Entry point      | `async-call-rpc/utils/node/websocket.server.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/websocket.server.ts) | TBD                        |
| Entry point type | CommonJS                                                                                                                                                          | CommonJS                   |
| Dependencies     | [ws](https://npmjs.com/ws)                                                                                                                                        | [ws](https://npmjs.com/ws) |
| Example          | [./examples/node.websocket.server.js](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/node.websocket.server.js)                                 | TBD                        |

### (Deno) WebSocket

|                  | Server                                                                                                                                                                                            | Client    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/deno/websocket.server.ts`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils/deno/websocket.server.ts) | TBD       |
| Entry point type | ES Module                                                                                                                                                                                         | ES Module |
| Dependencies     | Deno std                                                                                                                                                                                          | Deno std  |
| Example          | [./examples/deno.websocket.server.ts](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/deno.websocket.server.ts)                                                                 | TBD       |

### (Web) WebSocket

|                  | Client                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/websocket.client.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/websocket.client.ts) |
| Entry point type | ES Module                                                                                                                                                                                           |
| Dependencies     | Nothing                                                                                                                                                                                             |
| Example          | [./examples/browser.websocket.client.js](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/browser.websocket.client.js)                                                             |

### (Web) [BroadcastChannel](https://mdn.io/BroadcastChannel)

> ⚠️ Broadcast Channel is not supported by Safari yet ⚠️

|                  | Server & Client                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/broadcast.channel.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/broadcast.channel.ts) |
| Entry point type | ES Module                                                                                                                                                                                             |
| Dependencies     | Nothing                                                                                                                                                                                               |
| Example          | TBD                                                                                                                                                                                                   |

### (Web) [Worker](https://mdn.io/Worker)

> ⚠️ Import a ES Module in a Web Worker is only supported by Chrome yet! ⚠️

|                  | Host & Worker                                                                                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/worker.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/worker.ts)                                                                                                            |
| Entry point type | ES Module                                                                                                                                                                                                                                                                                  |
| Dependencies     | Nothing                                                                                                                                                                                                                                                                                    |
| Example          | Main frame: [./examples/browser.worker-main.js](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/browser.worker-main.js) <br /> Worker: [./examples/browser.worker-worker.js](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/browser.worker-worker.js) |

Main frame: `new WorkerChannel(new Worker(...))`

Worker: `new WorkerChannel()`

## Builtin serializers

### (Web, Deno and Node) BSON

|                          | Server                                                                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point Node         | `async-call-rpc/utils/node/bson.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/bson.ts)                                   |
| Entry point Browser/Deno | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/bson.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/bson.ts) |
| Dependencies             | [bson](https://npmjs.com/bson)                                                                                                                                              |

### (Web, Deno and Node) Msgpack

|                          | Server                                                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point Node         | `async-call-rpc/utils/node/msgpack.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/node/msgpack.ts)                                   |
| Entry point Browser/Deno | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/msgpack.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/master/utils-src/web/msgpack.ts) |
| Dependencies             | [@msgpack/msgpack](https://npmjs.com/@msgpack/msgpack)                                                                                                                                                    |
| Example (Node)           | [./examples/node.websocket.server.js](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/node.websocket.server.js)                                                 |
| Example (Deno)           | [./examples/deno.websocket.server.ts](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/deno.websocket.server.ts)                                                 |
| Example (Web)            | [./examples/browser.websocket.client.js](https://github.com/Jack-Works/async-call-rpc/blob/master/examples/browser.websocket.client.js)                                           |

## Utils available if both server and client are created by this library

AsyncCall has some non-standard extensions to the JSON RPC specification that can help the library easier to use. Those features aren't enabled by default.

-   Send call stack of Error response or send call stack of caller's request. See [remoteStack on Request object](#remotestack-on-request-object)
-   Try to keep the "undefined" result when using JSONSerialization. See ["undef" on response object](#undef-on-response-object)

## Implemented JSON RPC internal methods

These four methods are used to implement `AsyncGeneratorCall` support.

```ts
interface JSONRPC_Internal_Methods {
    // These 4 methods represent the Async Iterator protocol in ECMAScript
    // this method starts an async iterator, return the id
    'rpc.async-iterator.start'(method: string, params: unknown[]): Promise<string>
    // this method executes `next` method on the previous iterator started by `rpc.async-iterator.start`
    'rpc.async-iterator.next'(id: string, value: unknown): Promise<IteratorResult<unknown>>
    // this method executes `return` method on the previous iterator started by `rpc.async-iterator.start`
    'rpc.async-iterator.return'(id: string, value: unknown): Promise<IteratorResult<unknown>>
    // this method executes `throw` method on the previous iterator started by `rpc.async-iterator.start`
    'rpc.async-iterator.throw'(id: string, value: unknown): Promise<IteratorResult<unknown>>
}
```

## Non-standard extension to JSON RPC specification

### remoteStack on Request object

This library can send the client the call stack to the server to make the logger better.

Controlled by [`option.log.sendLocalStack`](https://jack-works.github.io/async-call-rpc/async-call-rpc.asynccallloglevel.sendlocalstack.html). Default to `false`.

```ts
interface JSONRPC_Request_object {
    // This property include the caller's stack.
    remoteStack?: string
}
```

### "undef" on Response object

This is a non-standard property appears when using JSONSerialization due to JSON doesn't support `undefined`. It's a hint to the client, that the result is `undefined`.

This behavior is controlled by the 3rd parameter of [JSONSerialization(replacerAndReceiver?, space?, undefinedKeepingBehavior?: false | "keep" | "null" = "null")](https://jack-works.github.io/async-call-rpc/async-call-rpc.jsonserialization.html). Default to `"null"`. To turn on this feature to "keep" undefined values, change the 3rd option to "keep".

```ts
interface JSONRPC_Response_object {
    // This property is a hint.
    // If the client is run in JavaScript, it should treat "result: null" as "result: undefined"
    undef?: boolean
}
```

### The implementation-defined Error data

In the JSON RPC specification, this is implementation-defined. This is controlled by the option [`options.mapError`](https://jack-works.github.io/async-call-rpc/async-call-rpc.errormapfunction.html)

This library will try to "Recover" the Error object if there is enough information from another side.

```ts
interface JSONRPC_Error_object {
    // This property will help client to build a better Error object.
    data?: {
        stack?: string
        // Supported value for "type" field (Defined in ECMAScript specification):
        type?:
            | string
            | 'Error'
            | 'EvalError'
            | 'RangeError'
            | 'ReferenceError'
            | 'SyntaxError'
            | 'TypeError'
            | 'URIError'
            // Defined in HTML specification, only supported in Web
            | 'DOMException'
    }
}
```
