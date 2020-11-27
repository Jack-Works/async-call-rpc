# Timeline

## T=0 Log: jest/log

```php
Array [
    "No log before this line",
]
```

## T=1 Message: client => server

```php
Array [
    Object {
        "jsonrpc": "2.0",
        "method": "add",
        "params": Array [
            1,
            2,
        ],
    },
    Object {
        "jsonrpc": "2.0",
        "method": "throws",
        "params": Array [],
    },
]
```

## T=2 Log: server/log

```php
Array [
    "jsonrpc.%cadd%c(%o, %o%c)
%o %c@undefined",
    "color: #d2c057",
    "",
    1,
    2,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=3 Log: server/log

```php
Array [
    "jsonrpc.%cthrows%c(%c)
%o %c@undefined",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=4 Log: server/log

```php
Array [
    [Error: impl error],
]
```

## T=5 Message: server sent

```php
Array [
    Object {
        "error": Object {
            "code": -1,
            "data": Object {
                "type": "Error",
            },
            "message": "impl error",
        },
        "id": null,
        "jsonrpc": "2.0",
    },
]
```
