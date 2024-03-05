# Async Call

`async-call-rpc` is a [JSON RPC](https://www.jsonrpc.org/specification) server and client written in TypeScript for any ECMAScript environment.

[![Code coverage](https://codecov.io/gh/Jack-Works/async-call-rpc/branch/main/graph/badge.svg)](https://codecov.io/gh/Jack-Works/async-call-rpc)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Jack-Works/async-call-rpc/build.yml?branch=main)](https://github.com/Jack-Works/async-call-rpc/actions)
[![npm](https://img.shields.io/npm/v/async-call-rpc)](https://npmjs.org/async-call-rpc) [![@works/json-rpc on jsr](https://jsr.io/badges/@works/json-rpc)](https://jsr.io/@works/json-rpc)
![ES2015+](https://img.shields.io/badge/ECMAScript-2015%2B-brightgreen)

## Links

[CHANGELOG.md](./CHANGELOG.md) | [Document of AsyncCall](https://jack-works.github.io/async-call-rpc/async-call-rpc.asynccall.html) | [Document of AsyncGeneratorCall](https://jack-works.github.io/async-call-rpc/async-call-rpc.asyncgeneratorcall.html) | [Playground](https://jack-works.github.io/async-call-rpc/)

Chapters:

-   [Installation](#installation)
-   [`channel`, how to communicate](#channel)
-   [`encoder`, how to use complex data types](#encoder)
-   [Example](#example)
-   [Notifications and Batch requests](#notifications-and-batch-requests)
-   [Package entries](#package-entries)
-   [Builtin `channels` (including WebSocket)](#builtin-channels)
-   [Implemented JSON RPC internal methods](#implemented-json-rpc-internal-methods)
-   [Non-standard extension to JSON RPC specification](#non-standard-extension-to-json-rpc-specification)

## Features

-   Zero dependencies!
-   Running in any ES6 environment, no requirement on any Web or Node API
-   Simple to define a RPC server and simple to use as a RPC client
-   Full TypeScript support
-   Use a custom encoder to communicate with complex data types
-   Support async generator (Require both server and client supports [4 JSON RPC internal methods listed below](#implemented-json-rpc-internal-methods) and async generator exists in the environment)

## Cautions

-   This package is shipping ECMAScript 2018 syntax (`async function`).
-   The async generator support leaks memory on the server. Use it with caution.
-   NOT support ES5.
-   NOT support JSON RPC 1.0

## Installation

### Install via npm

> npm i async-call-rpc
>
> yarn add async-call-rpc
>
> pnpm i async-call-rpc

### Install via [jsr](https://jsr.io/@works/json-rpc)

This package is published as `@works/json-rpc` on the jsr.
If you install it via jsr, you should import this package from `"@works/json-rpc"` instead of `"async-call-rpc"`

> deno add @works/json-rpc
>
> npx jsr add @works/json-rpc
>
> yarn dlx jsr add @works/json-rpc
>
> pnpm dlx jsr add @works/json-rpc
>
> bunx jsr add @works/json-rpc

### Import from browser

You can access <https://www.jsdelivr.com/package/npm/async-call-rpc?path=out> to get the latest URL and [SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

Note: the `utils/` entrypoint is not published on the jsr.

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

### Other JS environments

Load the `out/base.mjs` (ES Module) or `out/base.js` (UMD, CommonJS, or AMD) to your project.

## `channel`

To communicate with the server/client, you need to implement one of the following interfaces:

-   [CallbackBasedChannel](https://jack-works.github.io/async-call-rpc/async-call-rpc.callbackbasedchannel.html), generally used in the server. [Example: WebSocket on Node](https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/node/websocket.server.ts).
-   [EventBasedChannel](https://jack-works.github.io/async-call-rpc/async-call-rpc.eventbasedchannel.html), generally used in the client. [Example: WebSocket on Web](https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/web/websocket.client.ts)

There are some [built-in channels](#builtin-channels) you can simplify the usage.

The following document will assume you have defined your `channel`.

## `encoder`

This library does not have any opinionated data transmitting format. You need to implement one of the following interfaces:

- [IsomorphicEncoder](https://jack-works.github.io/async-call-rpc/async-call-rpc.isomorphicencoder.html). [Example: JSONEncoder](https://jack-works.github.io/async-call-rpc/async-call-rpc.jsonencoder.html)
- [IsomorphicEncoderFull](https://jack-works.github.io/async-call-rpc/async-call-rpc.isomorphicencoderfull.html)

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
import * as server from './server.ts'
// create a server
AsyncCall(server, { channel })
```

### Client example

```ts
import { AsyncCall } from 'async-call-rpc'
import type * as server from './server.ts'
const server = AsyncCall<typeof server>({}, { channel })
server.add(2, 40).then(console.log) // 42
```

## Notifications and Batch requests

AsyncCall can send [notifications](https://www.jsonrpc.org/specification#notification).

Using notifications means results or remote errors are never sent back. Local errors will not be omitted, e.g. encoder errors or network errors.

```ts
import { AsyncCall, notify } from 'async-call-rpc'
const server = notify(AsyncCall<typeof server>({}, { channel }))
server.add(1, 2).then(console.log) // undefined
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
drop() // to drop all pending requests (and reject corresponding Promises)
// d rejected
```

## Package entries

This library has 2 entries. `base` and `full`. `base` is the default entry point. The `full` version includes the `AsyncGeneratorCall` but the `base` version doesn't.

### Browser / Deno

Please check out <https://www.jsdelivr.com/package/npm/async-call-rpc?path=out>

### Node:

```js
// Full version
require('async-rpc-call/full') // or
import { } from 'async-rpc-call/full'

// Base version
require('async-rpc-call') // or
import { } from 'async-rpc-call'
```

## Builtin channels

They're not part of the core library but are provided as utils to increase usability.

### (Node) WebSocket

|                  | Server                                                                                                                                                          | Client                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Entry point      | `async-call-rpc/utils/node/websocket.server.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/node/websocket.server.ts) | TBD                        |
| Entry point type | CommonJS                                                                                                                                                        | CommonJS                   |
| Dependencies     | [ws](https://npmjs.com/ws)                                                                                                                                      | [ws](https://npmjs.com/ws) |
| Example          | [./examples/node.websocket.server.js](https://github.com/Jack-Works/async-call-rpc/blob/main/examples/node.websocket.server.js)                                 | TBD                        |

### (Deno) WebSocket

|                  | Server                                                                                                                                                                                          | Client    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/deno/websocket.server.ts`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/main/utils/deno/websocket.server.ts) | TBD       |
| Entry point type | ES Module                                                                                                                                                                                       | ES Module |
| Dependencies     | Deno std                                                                                                                                                                                        | Deno std  |
| Example          | [./examples/deno.websocket.server.ts](https://github.com/Jack-Works/async-call-rpc/blob/main/examples/deno.websocket.server.ts)                                                                 | TBD       |

### (Web) WebSocket

|                  | Client                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/websocket.client.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/web/websocket.client.ts) |
| Entry point type | ES Module                                                                                                                                                                                         |
| Dependencies     | Nothing                                                                                                                                                                                           |
| Example          | [./examples/browser.websocket.client.js](https://github.com/Jack-Works/async-call-rpc/blob/main/examples/browser.websocket.client.js)                                                             |

### (Web) [BroadcastChannel](https://mdn.io/BroadcastChannel)

|                  | Server & Client                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/broadcast.channel.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/web/broadcast.channel.ts) |
| Entry point type | ES Module                                                                                                                                                                                           |
| Dependencies     | Nothing                                                                                                                                                                                             |
| Example          | TBD                                                                                                                                                                                                 |

### (Web) [Worker](https://mdn.io/Worker)

|                  | Host & Worker                                                                                                                                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry point      | `https://cdn.jsdelivr.net/npm/async-call-rpc@latest/utils/web/worker.js`<br />[(Source code)](https://github.com/Jack-Works/async-call-rpc/blob/main/utils-src/web/worker.ts)                                                                                                          |
| Entry point type | ES Module                                                                                                                                                                                                                                                                              |
| Dependencies     | Nothing                                                                                                                                                                                                                                                                                |
| Example          | Main frame: [./examples/browser.worker-main.js](https://github.com/Jack-Works/async-call-rpc/blob/main/examples/browser.worker-main.js) <br /> Worker: [./examples/browser.worker-worker.js](https://github.com/Jack-Works/async-call-rpc/blob/main/examples/browser.worker-worker.js) |

Main thread: `new WorkerChannel(new Worker(...))`

Worker: `new WorkerChannel()`

## Implemented JSON RPC internal methods

These four methods are used to implement `AsyncGeneratorCall` support.

```ts
interface JSONRPC_Internal_Methods {
    // These 4 methods represent the Async Iterator protocol in ECMAScript
    //This method starts an async iterator, returns the id
    'rpc.async-iterator.start'(method: string, params: unknown[]): Promise<string>
    //This method executes the `next` method on the previous iterator started by `rpc.async-iterator.start`
    'rpc.async-iterator.next'(id: string, value: unknown): Promise<IteratorResult<unknown>>
    //This method executes the `return` method on the previous iterator started by `rpc.async-iterator.start`
    'rpc.async-iterator.return'(id: string, value: unknown): Promise<IteratorResult<unknown>>
    //This method executes the `throw` method on the previous iterator started by `rpc.async-iterator.start`
    'rpc.async-iterator.throw'(id: string, value: unknown): Promise<IteratorResult<unknown>>
}
```

## Non-standard extension to JSON RPC specification

### remoteStack on the Request object

This library can send the client the call stack to the server to make the logger better.

Controlled by [`option.log.sendLocalStack`](https://jack-works.github.io/async-call-rpc/async-call-rpc.asynccallloglevel.sendlocalstack.html). Default to `false`.

```ts
interface JSONRPC_Request_object {
    // This property includes the caller's stack.
    remoteStack?: string
}
```

### "undef" on Response object

This is a non-standard property that appears when using the deprecated JSONSerialization due to JSON doesn't support `undefined`. It's a hint to the client, that the result is `undefined`.

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
    // This property will help the client to build a better Error object.
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
