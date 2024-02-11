# Timeline

## T=0 Message: client => server

```php
Object {
    "id": 0,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.start",
    "params": Array [
        "endless",
        Array [],
    ],
}
```

## T=1 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.start%c(%o, %o%c)
%o %c@0",
    "color:#d2c057",
    "",
    "endless",
    Array [],
    "",
    Promise {},
    "color:gray;font-style:italic;",
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
    "rpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@2",
    "color:#d2c057",
    "",
    1,
    undefined,
    "",
    Promise {},
    "color:gray;font-style:italic;",
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
    "method": "rpc.async-iterator.return",
    "params": Array [
        1,
        Object {},
    ],
}
```

## T=7 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.return%c(%o, %o%c)
%o %c@3",
    "color:#d2c057",
    "",
    1,
    Object {},
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=8 Message: server => client

```php
Object {
    "id": 3,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 1,
    },
}
```

## T=9 Message: client => server

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.throw",
    "params": Array [
        1,
        Object {},
    ],
}
```

## T=10 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.throw%c(%o, %o%c)
%o %c@4",
    "color:#d2c057",
    "",
    1,
    Object {},
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=11 Message: server => client

```php
Object {
    "id": 4,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 2,
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
        Object {},
    ],
}
```

## T=13 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@5",
    "color:#d2c057",
    "",
    1,
    Object {},
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=14 Message: server => client

```php
Object {
    "id": 5,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 1,
    },
}
```

## T=15 Message: client => server

```php
Object {
    "id": 6,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        1,
        Object {},
    ],
}
```

## T=16 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@6",
    "color:#d2c057",
    "",
    1,
    Object {},
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=17 Message: server => client

```php
Object {
    "id": 6,
    "jsonrpc": "2.0",
    "result": Object {
        "done": false,
        "value": 1,
    },
}
```

## T=18 Message: client => server

```php
Object {
    "id": 7,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.start",
    "params": Array [
        "echo",
        Array [
            Array [],
        ],
    ],
}
```

## T=19 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.start%c(%o, %o%c)
%o %c@7",
    "color:#d2c057",
    "",
    "echo",
    Array [
        Array [],
    ],
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=20 Message: server => client

```php
Object {
    "id": 7,
    "jsonrpc": "2.0",
    "result": 8,
}
```

## T=21 Message: client => server

```php
Object {
    "id": 9,
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        8,
        undefined,
    ],
}
```

## T=22 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@9",
    "color:#d2c057",
    "",
    8,
    undefined,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=23 Message: server => client

```php
Object {
    "id": 9,
    "jsonrpc": "2.0",
    "result": Object {
        "done": true,
        "value": undefined,
    },
}
```
