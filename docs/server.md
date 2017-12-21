# Server

## Overview

The `server` object handles a network connection to the `Horizon` server.  It provides methods that makes requests to that Horizon server easy.

It is important to note that `server` methods query to `Horizon` endpoints.  Each method points to a particular set of endpoints -- for example, `accounts()` queries `accounts_all` or `accounts_single`.  In order to specify exactly which of the two, more methods are provided after calling `accounts()`.  For more, please see the documentation for [`CallBuilder`][4] and for each of the methods belonging to `server`.

## Parameters

| Parameter         | Type      | Required | Description                              |
| ----------------- | --------- | -------- | ---------------------------------------- |
| `config`          | `object`  | No       | The server configuration                 |
| `config.secure`   | `boolean` | No       | If `true`, establishes a connection with HTTPS instead of HTTP.  Defaults `false`. |
| `config.hostname` | `string`  | No       | The hostname of the Horizon server.  Defaults to `localhost`. |
| `config.port`     | `integer` | No       | The port of the Horizon server to connect to.  Defaults to 3000. |

## Methods

| Method         | Params                       | Description                              |
| -------------- | ---------------------------- | ---------------------------------------- |
| `accounts()`     | None                         | Returns an `AccountCallBuilder` with methods to query account endpoints. |
| `fees()`      | None                         | Returns a `FeesCallBuilder` with methods to query fees endpoints. | 
| `feesOverview()`      | None                         | Returns a `FeesOverviewCallBuilder` with methods to query fees_overview endpoints. | 
| `ledgers()`      | None                         | Returns a `LedgerCallBuilder` with methods to query ledger endpoints. | 
| `transactions()` | None                         | Returns a `TransactionCallBuilder` with methods to query transaction endpoints. |
| `operations()`   | None                         | Returns an `OperationsCallBuilder` with methods to query operation endpoints. | 
| `payments()`     | None                         | Returns a `PaymentCallBuilder` with methods to query payment endpoints. | 
| `effects()`      | None                         | Returns an `EffectCallBuilder` with methods to query effect endpoints. | 
| `reviewableRequests()`      | None                         | Returns a `ReviewableRequestsCallBuilder` with methods to query reviewable requests endpoints. | 
| `users()`      | None                         | Returns an`UsersCallBuilder` with methods to query users endpoints. | 
| `withdrawals()`      | None                         | Returns an`WithdrawalsCallBuilder` with methods to query withdrawals endpoints. | 
| `loadAccount(accountId)`      | `string`                         | Load an `Account` details by passed accountID. | 

### Examples

```js
var JsSdk = require('js-sdk');
var server = new JsSdk.Server('https://staging.api.sun.swarm.fund');

server.accounts()
  ...
```