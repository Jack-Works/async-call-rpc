# Timeline

## T=0 Log: testRunner/log

```php
Array [
    "No log before this line",
]
```

## T=1 Message: client => server

```php
Array [
    Object {
        "jsonrpc": "2.0",
        "method": "add",
        "params": Array [
            1,
            2,
        ],
    },
    Object {
        "jsonrpc": "2.0",
        "method": "throws",
        "params": Array [],
    },
    Object {
        "jsonrpc": "2.0",
        "method": "add",
        "params": Array [
            3,
            4,
        ],
    },
]
```

## T=2 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@undefined",
    "color:#d2c057",
    "",
    1,
    2,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=3 Log: server/log

```php
Array [
    "rpc.%cthrows%c(%c)
%o %c@undefined",
    "color:#d2c057",
    "",
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=4 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@undefined",
    "color:#d2c057",
    "",
    3,
    4,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=5 Log: server/log

```php
Array [
    [Error: impl error],
]
```
