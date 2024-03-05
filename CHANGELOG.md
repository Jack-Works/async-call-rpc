# Changelog

## 6.4.1

### Patch Changes

- 609bfed: publish on jsr registry

## 6.4.0

### Minor Changes

- fd34f22: add a new `encoder` option and deprecate the old `serializer` option

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
  };

  // after
  const options = {
    channel,
  };
  ```

  ```ts
  // before
  const options = {
    channel,
    serializer: JSONSerialization(),
  };

  // after
  const options = {
    channel,
    encoder: JSONEncoder(),
  };
  ```

- fd34f22: `hint` added to the `CallbackBasedChannel.setup(jsonRPCHandlerCallback)` and `EventBasedChannel.on(listener)`.

  For an isomorphic instance of `AsyncCall` (used as both a server and a client),
  when a new message comes, it does not clear if to call `decodeRequest` or `decodeRespones`.

  This version introduces a new option `encoder` to replace `serialization`. `serialization` is always working in isomorphic way.

  - If `hint` is `"request"`, `(encoder as ServerEncoding).decodeRequest` will be called first, if this method does not exist, `(encoder as IsomorphicEncoder).decode` will be called.
  - If `hint` is `"response"`, `(encoder as ClientEncoding).decodeResponse` will be called first, if this method does not exist, `(encoder as IsomorphicEncoder).decode` will be called.
  - If `hint` is not present, only `encoder.decode` will be called.

- 0d0900b: rename "key" to "name"

- fd34f22: `BSON_Serialization` and `Msgpack_Serialization` is now deprecated

- 0431c15: rename `AsyncCallStrictJSONRPC` to `AsyncCallStrictOptions`

- 8a38d8b: add `signal` and `forceSignal` to stop the instance

- c9bbbd2: rename `parameterStructures` to `parameterStructure`

- fd34f22: expose JSON-RPC interfaces

- fd34f22: new built-in `JSONEncoder` for the new encode option.

### Patch Changes

- fd34f22: Add `Promise<void>` into return signature of `EventBasedChannel.send`

## 6.3.1

### Patch Changes

- 9561d3f: build: fix type declaration file not generated

## 6.3.0

### Minor Changes

- b9d8410: allow channel to be async

## 6.2.1

### Patch Changes

- 3cd9415: fix build file is missing

## 6.2.0

### Minor Changes

- 920074c: deprecate NoSerialization

### Patch Changes

- fbfa022: add provenance statements

## 6.1.5

### Patch Changes

- 78ab196: fix: types is missing in the release process

## 6.1.4

### Patch Changes

- 2d38ab4: fix getOwnPropertyDescriptor becomes invalid after optimized

## 6.1.3

### Patch Changes

- f4e2569: fix [[GetOwnPropertyDescriptor]] returns undefined

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [6.1.2](https://github.com/Jack-Works/async-call/compare/v6.1.1...v6.1.2) (2022-08-04)

### Bug Fixes

- batch not clear the queue after emit ([dc6807f](https://github.com/Jack-Works/async-call/commit/dc6807f11ea9ed1c5cb867f366c30b5d3f328de9))

### [6.1.1](https://github.com/Jack-Works/async-call/compare/v6.1.0...v6.1.1) (2022-07-27)

## [6.1.0](https://github.com/Jack-Works/async-call/compare/v6.0.3...v6.1.0) (2022-06-14)

### Features

- add AsyncVersionOf and AsyncGeneratorVersionOf improve UX require at least TypeScript 4.5 ([fc97167](https://github.com/Jack-Works/async-call/commit/fc97167610ac4220eb9b950a19c3850db5525f64))

### [6.0.3](https://github.com/Jack-Works/async-call/compare/v6.0.2...v6.0.3) (2022-06-14)

### [6.0.2](https://github.com/Jack-Works/async-call/compare/v6.0.1...v6.0.2) (2022-03-08)

### Bug Fixes

- Don't send message if websocket closed after callback ([75f105e](https://github.com/Jack-Works/async-call/commit/75f105e37531ddb381d294cb1ebe389c298bc477)), closes [/github.com/Jack-Works/async-call-rpc/blob/255e7ea0ca75165a902478e18a5991a82197cc9b/utils/deno/websocket.server.ts#L30](https://github.com/Jack-Works//github.com/Jack-Works/async-call-rpc/blob/255e7ea0ca75165a902478e18a5991a82197cc9b/utils/deno/websocket.server.ts/issues/L30)
- import folder ([11f0472](https://github.com/Jack-Works/async-call/commit/11f04723c8a5c38ab477960ab935a5a9c7697006))

### [6.0.1](https://github.com/Jack-Works/async-call/compare/v6.0.0...v6.0.1) (2021-11-20)

### Bug Fixes

- Don't send message if websocket closed ([1d9ef47](https://github.com/Jack-Works/async-call/commit/1d9ef47070f11dde040b902f16b75f38d34ee771))

## [6.0.0](https://github.com/Jack-Works/async-call/compare/v5.1.0...v6.0.0) (2021-08-30)

### ⚠ BREAKING CHANGES

- remove package exports shim, drop < Node 12.20.0

### Features

- remove package exports shim, drop < Node 12.20.0 ([e2222d7](https://github.com/Jack-Works/async-call/commit/e2222d776172b4f3dfc23c0480a019d25d000f9d))

## [5.1.0](https://github.com/Jack-Works/async-call/compare/v5.0.0...v5.1.0) (2021-05-25)

### Features

- add compat mode (WIP) ([eec99ee](https://github.com/Jack-Works/async-call/commit/eec99ee90f377c3eb0935e5b2c128d25f441b4c0))
- add msgpack serializer ([12cbb82](https://github.com/Jack-Works/async-call/commit/12cbb823f67d7da27a491f042ba1a29a67e1d3f6))

### Bug Fixes

- replay function looks not good in console when uncompressed close gh-30 ([d93176b](https://github.com/Jack-Works/async-call/commit/d93176beb164611248bfcfdb7a22ee00260731f2))

## [5.0.0](https://github.com/Jack-Works/async-call/compare/v4.2.1...v5.0.0) (2020-12-17)

### ⚠ BREAKING CHANGES

- Provide un-minified version #28
- improve typing, require at least TS 4.1

### Features

- add error handling of async initialization ([72105f1](https://github.com/Jack-Works/async-call/commit/72105f14886122eac59c97b63d2ae5fe1a97b6a2))
- improve typing, require at least TS 4.1 ([684e979](https://github.com/Jack-Works/async-call/commit/684e979b6d2ee6d07ae89ad4a72cee34aab932c6))
- Provide un-minified version [#28](https://github.com/Jack-Works/async-call/issues/28) ([78a059d](https://github.com/Jack-Works/async-call/commit/78a059d48dcd6ec9960f8fe90b83ef79e34f9637))
- return undefined for then by default (to avoid auto unwrap) ([df4a673](https://github.com/Jack-Works/async-call/commit/df4a673f8f7ea3698aa21da3c4a3da68e0aa21f2))

### Bug Fixes

- response sent in notify mode ([24ea1e7](https://github.com/Jack-Works/async-call/commit/24ea1e7e61324371c2c44269dafdd2afffa1784d))

### [4.2.1](https://github.com/Jack-Works/async-call/compare/v4.2.0...v4.2.1) (2020-11-13)

### Bug Fixes

- build error ([23219be](https://github.com/Jack-Works/async-call/commit/23219beca454ff00c77269d77b49c98762d939ec))

## [4.2.0](https://github.com/Jack-Works/async-call/compare/v4.1.0...v4.2.0) (2020-11-13)

### Features

- keep function identity between calls on AsyncCall ([0ba5ca6](https://github.com/Jack-Works/async-call/commit/0ba5ca6867bbdc9227e9e560916ad8d2a077e91e))
- keep function identity between calls on batch and generator ([95450f4](https://github.com/Jack-Works/async-call/commit/95450f4ecefd288fa8e86a2190de27dc424dfd22))
- new options for log "all", close [#23](https://github.com/Jack-Works/async-call/issues/23) ([38e3669](https://github.com/Jack-Works/async-call/commit/38e36692d3be660f2065861f47b26bb7d7c13f04))

### Bug Fixes

- batch will send functions into serialization ([e3136ac](https://github.com/Jack-Works/async-call/commit/e3136ac35e62588fbe556ff921f58258f3c04bdb))
- not call then if impl is not Promise, close [#24](https://github.com/Jack-Works/async-call/issues/24) ([be8c8de](https://github.com/Jack-Works/async-call/commit/be8c8de5e9dddee635daebde666945e6da3e5511))
- utils points to source leads to compilation in node_modules ([686f8e5](https://github.com/Jack-Works/async-call/commit/686f8e5442d2ab7c05714af49ebee5784490e15e))

## [4.1.0](https://github.com/Jack-Works/async-call/compare/v4.0.0...v4.1.0) (2020-08-23)

### Features

- add BSON serializer ([baee607](https://github.com/Jack-Works/async-call/commit/baee607392525ae6743cc67b3d816032b5ee4469))
- add WebWorker ([e4fa542](https://github.com/Jack-Works/async-call/commit/e4fa54211bfcdd5a769fb8969f4d5ef666fbb180))

## [4.0.0](https://github.com/Jack-Works/async-call/compare/v3.3.0...v4.0.0) (2020-07-19)

### ⚠ BREAKING CHANGES

- remove support for deprecated `messageChannel`
- `messageChannel` has renamed to `channel`

### Features

- remove support for deprecated messageChannel ([e6681f7](https://github.com/Jack-Works/async-call/commit/e6681f7a13624d955b98e9e10c38db73a652a6fa))

## [3.3.0](https://github.com/Jack-Works/async-call/compare/v3.2.2...v3.3.0) (2020-07-19)

### Deprecation

- Old MessageChannel is deprecated, please use new [CallbackBasedChannel](https://jack-works.github.io/async-call-rpc/async-call-rpc.callbackbasedchannel.html) or [EventBasedChannel](https://jack-works.github.io/async-call-rpc/async-call-rpc.eventbasedchannel.html).

### Features

- impl requestReplay in log, close [#22](https://github.com/Jack-Works/async-call/issues/22) ([d241b34](https://github.com/Jack-Works/async-call/commit/d241b34ddcb47313e74c96662cb16e39d7876d43))
- new interface for messageChannel and deprecates old, close [#19](https://github.com/Jack-Works/async-call/issues/19) ([7022b8c](https://github.com/Jack-Works/async-call/commit/7022b8c78235e53cd1215c12990f1e11bdfff01b))

### Bug Fixes

- install error ([4b3d78f](https://github.com/Jack-Works/async-call/commit/4b3d78fd106bd9384de001db33eb41b0958339be))

### [3.2.2](https://github.com/Jack-Works/async-call/compare/v3.2.1...v3.2.2) (2020-06-28)

### Bug Fixes

- support entry points for old platform that doesnt support exports field ([9a108cd](https://github.com/Jack-Works/async-call/commit/9a108cd55418d557b61f017db261f83902f8426e))

### [3.2.1](https://github.com/Jack-Works/async-call/compare/v3.2.0...v3.2.1) (2020-06-28)

### Bug Fixes

- entry points dts not exported ([28e51f0](https://github.com/Jack-Works/async-call/commit/28e51f0b85db1decdd4bcc1228447a67c46bbdbc))
- wrong url in readme ([ca2b581](https://github.com/Jack-Works/async-call/commit/ca2b581297bbc5831eaecea8e8a489438aeeb412))

## [3.2.0](https://github.com/Jack-Works/async-call/compare/v3.1.0...v3.2.0) (2020-06-27)

### Features

- start to provide builtin message channels ([d97381d](https://github.com/Jack-Works/async-call/commit/d97381d03a38b16dddfe8fbbf465af7443e43f1f))

## [3.1.0](https://github.com/Jack-Works/async-call/compare/v3.0.0...v3.1.0) (2020-06-27)

### Features

- add deno ws server ([c07d297](https://github.com/Jack-Works/async-call/commit/c07d297351b632ee32b1a382bdab5353788fd34d))
- add node websocket server ([6c0af32](https://github.com/Jack-Works/async-call/commit/6c0af327592e43df8cbd162278f435caaa4368f6))
- Support patch req/res in JSON RPC spec close [#9](https://github.com/Jack-Works/async-call/issues/9) ([9f91c51](https://github.com/Jack-Works/async-call/commit/9f91c51849617bd2b677e7b048b3e4e4c7112b67))
- support sending notifications close [#7](https://github.com/Jack-Works/async-call/issues/7) ([e9abca6](https://github.com/Jack-Works/async-call/commit/e9abca613e73b39cca06f2c5ebe9f1e3d858d7f3))

## [3.0.0](https://github.com/Jack-Works/async-call/compare/v2.0.2...v3.0.0) (2020-06-27)

### ⚠ BREAKING CHANGES

- Enable strict mode by default, if you need the non-strict behavior, switch "strict" to false.
- Move `strict.noUndefined` to 3rd parameter of JSONSerialization since only JSON needs it.
- The export version changed from `full` to `base`. If you need full version, please import from `async-call-rpc/full`.

### Features

- Add hook for custom Error data close [#8](https://github.com/Jack-Works/async-call/issues/8) ([2ab36bb](https://github.com/Jack-Works/async-call/commit/2ab36bb06c259ca7161a79f4ea649e15939f0966))
- change to strict by default, move undefined keeping to JSONSerialization ([d860da5](https://github.com/Jack-Works/async-call/commit/d860da52a88279fbadbb44982009ffc947426437))
- export base version by default ([6a11550](https://github.com/Jack-Works/async-call/commit/6a115507197a79694cd94a3dab6a517f913ff8ab))
- id generator, close [#13](https://github.com/Jack-Works/async-call/issues/13) ([d3c51b5](https://github.com/Jack-Works/async-call/commit/d3c51b59a7876bd0f14a76d8ee40a8dade5c65f2))
- preserve this binding, close [#16](https://github.com/Jack-Works/async-call/issues/16) ([69f1077](https://github.com/Jack-Works/async-call/commit/69f1077b6308e36aa99870c0257f2ed33897aef8))

### Bug Fixes

- server ignore sendLocalStack. close [#18](https://github.com/Jack-Works/async-call/issues/18) ([25629d3](https://github.com/Jack-Works/async-call/commit/25629d3f8ad74d23fb8a23184927117abf1ff725))

### [2.0.2](https://github.com/Jack-Works/async-call/compare/v2.0.1...v2.0.2) (2020-06-10)

### Bug Fixes

- umd not loadable; tslib not included ([a037da6](https://github.com/Jack-Works/async-call/commit/a037da6358b459066c65ac4f64e693e861e93f0e))

### [2.0.1](https://github.com/Jack-Works/async-call/compare/v2.0.0...v2.0.1) (2020-06-07)

### Bug Fixes

- wrong type path ([80c1e18](https://github.com/Jack-Works/async-call/commit/80c1e18ec093c1897eba2d48e23836ac909c7cbb))

## [2.0.0](https://github.com/Jack-Works/async-call/compare/v1.0.4...v2.0.0) (2020-06-07)

### ⚠ BREAKING CHANGES

- switch to node es module support
- switch to rollup

### Features

- add new logger ([16e2195](https://github.com/Jack-Works/async-call/commit/16e2195d327e78eb1385279811a94cc0f738c04d))
- dispose resource when iterator end ([ebfc5df](https://github.com/Jack-Works/async-call/commit/ebfc5dfafc2087d7fc5c3be7527e014442b839e1))
- preservePauseOnException ([2a7ebb1](https://github.com/Jack-Works/async-call/commit/2a7ebb10446507279e66448ec561068e7ec5061b))
- relax type on Serialization ([ecbc956](https://github.com/Jack-Works/async-call/commit/ecbc956b28f3bfad296355900fd15d537a1b73e8))
- support thisSideImpl as Promise ([db66d72](https://github.com/Jack-Works/async-call/commit/db66d72fefa4c2c76a41a3fe26338232fba0095f))
- switch to node es module support ([6e21733](https://github.com/Jack-Works/async-call/commit/6e217332c1f3b219212d5324ee9f62e2903de99a))
- switch to rollup ([81d4e4a](https://github.com/Jack-Works/async-call/commit/81d4e4a95d42a5b5c463b015a9f1d2b68470ffad))

### Bug Fixes

- build script ([42d701a](https://github.com/Jack-Works/async-call/commit/42d701aa5511abc11b4f7cebe3064d5c43b7f63e))
- close [#6](https://github.com/Jack-Works/async-call/issues/6) - Bug: Error when the thrown error doesn't a subclass of Error ([6229b7f](https://github.com/Jack-Works/async-call/commit/6229b7fcf40126ed1be416c0f907641bd2ba08ec))

### [1.0.4](https://github.com/Jack-Works/async-call/compare/v1.0.3...v1.0.4) (2019-12-23)

### [1.0.3](https://github.com/Jack-Works/async-call/compare/v1.0.2...v1.0.3) (2019-12-23)

### [1.0.2](https://github.com/Jack-Works/async-call/compare/v1.0.1...v1.0.2) (2019-12-23)

### [1.0.1](https://github.com/Jack-Works/async-call/compare/v1.0.0...v1.0.1) (2019-12-23)

### Bug Fixes

- change the package name ([234440c](https://github.com/Jack-Works/async-call/commit/234440c2a63d01aeea4f213ee5c07a7ecf9cb29b))

## 1.0.0 (2019-09-21)

### Features

- init publish ([8455f46](https://github.com/Jack-Works/async-call/commit/8455f46))
