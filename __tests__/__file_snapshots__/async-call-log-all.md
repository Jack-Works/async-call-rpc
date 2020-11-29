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
    "remoteStack": "<mocked stack>",
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@0",
    "color: #d2c057",
    "",
    1,
    2,
    "",
    Promise {},
    "color: gray; font-style: italic;",
    [Function anonymous],
]
```

## T=2 Log: server/log

```php
Array [
    "<mocked stack>",
]
```

## T=3 Log: server/log

```php
Array []
```

## T=4 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=5 Message: client => server

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
    "remoteStack": "<mocked stack>",
}
```

## T=6 Log: server/log

```php
Array [
    "rpc.%cthrows%c(%c)
%o %c@1",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
    [Function anonymous],
]
```

## T=7 Log: server/log

```php
Array [
    "<mocked stack>",
]
```

## T=8 Log: server/log

```php
Array []
```

## T=9 Log: server/log

```php
Array [
    [Error: impl error],
]
```

## T=10 Message: server => client

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "stack": "<mocked stack>",
            "type": "E",
        },
        "message": "impl error",
    },
    "id": 1,
    "jsonrpc": "2.0",
}
```

## T=11 Log: client/log

```php
Array [
    "E: impl error(-1) %c@1
%c<mocked stack>",
    "color: gray",
    "",
]
```
