# Timeline

## T=0 Log: testRunner/log

```php
Array [
    "Before this line no request from batch 1 was sent",
]
```

## T=1 Message: client => server

```php
Array [
    Object {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "add",
        "params": Array [
            2,
            3,
        ],
    },
    Object {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "echo",
        "params": Array [
            1,
        ],
    },
]
```

## T=2 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@0",
    "color:#d2c057",
    "",
    2,
    3,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=3 Log: server/log

```php
Array [
    "rpc.%cecho%c(%o%c)
%o %c@1",
    "color:#d2c057",
    "",
    1,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=4 Message: server => client

```php
Array [
    Object {
        "id": 0,
        "jsonrpc": "2.0",
        "result": 5,
    },
    Object {
        "id": 1,
        "jsonrpc": "2.0",
        "result": 1,
    },
]
```

## T=5 Log: testRunner/log

```php
Array [
    "After this line no request from batch 1 was sent",
]
```

## T=6 Log: testRunner/log

```php
Array [
    "Before this line no request from batch 2 was sent",
]
```

## T=7 Message: client => server

```php
Array [
    Object {
        "id": 2,
        "jsonrpc": "2.0",
        "method": "add",
        "params": Array [
            4,
            5,
        ],
    },
    Object {
        "id": 3,
        "jsonrpc": "2.0",
        "method": "echo",
        "params": Array [
            2,
        ],
    },
]
```

## T=8 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@2",
    "color:#d2c057",
    "",
    4,
    5,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=9 Log: server/log

```php
Array [
    "rpc.%cecho%c(%o%c)
%o %c@3",
    "color:#d2c057",
    "",
    2,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=10 Message: server => client

```php
Array [
    Object {
        "id": 2,
        "jsonrpc": "2.0",
        "result": 9,
    },
    Object {
        "id": 3,
        "jsonrpc": "2.0",
        "result": 2,
    },
]
```

## T=11 Log: testRunner/log

```php
Array [
    "After this line no request from batch 2 was sent",
]
```

## T=12 Log: testRunner/log

```php
Array [
    "Part 1 end",
]
```

## T=13 Log: testRunner/log

```php
Array [
    "Part 2 start",
]
```

## T=14 Message: client => server

```php
Array [
    Object {
        "id": 6,
        "jsonrpc": "2.0",
        "method": "add",
        "params": Array [
            4,
            5,
        ],
    },
    Object {
        "id": 7,
        "jsonrpc": "2.0",
        "method": "echo",
        "params": Array [
            2,
        ],
    },
]
```

## T=15 Log: server/log

```php
Array [
    "rpc.%cadd%c(%o, %o%c)
%o %c@6",
    "color:#d2c057",
    "",
    4,
    5,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=16 Log: server/log

```php
Array [
    "rpc.%cecho%c(%o%c)
%o %c@7",
    "color:#d2c057",
    "",
    2,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=17 Message: server => client

```php
Array [
    Object {
        "id": 6,
        "jsonrpc": "2.0",
        "result": 9,
    },
    Object {
        "id": 7,
        "jsonrpc": "2.0",
        "result": 2,
    },
]
```

## T=18 Log: testRunner/log

```php
Array [
    "Part 2 end",
]
```
