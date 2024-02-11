# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "add",
    "params": Array [
        0,
        1,
    ],
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@0",
    "color:#d2c057",
    "",
    0,
    1,
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
    "result": 1,
}
```
