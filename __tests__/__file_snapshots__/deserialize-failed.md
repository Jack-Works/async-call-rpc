# Timeline

## T=0 Message: client => server

```php
"invalid JSON"
```

## T=1 Log: server/log

```php
Array [
    [SyntaxError: Unexpected token 'i', "invalid JSON" is not valid JSON],
    undefined,
    undefined,
]
```

## T=2 Message: server => client

```php
"{\"jsonrpc\":\"2.0\",\"id\":null,\"error\":{\"code\":-32700,\"message\":\"Parse error\",\"data\":{\"stack\":\"<mocked stack>\",\"type\":\"SyntaxError\"}}}"
```

## T=3 Log: client/log

```php
Array [
    "SyntaxError: Parse error(-32700) %c@null
%c<mocked stack>",
    "color: gray",
    "",
]
```
