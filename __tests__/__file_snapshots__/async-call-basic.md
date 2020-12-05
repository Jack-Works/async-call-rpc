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
    "method": "throwEcho",
    "params": Array [
        "1",
    ],
}
```

## T=4 Message: client sent

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "method": "not_found",
    "params": Array [],
}
```

## T=5 Message: client sent

```php
Object {
    "id": 5,
    "jsonrpc": "2.0",
    "method": "withThisRef",
    "params": Array [],
}
```

## T=6 Message: server received

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

## T=7 Log: server/log

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
]
```

## T=8 Message: server sent

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=9 Message: server received

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

## T=10 Log: server/log

```php
Array [
    "rpc.%cecho%c(%o%c)
%o %c@1",
    "color: #d2c057",
    "",
    "string",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=11 Message: server sent

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "result": "string",
}
```

## T=12 Message: server received

```php
Object {
    "id": 2,
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```

## T=13 Log: server/log

```php
Array [
    "rpc.%cthrows%c(%c)
%o %c@2",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=14 Log: server/log

```php
Array [
    [Error: impl error],
]
```

## T=15 Message: server sent

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

## T=16 Message: server received

```php
Object {
    "id": 3,
    "jsonrpc": "2.0",
    "method": "throwEcho",
    "params": Array [
        "1",
    ],
}
```

## T=17 Log: server/log

```php
Array [
    "rpc.%cthrowEcho%c(%o%c)
%o %c@3",
    "color: #d2c057",
    "",
    "1",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=18 Log: server/log

```php
Array [
    "1",
]
```

## T=19 Message: server sent

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "Error",
        },
        "message": "1",
    },
    "id": 3,
    "jsonrpc": "2.0",
}
```

## T=20 Message: server received

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "method": "not_found",
    "params": Array [],
}
```

## T=21 Message: server sent

```php
Object {
    "error": Object {
        "code": -32601,
        "message": "Method not found",
    },
    "id": 4,
    "jsonrpc": "2.0",
}
```

## T=22 Message: server received

```php
Object {
    "id": 5,
    "jsonrpc": "2.0",
    "method": "withThisRef",
    "params": Array [],
}
```

## T=23 Log: server/log

```php
Array [
    "rpc.%cwithThisRef%c(%c)
%o %c@5",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=24 Message: server sent

```php
Object {
    "id": 5,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=25 Message: client received

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=26 Message: client received

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "result": "string",
}
```

## T=27 Message: client received

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

## T=28 Log: client/log

```php
Array [
    "Error: impl error(-1) %c@2
%c<remote stack not available>",
    "color: gray",
    "",
]
```

## T=29 Message: client received

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "Error",
        },
        "message": "1",
    },
    "id": 3,
    "jsonrpc": "2.0",
}
```

## T=30 Log: client/log

```php
Array [
    "Error: 1(-1) %c@3
%c<remote stack not available>",
    "color: gray",
    "",
]
```

## T=31 Message: client received

```php
Object {
    "error": Object {
        "code": -32601,
        "message": "Method not found",
    },
    "id": 4,
    "jsonrpc": "2.0",
}
```

## T=32 Log: client/log

```php
Array [
    "Error: Method not found(-32601) %c@4
%c<remote stack not available>",
    "color: gray",
    "",
]
```

## T=33 Message: client received

```php
Object {
    "id": 5,
    "jsonrpc": "2.0",
    "result": 3,
}
```
