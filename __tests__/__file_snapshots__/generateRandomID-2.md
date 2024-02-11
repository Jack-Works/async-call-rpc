# Timeline

## T=0 Message: client => server

```php
Object {
    "id": "ndom-id-1",
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

## T=1 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.start%c(%o, %o%c)
%o %c@ndom-id-1",
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

## T=2 Message: server => client

```php
Object {
    "id": "ndom-id-1",
    "jsonrpc": "2.0",
    "result": "ndom-id-2",
}
```

## T=3 Message: client => server

```php
Object {
    "id": "ndom-id-3",
    "jsonrpc": "2.0",
    "method": "rpc.async-iterator.next",
    "params": Array [
        "ndom-id-2",
        undefined,
    ],
}
```

## T=4 Log: server/log

```php
Array [
    "rpc.%crpc.async-iterator.next%c(%o, %o%c)
%o %c@ndom-id-3",
    "color:#d2c057",
    "",
    "ndom-id-2",
    undefined,
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=5 Message: server => client

```php
Object {
    "id": "ndom-id-3",
    "jsonrpc": "2.0",
    "result": Object {
        "done": true,
        "value": undefined,
    },
}
```
