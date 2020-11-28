# Timeline

## T=0 Message: client => server

```php
Object {
    "id": "a",
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        "b",
        undefined,
    ],
}
```

## T=1 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@a",
    "color: #d2c057",
    "",
    "b",
    undefined,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=2 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.start",
    "params": Array [
        "not_found",
        Array [],
    ],
}
```

## T=3 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.start%c(%o, %o%c)
%o %c@0",
    "color: #d2c057",
    "",
    "not_found",
    Array [],
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```
