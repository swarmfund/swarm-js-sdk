
# accounts()

AccountCallBuilder ⇐ `CallBuilder`

## Overview

In order to read information about accounts from a Horizon server, the [`server`](./server.md) object provides the `accounts()` function. `accounts()` returns an `AccountCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

By default, `accounts()` provides access to the `accounts_all` Horizon endpoint.  By chaining an account address to it, you can reach the [`accounts_single`] endpoint.

## Methods

| Method                             | Param Type         | Description                              |
| ---------------------------------- | ------------------ | ---------------------------------------- |
| `accounts()`                       |                    | Access all accounts.                     |
| `.accountId("id")`                 | `string`           | Pass in the ID of the account you're interested in to reach its details. |
| `.balances("accountId")`           | `string`           | Returns list of the balances for passed account. |
| `.signer("accountId", "signerId")` | `string`, `string` | Returns object with details of the passed  account signer. |

## Examples

```js
var JsSdk = require('js-sdk');
var server = new JsSdk.Server('https://staging.api.sun.swarm.fund');

server.accounts()
  .accountId("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ")
  .call()
  .then(function (accountResult) {
    console.log(accountResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
