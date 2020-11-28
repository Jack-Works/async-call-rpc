# Timeline

## T=0 Message: client sent

```php
"unknown message"
```

## T=1 Message: client sent

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "not_defined_method",
    "params": Array [],
}
```

## T=2 Message: server received

```php
"unknown message"
```

## T=3 Message: server received

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "not_defined_method",
    "params": Array [],
}
```

## T=4 Message: server => client

```php
Object {
    "error": Object {
        "code": -32601,
        "message": "Method not found",
    },
    "id": 0,
    "jsonrpc": "2.0",
}
```

## T=5 Log: client/log

```php
Array [
    "Error: Method not found(-32601) %c@0
%c<remote stack not available>",
    "color: gray",
    "",
]
```
