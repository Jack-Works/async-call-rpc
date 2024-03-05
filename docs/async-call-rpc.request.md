<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [async-call-rpc](./async-call-rpc.md) &gt; [Request](./async-call-rpc.request.md)

## Request interface

JSON-RPC Request object.

**Signature:**

```typescript
export interface Request 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [id?](./async-call-rpc.request.id.md) | <code>readonly</code> | [ID](./async-call-rpc.id.md) | _(Optional)_ |
|  [jsonrpc](./async-call-rpc.request.jsonrpc.md) | <code>readonly</code> | '2.0' |  |
|  [method](./async-call-rpc.request.method.md) | <code>readonly</code> | string |  |
|  [params](./async-call-rpc.request.params.md) | <code>readonly</code> | readonly unknown\[\] \| object |  |
|  [remoteStack?](./async-call-rpc.request.remotestack.md) | <code>readonly</code> | string \| undefined | _(Optional)_ Non-standard field. It records the caller's stack of this Request. |
