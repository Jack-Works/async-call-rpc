---
'async-call-rpc': minor
---

add new `encoder` option and deprecate old `serializer` option

how to migrate:

```ts
// before
const options = {
    channel,
    serializer: {
        serialization(data) { return ... },
        deserialization(data) { return ... },
    },
}

// after
const options = {
    channel,
    encoder: {
        encode(data) { return ... },
        decode(data) { return ... },
    },
}
```

```ts
// before
const options = {
    channel,
    serializer: NoSerialization,
}

// after
const options = {
    channel,
}
```

```ts
// before
const options = {
    channel,
    serializer: JSONSerialization(),
}

// after
const options = {
    channel,
    encoder: JSONEncoder(),
}
```
