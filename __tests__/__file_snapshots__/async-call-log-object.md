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
    "jsonrpc.add(1,2) @0",
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
    "jsonrpc.throws() @1",
]
```

## T=5 Message: server => client

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

## T=6 Log: client/log

```php
Array [
    "Error: impl error(-1) @1
<remote stack not available>",
]
```
