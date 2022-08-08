# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "DOMException",
    "params": Array [],
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cDOMException%c(%c)
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
    [name: message],
]
```

## T=3 Message: server => client

```php
Object {
    "error": Object {
        "code": -1,
        "data": Object {
            "type": "DOMException:name",
        },
        "message": "message",
    },
    "id": 0,
    "jsonrpc": "2.0",
}
```

## T=4 Log: client/log

```php
Array [
    "DOMException:name: message(-1) %c@0
%c<remote stack not available>",
    "color: gray",
    "",
]
```
