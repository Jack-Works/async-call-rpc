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

## T=3 Message: server sent

```php
Object {
    "error": Object {
        "code": -32600,
        "message": "Invalid Request",
    },
    "id": null,
    "jsonrpc": "2.0",
}
```

## T=4 Message: server received

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "not_defined_method",
    "params": Array [],
}
```

## T=5 Message: server sent

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

## T=6 Message: client received

```php
Object {
    "error": Object {
        "code": -32600,
        "message": "Invalid Request",
    },
    "id": null,
    "jsonrpc": "2.0",
}
```

## T=7 Log: client/log

```php
Array [
    "Error: Invalid Request(-32600) %c@null
%c<remote stack not available>",
    "color: gray",
    "",
]
```

## T=8 Message: client received

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

## T=9 Log: client/log

```php
Array [
    "Error: Method not found(-32601) %c@0
%c<remote stack not available>",
    "color: gray",
    "",
]
```
