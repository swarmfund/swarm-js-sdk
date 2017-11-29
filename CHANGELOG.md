# Changelog

As this project is pre 1.0, breaking changes may happen for minor version bumps. A breaking change will get clearly notified in this log.

## 0.6.0

* **Breaking change** `CallBuilder.stream` now reconnects when no data was received for a long time.
This is to prevent permanent disconnects (more in: [#76](https://github.com/stellar/js-stellar-sdk/pull/76)).
Also, this method now returns `close` callback instead of `EventSource` object.
* **Breaking change** `Server.loadAccount` now returns the `AccountResponse` object.
* **Breaking change** Upgraded `stellar-base` to `0.6.0`. `ed25519` package is now an optional dependency. Check `StellarSdk.FastSigning` variable to check if `ed25519` package is available. More in README file.
* New `Config` class to set global config values.

## 0.5.1

* Fixed XDR decoding issue when using firefox

## 0.5.0

* **Breaking change** `Server` constructors no longer accept object in `serverUrl` parameter.
* **Breaking change** Removed `AccountCallBuilder.address` method. Use `AccountCallBuilder.accountId` instead.
* **Breaking change** It's no longer possible to connect to insecure server in `Server` unless `allowHttp` flag in `opts` is set.
* Updated dependencies.

## 0.4.3

* Updated dependency (`stellar-base`).

## 0.4.2

* Updated dependencies.
* Added tests.
* Added `CHANGELOG.md` file.

## 0.4.1

* `stellar-base` bump. (c90c68f)

## 0.4.0

* **Breaking change** Bumped `stellar-base` to [0.5.0](https://github.com/stellar/js-stellar-base/blob/master/CHANGELOG.md#050). (b810aef)
