<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [async-call-rpc](./async-call-rpc.md) &gt; [JSONEncoderOptions](./async-call-rpc.jsonencoderoptions.md)

## JSONEncoderOptions interface

Options of [JSONEncoder()](./async-call-rpc.jsonencoder.md)

**Signature:**

```typescript
export interface JSONEncoderOptions 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [keepUndefined?](./async-call-rpc.jsonencoderoptions.keepundefined.md) |  | false \| 'null' \| undefined | _(Optional)_ How to handle <code>&quot;undefined&quot;</code> in the result of [SuccessResponse](./async-call-rpc.successresponse.md)<!-- -->. |
|  [replacer?](./async-call-rpc.jsonencoderoptions.replacer.md) |  | ((this: any, key: string, value: any) =&gt; any) \| undefined | _(Optional)_ A function that transforms the results. |
|  [reviver?](./async-call-rpc.jsonencoderoptions.reviver.md) |  | ((this: any, key: string, value: any) =&gt; any) \| undefined | _(Optional)_ A function that transforms the results. This function is called for each member of the object. If a member contains nested objects, the nested objects are transformed before the parent object is. |
|  [space?](./async-call-rpc.jsonencoderoptions.space.md) |  | string \| number \| undefined | _(Optional)_ Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read. |
