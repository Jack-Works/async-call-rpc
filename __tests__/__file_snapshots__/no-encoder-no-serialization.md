# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "undefined",
    "params": Array [],
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cundefined%c(%c)
%o %c@0",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=2 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": undefined,
}
```
