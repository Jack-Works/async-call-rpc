# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cthrows%c(%c)
%o %c@0",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=2 Log: server/log

```php
Array [
    [Error: impl error],
]
```

## T=3 Message: server => client

```php
Object {
    "error": Object {
        "code": -233,
        "data": Object {
            "custom_data": true,
        },
        "message": "Oh my message",
    },
    "id": 0,
    "jsonrpc": "2.0",
}
```

## T=4 Log: client/log

```php
Array [
    "Error: Oh my message(-233) %c@0
%c<remote stack not available>",
    "color: gray",
    "",
]
```
