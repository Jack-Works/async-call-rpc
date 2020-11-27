# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.start",
    "params": Array [
        "echo",
        Array [
            Array [
                1,
                2,
                3,
            ],
        ],
    ],
}
```

## T=1 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.start%c(%o, %o%c)
%o %c@0",
    "color: #d2c057",
    "",
    "echo",
    Array [
        Array [
            1,
            2,
            3,
        ],
    ],
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=2 Message: server => client

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "result": 1,
}
```

## T=3 Message: client => server

```php
Object {
    "id": 2,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        1,
        undefined,
    ],
}
```

## T=4 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@2",
    "color: #d2c057",
    "",
    1,
    undefined,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=5 Message: server => client

```php
Object {
    "id": 2,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 1,
    },
}
```

## T=6 Message: client => server

```php
Object {
    "id": 3,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        1,
        undefined,
    ],
}
```

## T=7 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@3",
    "color: #d2c057",
    "",
    1,
    undefined,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=8 Message: server => client

```php
Object {
    "id": 3,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 2,
    },
}
```

## T=9 Message: client => server

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        1,
        undefined,
    ],
}
```

## T=10 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@4",
    "color: #d2c057",
    "",
    1,
    undefined,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=11 Message: server => client

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 3,
    },
}
```

## T=12 Message: client => server

```php
Object {
    "id": 5,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        1,
        undefined,
    ],
}
```

## T=13 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@5",
    "color: #d2c057",
    "",
    1,
    undefined,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=14 Message: server => client

```php
Object {
    "id": 5,
    "jsonrpc": "2.0",
    "result": Object {
        "done": true,
        "value": undefined,
    },
}
```

## T=15 Message: client => server

```php
Object {
    "id": 6,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.start",
    "params": Array [
        "magic",
        Array [],
    ],
}
```

## T=16 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.start%c(%o, %o%c)
%o %c@6",
    "color: #d2c057",
    "",
    "magic",
    Array [],
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=17 Message: server => client

```php
Object {
    "id": 6,
    "jsonrpc": "2.0",
    "result": 7,
}
```

## T=18 Message: client => server

```php
Object {
    "id": 8,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        7,
        0,
    ],
}
```

## T=19 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@8",
    "color: #d2c057",
    "",
    7,
    0,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=20 Message: server => client

```php
Object {
    "id": 8,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": undefined,
    },
}
```

## T=21 Message: client => server

```php
Object {
    "id": 9,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        7,
        1,
    ],
}
```

## T=22 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@9",
    "color: #d2c057",
    "",
    7,
    1,
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=23 Message: server => client

```php
Object {
    "id": 9,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 1,
    },
}
```

## T=24 Message: client => server

```php
Object {
    "id": 10,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.throw",
    "params": Array [
        7,
        [Error: 2],
    ],
}
```

## T=25 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.throw%c(%o, %o%c)
%o %c@10",
    "color: #d2c057",
    "",
    7,
    [Error: 2],
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=26 Message: server => client

```php
Object {
    "id": 10,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": [Error: 2],
    },
}
```

## T=27 Message: client => server

```php
Object {
    "id": 11,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        7,
        "well",
    ],
}
```

## T=28 Log: server/log

```php
Array [
    "jsonrpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@11",
    "color: #d2c057",
    "",
    7,
    "well",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=29 Message: server => client

```php
Object {
    "id": 11,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": "well",
    },
}
```

## T=30 Message: client sent

```php
Object {
    "id": 12,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.return",
    "params": Array [
        7,
        "bye",
    ],
}
```
