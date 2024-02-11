# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "byPos",
    "params": Object {
        "a": 1,
        "b": 2,
    },
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cbyPos%c(%o%c)
%o %c@0",
    "color:#d2c057",
    "",
    Object {
        "a": 1,
        "b": 2,
    },
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=2 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```
