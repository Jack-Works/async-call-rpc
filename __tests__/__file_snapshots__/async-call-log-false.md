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

## T=1 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```

## T=2 Message: client => server

```php
Object {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```

## T=3 Message: server => client

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
