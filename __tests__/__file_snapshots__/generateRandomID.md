# Timeline

## T=0 Message: client => server

```php
Object {
    "id": "ndom-id-1",
    "jsonrpc": "2.0",
    "method": "add",
    "params": Array [
        1,
        2,
    ],
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@ndom-id-1",
    "color:#d2c057",
    "",
    1,
    2,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=2 Message: server => client

```php
Object {
    "id": "ndom-id-1",
    "jsonrpc": "2.0",
    "result": 3,
}
```
