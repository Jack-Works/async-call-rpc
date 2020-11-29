# Timeline

## T=0 Log: client/log

```php
Array [
    [TypeError: RPC used as Promise: Error 3: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#3],
]
```

## T=1 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "otherMethods",
    "params": Array [],
}
```

## T=2 Log: server/log

```php
Array [
    "rpc.%cotherMethods%c(%c)
%o %c@0",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=3 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 1,
}
```
