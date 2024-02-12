# Timeline

## T=0 Log: testRunner/log

```php
Array [
    "Before this line no request was sent",
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
    "After this line no request was sent",
]
```

## T=6 Log: testRunner/log

```php
Array [
    "Part 1 end",
]
```

## T=7 Log: testRunner/log

```php
Array [
    "Part 2 start",
]
```

## T=8 Log: testRunner/log

```php
Array [
    "In this part it should has no log",
]
```

## T=9 Log: testRunner/log

```php
Array [
    "Part 2 end",
]
```
