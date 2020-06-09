# Async Call

`async-call-rpc` is a [JSON RPC](https://www.jsonrpc.org/specification) server and client written in TypeScript for any ES6+ environment.

## Links

[CHANGELOG.md](./CHANGELOG.md) | [Document of AsyncCall](https://jack-works.github.io/async-call/async-call-rpc.asynccall.html) | [Document of AsyncGeneratorCall](https://jack-works.github.io/async-call/async-call-rpc.asyncgeneratorcall.html) | [Playground](https://jack-works.github.io/async-call/)

Chapters:

-   [The first concept: `messageChannel`](#the-first-concept-messagechannel)
-   [Example](#example)
-   [Installation](#installation)
-   [Entries](#entries)
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
-   This package is shipping ECMAScript 2018 syntax (including `async function`). You need to use a transformer to transpile to ES6.
-   The default configuration is not standard JSON RPC (with a small extension to help easy using in JavaScript). But you can [switch on the "strict" mode](https://jack-works.github.io/async-call/async-call-rpc.asynccallstrictjsonrpc.html)
-   The async generator mode might leak memory on the server. Use it by your caution.
-   NOT support JSON RPC 1.0

## The first concept: `messageChannel`

<a id="messageChannel"></a>

The `messageChannel` is the only thing you need to learn to use this library.

This library is designed to not rely on any specific platform. Only require things defined in the ECMAScript specification.
In the ES spec, there is no I/O related API so it's impossible to communicate with the outer world.

Therefore, this library require you to provide an object in the following shape:

```ts
interface MessageChannel {
    on(event: string, callback: (data: unknown) => void): void
    emit(event: string, data: unknown): void
}
```

In general, the `MessageChannel` should have the following semantics:

-   When the `data` from the remote arrives (by `addEventListener('message', ...)`, etc), the `callback` should be called.
-   When the `emit` method is called, the `data` should be sent to the remote properly (by `postMessage` or `fetch`, etc).

> There is a [plan to add built-in messageChannel for Web, Node.JS, and Deno](https://github.com/Jack-Works/async-call/issues/15) to simplify the setup.

The following document will assume you have defined your `messageChannel`.

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
AsyncCall(server, { messageChannel })
```

### Client example

```ts
import { AsyncCall } from 'async-call-rpc'
const server = AsyncCall<typeof server>({}, { messageChannel })
server.add(2, 40).then(console.log) // 42
```

### Isomorphic API

You can notice from the above example,
define a server is using `AsyncCall(serverImplementation, opt)`,
define a client is using `AsyncCall<typeof serverImplementation>({}, opt)`.
So it is possible to define a server and a client at the same time.

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
<script src="https://cdn.jsdelivr.net/npm/async-call-rpc@2.0.1/out/base.cjs"></script>
<script>
    const { AsyncCall } = globalThis.AsyncCall
</script>
```

### In other JS environment

Load the `out/base.mjs` (ES Module) or `out/base.cjs` (UMD, CommonJS or AMD) to your project.

## Entries

> Currently the default entry is `full` but in the next major version, it will be `base`.

This library has 2 entry. `base` and `full`. The difference is the `full` version includes the `AsyncGeneratorCall` but the base version doesn't.

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

Controlled by [`option.log.sendLocalStack`](https://jack-works.github.io/async-call/async-call-rpc.asynccallloglevel.sendlocalstack.html). Default to `false`.

```ts
interface JSONRPC_Request_object {
    // This property include the caller's stack.
    remoteStack?: string
}
```

### resultIsUndefined on Response object

This is a non-standard property. It's a hint to the client, that the result is `undefined` (because in JSON there is no `undefined`, only `null`). If this is option is off, the `undefined` result will become `null`.

Controlled by [`strict.noUndefined`](https://jack-works.github.io/async-call/async-call-rpc.asynccallstrictjsonrpc.noundefined.html). Default to `false`.

```ts
interface JSONRPC_Response_object {
    // This property is a hint.
    // If the client is run in JavaScript, it should treat "result: null" as "result: undefined"
    resultIsUndefined?: boolean
}
```

### The implementation-defined Error data

In the JSON RPC specification, this is implementation-defined. (Plan to [add API for custom Error data](https://github.com/Jack-Works/async-call/issues/8)).

This library will try to "Recover" the Error object if there is enough information from another side.

Todo: [Disable this behavior](https://github.com/Jack-Works/async-call/issues/18)

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
