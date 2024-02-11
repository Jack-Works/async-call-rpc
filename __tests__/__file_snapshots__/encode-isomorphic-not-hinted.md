# Timeline

## T=0 Log: testRunner/log

```php
Array [
    "encode",
    Object {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "undefined",
        "params": Array [],
    },
]
```

## T=1 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "undefined",
    "params": Array [],
}
```

## T=2 Log: testRunner/log

```php
Array [
    "decode",
    Object {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "undefined",
        "params": Array [],
    },
]
```

## T=3 Log: server/log

```php
Array [
    "rpc.%cundefined%c(%c)
%o %c@0",
    "color:#d2c057",
    "",
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=4 Log: testRunner/log

```php
Array [
    "encode",
    Object {
        "id": 0,
        "jsonrpc": "2.0",
        "result": undefined,
    },
]
```

## T=5 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": undefined,
}
```

## T=6 Log: testRunner/log

```php
Array [
    "decode",
    Object {
        "id": 0,
        "jsonrpc": "2.0",
        "result": undefined,
    },
]
```
