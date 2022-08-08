# Timeline

## T=0 Log: testRunner/log

```php
Array [
    "Before this line should have no response.",
    "Even throwing functions should succeed too.",
    "No response should be sent from the server.",
]
```

## T=1 Message: client sent

```php
Object {
    "jsonrpc": "2.0",
    "method": "add",
    "params": Array [
        2,
        3,
    ],
}
```

## T=2 Message: client sent

```php
Object {
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```

## T=3 Message: client sent

```php
Object {
    "jsonrpc": "2.0",
    "method": "not_found",
    "params": Array [],
}
```

## T=4 Message: client sent

```php
Object {
    "jsonrpc": "2.0",
    "method": "echo",
    "params": Array [
        1,
    ],
}
```

## T=5 Message: client sent

```php
Object {
    "jsonrpc": "2.0",
    "method": "throws",
    "params": Array [],
}
```
