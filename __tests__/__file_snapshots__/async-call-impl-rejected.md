# Timeline

## T=0 Log: server/log

```php
Array [
    "AsyncCall failed to start",
    [TypeError: Import failed],
]
```

## T=1 Log: client/log

```php
Array [
    "AsyncCall failed to start",
    [TypeError: Import failed],
]
```

## T=2 Message: client => server

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

## T=3 Log: server/log

```php
Array [
    [TypeError: Import failed],
]
```

## T=4 Message: server => client

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "TypeError",
        },
        "message": "Import failed",
    },
    "id": 0,
    "jsonrpc": "2.0",
}
```

## T=5 Log: client/log

```php
Array [
    "TypeError: Import failed(-1) %c@0
%c<remote stack not available>",
    "color: gray",
    "",
]
```
