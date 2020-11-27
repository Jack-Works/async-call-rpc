# Timeline

## T=0 Message: client => server

```php
"{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"undefined\",\"params\":[]}"
```

## T=1 Log: server/log

```php
Array [
    "jsonrpc.%cundefined%c(%c)
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
