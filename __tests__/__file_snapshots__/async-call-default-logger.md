# Timeline

## T=0 Log: testRunner/log

```php
Array [
    "In other tests we provide logger.",
    "So we'd test no logger here.",
    "It should use globalThis.logger",
]
```

## T=1 Message: client => server

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

## T=2 Log: testRunner/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@0",
    "color:#d2c057",
    "",
    1,
    2,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=3 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 3,
}
```
