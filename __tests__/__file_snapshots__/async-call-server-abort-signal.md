# Timeline

## T=0 Message: client sent

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "delay",
    "params": Array [
        200,
        "first",
    ],
}
```

## T=1 Message: client sent

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "delay",
    "params": Array [
        400,
        "second",
    ],
}
```

## T=2 Message: server received

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "delay",
    "params": Array [
        200,
        "first",
    ],
}
```

## T=3 Log: server/log

```php
Array [
    "rpc.%cdelay%c(%o, %o%c)
%o %c@0",
    "color:#d2c057",
    "",
    200,
    "first",
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=4 Message: server received

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "delay",
    "params": Array [
        400,
        "second",
    ],
}
```

## T=5 Log: server/log

```php
Array [
    "rpc.%cdelay%c(%o, %o%c)
%o %c@1",
    "color:#d2c057",
    "",
    400,
    "second",
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=6 Log: testRunner/log

```php
Array [
    "soft abort",
]
```

## T=7 Message: client => server

```php
Object {
    "id": 2,
    "jsonrpc": "2.0",
    "method": "delay",
    "params": Array [
        0,
        "post abort",
    ],
}
```

## T=8 Log: server/log

```php
Array [
    [AbortError: This operation was aborted],
]
```

## T=9 Message: server => client

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "DOMException:AbortError",
        },
        "message": "This operation was aborted",
    },
    "id": 2,
    "jsonrpc": "2.0",
}
```

## T=10 Log: client/log

```php
Array [
    "DOMException:AbortError: This operation was aborted(-1) %c@2
%c<remote stack not available>",
    "color: gray",
    "",
]
```

## T=11 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": undefined,
}
```

## T=12 Log: testRunner/log

```php
Array [
    "hard abort",
]
```

## T=13 Log: server/log

```php
Array [
    [AbortError: This operation was aborted],
]
```

## T=14 Message: server => client

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "DOMException:AbortError",
        },
        "message": "This operation was aborted",
    },
    "id": 1,
    "jsonrpc": "2.0",
}
```

## T=15 Log: client/log

```php
Array [
    "DOMException:AbortError: This operation was aborted(-1) %c@1
%c<remote stack not available>",
    "color: gray",
    "",
]
```
