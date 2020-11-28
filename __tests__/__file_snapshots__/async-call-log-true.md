# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
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
    "jsonrpc.%cadd%c(%o, %o%c)
%o %c@0",
    "color: #d2c057",
    "",
    1,
    2,
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
    "result": 3,
}
```

## T=3 Message: client => server

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```

## T=4 Log: server/log

```php
Array [
    "jsonrpc.%cthrows%c(%c)
%o %c@1",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=5 Log: server/log

```php
Array [
    [Error: impl error],
]
```

## T=6 Message: server => client

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "Error",
        },
        "message": "impl error",
    },
    "id": 1,
    "jsonrpc": "2.0",
}
```

## T=7 Log: client/log

```php
Array [
    "Error: impl error(-1) %c@1
%c<remote stack not available>",
    "color: gray",
    "",
]
```
