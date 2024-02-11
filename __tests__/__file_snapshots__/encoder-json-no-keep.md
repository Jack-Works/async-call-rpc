# Timeline

## T=0 Message: client sent

```php
"{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"undefined\",\"params\":[]}"
```

## T=1 Message: client sent

```php
"{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"deep_undefined\",\"params\":[]}"
```

## T=2 Message: server received

```php
"{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"undefined\",\"params\":[]}"
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

## T=4 Message: server sent

```php
"{\"jsonrpc\":\"2.0\",\"id\":0}"
```

## T=5 Message: server received

```php
"{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"deep_undefined\",\"params\":[]}"
```

## T=6 Log: server/log

```php
Array [
    "rpc.%cdeep_undefined%c(%c)
%o %c@1",
    "color:#d2c057",
    "",
    "",
    Promise {},
    "color:gray;font-style:italic;",
]
```

## T=7 Message: server sent

```php
"{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"a\":{\"b\":{}}}}"
```

## T=8 Message: client received

```php
"{\"jsonrpc\":\"2.0\",\"id\":0}"
```

## T=9 Message: client received

```php
"{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"a\":{\"b\":{}}}}"
```
