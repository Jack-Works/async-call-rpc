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

## T=4 Log: server/log

```php
Array [
    "Missing method",
    "not_defined_method",
    Object {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "not_defined_method",
        "params": Array [],
    },
]
```
