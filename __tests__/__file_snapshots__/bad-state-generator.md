# Timeline

## T=0 Message: client sent

```php
Object {
    "id": "a",
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        "b",
        undefined,
    ],
}
```

## T=1 Message: client sent

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.start",
    "params": Array [
        "not_found",
        Array [],
    ],
}
```

## T=2 Message: server received

```php
Object {
    "id": "a",
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        "b",
        undefined,
    ],
}
```

## T=3 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@a",
    "color: #d2c057",
    "",
    "b",
    undefined,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=4 Log: server/log

```php
Array [
    [Error: Iterator b, Error 0: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#0],
]
```

## T=5 Message: server sent

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "Error",
        },
        "message": "Iterator b, Error 0: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#0",
    },
    "id": "a",
    "jsonrpc": "2.0",
}
```

## T=6 Message: server received

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.start",
    "params": Array [
        "not_found",
        Array [],
    ],
}
```

## T=7 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.start%c(%o, %o%c)
%o %c@0",
    "color: #d2c057",
    "",
    "not_found",
    Array [],
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=8 Log: server/log

```php
Array [
    [TypeError: not_found is not a function],
]
```

## T=9 Message: server sent

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "TypeError",
        },
        "message": "not_found is not a function",
    },
    "id": 0,
    "jsonrpc": "2.0",
}
```

## T=10 Message: client received

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "Error",
        },
        "message": "Iterator b, Error 0: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#0",
    },
    "id": "a",
    "jsonrpc": "2.0",
}
```

## T=11 Log: client/log

```php
Array [
    "Error: Iterator b, Error 0: https://github.com/Jack-Works/async-call-rpc/wiki/Errors#0(-1) %c@a
%c<remote stack not available>",
    "color: gray",
    "",
]
```
