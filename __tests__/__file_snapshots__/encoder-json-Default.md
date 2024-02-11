# Timeline

## T=0 Message: client => server

```php
"{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"undefined\",\"params\":[]}"
```

## T=1 Log: server/log

```php
Array [
    "rpc.%cundefined%c(%c)
%o %c@0",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=2 Message: server => client

```php
"{\"jsonrpc\":\"2.0\",\"id\":0,\"result\":null}"
```

## T=3 Message: client => server

```php
"{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"deep_undefined\",\"params\":[]}"
```

## T=4 Log: server/log

```php
Array [
    "rpc.%cdeep_undefined%c(%c)
%o %c@1",
    "color: #d2c057",
    "",
    "",
    Promise {},
    "color: gray; font-style: italic;",
]
```

## T=5 Message: server => client

```php
"{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"a\":{\"b\":{}}}}"
```
