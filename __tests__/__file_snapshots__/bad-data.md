# Timeline

## T=0 Message: client => server

```php
0
```

## T=1 Message: client => server

```php
Object {}
```

## T=2 Message: client => server

```php
Object {
    "jsonrpc": "1.0",
}
```

## T=3 Message: client => server

```php
Object {
    "jsonrpc": "2.0",
    "params": 1,
}
```

## T=4 Message: client => server

```php
Object {
    "error": Object {
        "code": -1,
        "message": "what",
    },
    "id": null,
    "jsonrpc": "2.0",
}
```

## T=5 Log: server/log

```php
Array [
    "Error: what(-1) %c@null
%c<remote stack not available>",
    "color: gray",
    "",
]
```
