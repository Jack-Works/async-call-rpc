<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [async-call-rpc](./async-call-rpc.md) &gt; [EventBasedChannel](./async-call-rpc.eventbasedchannel.md) &gt; [on](./async-call-rpc.eventbasedchannel.on.md)

## EventBasedChannel.on() method

Register the message listener.

<b>Signature:</b>

```typescript
on(listener: (data: Data) => void): void | (() => void);
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  listener | (data: Data) =&gt; void | The message listener. |

<b>Returns:</b>

void \| (() =&gt; void)

a function that unregister the listener.

