---
'async-call-rpc': minor
---

`hint` added to the `CallbackBasedChannel.setup(jsonRPCHandlerCallback)` and `EventBasedChannel.on(listener)`.

For an isomorphic instance of `AsyncCall` (used as both a server and a client),
when a new message comes, it does not clear if to call `decodeRequest` or `decodeRespones`.

This version introduce a new option `encoder` to replace `serialization`. `serialization` is always working in isomorphic way.

- If `hint` is `"request"`, `(encoder as ServerEncoding).decodeRequest` will be called first, if this method does not exist, `(encoder as IsomorphicEncoder).decode` will be called.
- If `hint` is `"response"`, `(encoder as ClientEncoding).decodeResponse` will be called first, if this method does not exist, `(encoder as IsomorphicEncoder).decode` will be called.
- If `hint` does not present, only `encoder.decode` will be called.
