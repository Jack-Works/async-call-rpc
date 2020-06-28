# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.2.1](https://github.com/Jack-Works/async-call/compare/v3.2.0...v3.2.1) (2020-06-28)


### Bug Fixes

* entry points dts not exported ([28e51f0](https://github.com/Jack-Works/async-call/commit/28e51f0b85db1decdd4bcc1228447a67c46bbdbc))
* wrong url in readme ([ca2b581](https://github.com/Jack-Works/async-call/commit/ca2b581297bbc5831eaecea8e8a489438aeeb412))

## [3.2.0](https://github.com/Jack-Works/async-call/compare/v3.1.0...v3.2.0) (2020-06-27)


### Features

* start to provide builtin message channels ([d97381d](https://github.com/Jack-Works/async-call/commit/d97381d03a38b16dddfe8fbbf465af7443e43f1f))

## [3.1.0](https://github.com/Jack-Works/async-call/compare/v3.0.0...v3.1.0) (2020-06-27)


### Features

* add deno ws server ([c07d297](https://github.com/Jack-Works/async-call/commit/c07d297351b632ee32b1a382bdab5353788fd34d))
* add node websocket server ([6c0af32](https://github.com/Jack-Works/async-call/commit/6c0af327592e43df8cbd162278f435caaa4368f6))
* Support patch req/res in JSON RPC spec close [#9](https://github.com/Jack-Works/async-call/issues/9) ([9f91c51](https://github.com/Jack-Works/async-call/commit/9f91c51849617bd2b677e7b048b3e4e4c7112b67))
* support sending notifications close [#7](https://github.com/Jack-Works/async-call/issues/7) ([e9abca6](https://github.com/Jack-Works/async-call/commit/e9abca613e73b39cca06f2c5ebe9f1e3d858d7f3))

## [3.0.0](https://github.com/Jack-Works/async-call/compare/v2.0.2...v3.0.0) (2020-06-27)


### ⚠ BREAKING CHANGES

-   Enable strict mode by default, if you need the non-strict behavior, switch "strict" to false.
-   Move `strict.noUndefined` to 3rd parameter of JSONSerialization since only JSON needs it.
-   The export version changed from `full` to `base`. If you need full version, please import from `async-call-rpc/full`.

### Features

* Add hook for custom Error data close [#8](https://github.com/Jack-Works/async-call/issues/8) ([2ab36bb](https://github.com/Jack-Works/async-call/commit/2ab36bb06c259ca7161a79f4ea649e15939f0966))
* change to strict by default, move undefined keeping to JSONSerialization ([d860da5](https://github.com/Jack-Works/async-call/commit/d860da52a88279fbadbb44982009ffc947426437))
* export base version by default ([6a11550](https://github.com/Jack-Works/async-call/commit/6a115507197a79694cd94a3dab6a517f913ff8ab))
* id generator, close [#13](https://github.com/Jack-Works/async-call/issues/13) ([d3c51b5](https://github.com/Jack-Works/async-call/commit/d3c51b59a7876bd0f14a76d8ee40a8dade5c65f2))
* preserve this binding, close [#16](https://github.com/Jack-Works/async-call/issues/16) ([69f1077](https://github.com/Jack-Works/async-call/commit/69f1077b6308e36aa99870c0257f2ed33897aef8))


### Bug Fixes

* server ignore sendLocalStack. close [#18](https://github.com/Jack-Works/async-call/issues/18) ([25629d3](https://github.com/Jack-Works/async-call/commit/25629d3f8ad74d23fb8a23184927117abf1ff725))

### [2.0.2](https://github.com/Jack-Works/async-call/compare/v2.0.1...v2.0.2) (2020-06-10)


### Bug Fixes

* umd not loadable; tslib not included ([a037da6](https://github.com/Jack-Works/async-call/commit/a037da6358b459066c65ac4f64e693e861e93f0e))

### [2.0.1](https://github.com/Jack-Works/async-call/compare/v2.0.0...v2.0.1) (2020-06-07)


### Bug Fixes

* wrong type path ([80c1e18](https://github.com/Jack-Works/async-call/commit/80c1e18ec093c1897eba2d48e23836ac909c7cbb))

## [2.0.0](https://github.com/Jack-Works/async-call/compare/v1.0.4...v2.0.0) (2020-06-07)


### ⚠ BREAKING CHANGES

* switch to node es module support
* switch to rollup

### Features

* add new logger ([16e2195](https://github.com/Jack-Works/async-call/commit/16e2195d327e78eb1385279811a94cc0f738c04d))
* dispose resource when iterator end ([ebfc5df](https://github.com/Jack-Works/async-call/commit/ebfc5dfafc2087d7fc5c3be7527e014442b839e1))
* preservePauseOnException ([2a7ebb1](https://github.com/Jack-Works/async-call/commit/2a7ebb10446507279e66448ec561068e7ec5061b))
* relax type on Serialization ([ecbc956](https://github.com/Jack-Works/async-call/commit/ecbc956b28f3bfad296355900fd15d537a1b73e8))
* support thisSideImpl as Promise ([db66d72](https://github.com/Jack-Works/async-call/commit/db66d72fefa4c2c76a41a3fe26338232fba0095f))
* switch to node es module support ([6e21733](https://github.com/Jack-Works/async-call/commit/6e217332c1f3b219212d5324ee9f62e2903de99a))
* switch to rollup ([81d4e4a](https://github.com/Jack-Works/async-call/commit/81d4e4a95d42a5b5c463b015a9f1d2b68470ffad))


### Bug Fixes

* build script ([42d701a](https://github.com/Jack-Works/async-call/commit/42d701aa5511abc11b4f7cebe3064d5c43b7f63e))
* close [#6](https://github.com/Jack-Works/async-call/issues/6) - Bug: Error when the thrown error doesn't a subclass of Error ([6229b7f](https://github.com/Jack-Works/async-call/commit/6229b7fcf40126ed1be416c0f907641bd2ba08ec))

### [1.0.4](https://github.com/Jack-Works/async-call/compare/v1.0.3...v1.0.4) (2019-12-23)

### [1.0.3](https://github.com/Jack-Works/async-call/compare/v1.0.2...v1.0.3) (2019-12-23)

### [1.0.2](https://github.com/Jack-Works/async-call/compare/v1.0.1...v1.0.2) (2019-12-23)

### [1.0.1](https://github.com/Jack-Works/async-call/compare/v1.0.0...v1.0.1) (2019-12-23)


### Bug Fixes

* change the package name ([234440c](https://github.com/Jack-Works/async-call/commit/234440c2a63d01aeea4f213ee5c07a7ecf9cb29b))

## 1.0.0 (2019-09-21)


### Features

* init publish ([8455f46](https://github.com/Jack-Works/async-call/commit/8455f46))
