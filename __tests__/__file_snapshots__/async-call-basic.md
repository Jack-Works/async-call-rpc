# Timeline

## T=0 Message: client sent

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

## T=1 Message: client sent

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "echo",
    "params": Array [
        "string",
    ],
}
```

## T=2 Message: client sent

```php
Object {
    "id": 2,
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```

## T=3 Message: client sent

```php
Object {
    "id": 3,
    "jsonrpc": "2.0",
    "method": "not_found",
    "params": Array [],
}
```

## T=4 Message: client sent

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "method": "withThisRef",
    "params": Array [],
}
```

## T=5 Message: server received

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

## T=6 Log: server/log

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

## T=7 Message: server sent

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=8 Message: server received

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "echo",
    "params": Array [
        "string",
    ],
}
```

## T=9 Log: server/log

```php
Array [
    "jsonrpc.%cecho%c(%o%c)
%o %c@1",
    "color: #d2c057",
    "",
    "string",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=10 Message: server sent

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "result": "string",
}
```

## T=11 Message: server received

```php
Object {
    "id": 2,
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```

## T=12 Log: server/log

```php
Array [
    "jsonrpc.%cthrows%c(%c)
%o %c@2",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=13 Log: server/log

```php
Array [
    [Error: impl error],
]
```

## T=14 Message: server sent

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "Error",
        },
        "message": "impl error",
    },
    "id": 2,
    "jsonrpc": "2.0",
}
```

## T=15 Message: server received

```php
Object {
    "id": 3,
    "jsonrpc": "2.0",
    "method": "not_found",
    "params": Array [],
}
```

## T=16 Message: server sent

```php
Object {
    "error": Object {
        "code": -32601,
        "message": "Method not found",
    },
    "id": 3,
    "jsonrpc": "2.0",
}
```

## T=17 Message: server received

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "method": "withThisRef",
    "params": Array [],
}
```

## T=18 Log: server/log

```php
Array [
    "jsonrpc.%cwithThisRef%c(%c)
%o %c@4",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=19 Message: server sent

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=20 Message: client received

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=21 Message: client received

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "result": "string",
}
```

## T=22 Message: client received

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "Error",
        },
        "message": "impl error",
    },
    "id": 2,
    "jsonrpc": "2.0",
}
```

## T=23 Log: client/log

```php
Array [
    "Error: impl error(-1) %c@2
%c<remote stack not available>",
    "color: gray",
    "",
]
```

## T=24 Message: client received

```php
Object {
    "error": Object {
        "code": -32601,
        "message": "Method not found",
    },
    "id": 3,
    "jsonrpc": "2.0",
}
```

## T=25 Log: client/log

```php
Array [
    "Error: Method not found(-32601) %c@3
%c<remote stack not available>",
    "color: gray",
    "",
]
```

## T=26 Message: client received

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "result": 3,
}
```
