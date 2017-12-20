"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var AccountCallBuilder = require("./account_call_builder").AccountCallBuilder;

var AccountResponse = require("./account_response").AccountResponse;

var Config = require("./config").Config;

var LedgerCallBuilder = require("./ledger_call_builder").LedgerCallBuilder;

var ReviewableRequestCallBuilder = require("./reviewable_request_call_builder").ReviewableRequestCallBuilder;

var TransactionCallBuilder = require("./transaction_call_builder").TransactionCallBuilder;

var OperationCallBuilder = require("./operation_call_builder").OperationCallBuilder;

var PaymentCallBuilder = require("./payment_call_builder").PaymentCallBuilder;

var UserCallBuilder = require("./user_call_builder").UserCallBuilder;

var FeeCallBuilder = require("./fee_call_builder").FeeCallBuilder;

var FeesOverviewCallBuilder = require("./fees_overview_call_builder").FeesOverviewCallBuilder;

var DefaultLimitsCallBuilder = require("./default_limits_call_builder").DefaultLimitsCallBuilder;

var DocumentCallBuilder = require("./document_call_builder").DocumentCallBuilder;

var ForfeitRequestCallBuilder = require("./forfeit_request_call_builder").ForfeitRequestCallBuilder;

var RecoveryRequestCallBuilder = require("./recovery_request_call_builder").RecoveryRequestCallBuilder;

var PaymentRequestCallBuilder = require("./payment_request_call_builder").PaymentRequestCallBuilder;

var ContactsCallBuilder = require("./contacts_call_builder").ContactsCallBuilder;

var ContactRequestCallBuilder = require("./contact_request_call_builder").ContactRequestCallBuilder;

var AssetCallBuilder = require("./asset_call_builder").AssetCallBuilder;

var BalanceCallBuilder = require("./balance_call_builder").BalanceCallBuilder;

var ExchangeCallBuilder = require("./exchange_call_builder").ExchangeCallBuilder;

var TrustCallBuilder = require("./trust_call_builder").TrustCallBuilder;

var NotificationsCallBuilder = require("./notifications_call_builder").NotificationsCallBuilder;

var OfferCallBuilder = require("./offer_call_builder").OfferCallBuilder;

var OrderBookCallBuilder = require("./order_book_call_builder").OrderBookCallBuilder;

var PublicInfoCallBuilder = require("./public_info_call_builder").PublicInfoCallBuilder;

var TradeCallBuilder = require("./trade_call_builder").TradeCallBuilder;

var PriceCallBuilder = require("./price_call_builder").PriceCallBuilder;

var _swarmJsBase = require("swarm-js-base");

var Account = _swarmJsBase.Account;
var hash = _swarmJsBase.hash;
var Operation = _swarmJsBase.Operation;
var xdr = _swarmJsBase.xdr;

var stellarBase = _interopRequire(_swarmJsBase);

var AssetPairCallBuilder = require("./asset_pair_call_builder").AssetPairCallBuilder;

var axios = require("axios");
var toBluebird = require("bluebird").resolve;
var URI = require("urijs");
var querystring = require("querystring");

var SUBMIT_TRANSACTION_TIMEOUT = 20 * 1000;

exports.SUBMIT_TRANSACTION_TIMEOUT = SUBMIT_TRANSACTION_TIMEOUT;

var Server = exports.Server = (function () {
    /**
     * Server handles the network connection to a [Horizon](https://www.stellar.org/developers/horizon/learn/index.html)
     * instance and exposes an interface for requests to that instance.
     * @constructor
     * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`).
     * @param {object} [opts]
     * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
     */

    function Server(serverURL) {
        var opts = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Server);

        this.serverURL = URI(serverURL);
        try {
            Config.setURLPrefix(this.serverURL.path());
            // it is necessary to delete the prefix after saving for the correct signature,
            // the prefix will be added before the call
            this.serverURL.segment([]);
        } catch (err) {
            console.log(err);
        }

        var allowHttp = Config.isAllowHttp();
        if (typeof opts.allowHttp !== "undefined") {
            allowHttp = opts.allowHttp;
        }

        if (this.serverURL.protocol() != "https" && !allowHttp) {
            throw new Error("Cannot connect to insecure horizon server");
        }
    }

    _createClass(Server, {
        submitOperation: {
            value: function submitOperation(op, sourceID, signerKP) {
                var multiSigTx = arguments[3] === undefined ? false : arguments[3];

                var source = new stellarBase.Account(sourceID);
                var tx = new stellarBase.TransactionBuilder(source).addOperation(op).build();
                tx.sign(signerKP);
                if (!!multiSigTx) {
                    return this.submitTransaction(tx, multiSigTx, signerKP);
                }
                return this.submitTransaction(tx);
            }
        },
        submitTransaction: {
            value: function submitTransaction(transaction, multiSigTx, keypair) {
                // proper call is submitTransactions(tx),
                // backend will handle pending flow auto-magically.
                if (multiSigTx !== undefined) {
                    console.error("DeprecationWarning: multiSigTx is deprecated");
                }
                if (keypair !== undefined) {
                    console.error("DeprecationWarning: keypair is deprecated");
                }
                var path = "transactions";
                var tx = transaction.toEnvelope().toXDR().toString("base64");

                var config = {
                    timeout: SUBMIT_TRANSACTION_TIMEOUT,
                    headers: {
                        "content-type": "application/json" }
                };

                var promise = axios.post(this._getURL(path), { tx: tx }, config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        var details = response.response;
                        if (details.status === 403 && details.request.response.indexOf("Two factor verification") !== -1) {
                            response.tfaData = {
                                config: config,
                                tx: response.config.data,
                                token: details.data.extras.token
                            };
                            return Promise.reject(response);
                        }
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        repeatTransaction: {
            value: function repeatTransaction(config, tx) {
                var path = "transactions";

                var promise = axios.post(this._getURL(path), tx, config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        accounts: {

            /**
             * Returns new {@link AccountCallBuilder} object configured by a current Horizon server configuration.
             * @returns {AccountCallBuilder}
             */

            value: function accounts() {
                return new AccountCallBuilder(URI(this.serverURL));
            }
        },
        contacts: {

            /**
             * Returns new {@link ContactsCallBuilder} object configured by a current Horizon server configuration.
             * @returns {ContactsCallBuilder}
             */

            value: function contacts() {
                return new ContactsCallBuilder(URI(this.serverURL));
            }
        },
        contactRequests: {

            /**
             * Returns new {@link ContactRequestCallBuilder} object configured by a current Horizon server configuration.
             * @returns {ContactRequestCallBuilder}
             */

            value: function contactRequests() {
                return new ContactRequestCallBuilder(URI(this.serverURL));
            }
        },
        ledgers: {

            /**
             * Returns new {@link LedgerCallBuilder} object configured by a current Horizon server configuration.
             * @returns {LedgerCallBuilder}
             */

            value: function ledgers() {
                return new LedgerCallBuilder(URI(this.serverURL));
            }
        },
        reviewableRequests: {

            /**
             * Returns new {@link ReviewableRequestCallBuilder} object configured by a current Horizon server configuration.
             * @returns {ReviewableRequestCallBuilder}
             */

            value: function reviewableRequests() {
                return new ReviewableRequestCallBuilder(URI(this.serverURL));
            }
        },
        transactions: {

            /**
             * Returns new {@link TransactionCallBuilder} object configured by a current Horizon server configuration.
             * @returns {TransactionCallBuilder}
             */

            value: function transactions() {
                return new TransactionCallBuilder(URI(this.serverURL));
            }
        },
        pendingTransactions: {

            /**
             * Returns new {@link PendingTransactionCallBuilder} object configured by a current Horizon server configuration.
             * and account id
             * @returns {PendingTransactionCallBuilder}
             */

            value: function pendingTransactions(accountId) {
                return new PendingTransactionCallBuilder(URI(this.serverURL), accountId);
            }
        },
        operations: {
            /**
             * Returns new {@link OperationCallBuilder} object configured by a current Horizon server configuration.
             * @returns {OperationCallBuilder}
             */

            value: function operations() {
                return new OperationCallBuilder(URI(this.serverURL));
            }
        },
        forfeitRequests: {
            value: function forfeitRequests() {
                return new ForfeitRequestCallBuilder(URI(this.serverURL));
            }
        },
        recoveryRequests: {
            value: function recoveryRequests() {
                return new RecoveryRequestCallBuilder(URI(this.serverURL));
            }
        },
        paymentRequests: {
            value: function paymentRequests() {
                return new PaymentRequestCallBuilder(URI(this.serverURL));
            }
        },
        assets: {
            value: function assets() {
                return new AssetCallBuilder(URI(this.serverURL));
            }
        },
        assetPairs: {
            value: function assetPairs() {
                return new AssetPairCallBuilder(URI(this.serverURL));
            }
        },
        balances: {
            value: function balances() {
                return new BalanceCallBuilder(URI(this.serverURL));
            }
        },
        exchanges: {
            value: function exchanges() {
                return new ExchangeCallBuilder(URI(this.serverURL));
            }
        },
        trusts: {
            value: function trusts() {
                return new TrustCallBuilder(URI(this.serverURL));
            }
        },
        orderBooks: {
            value: function orderBooks() {
                return new OrderBookCallBuilder(URI(this.serverURL));
            }
        },
        offers: {
            value: function offers() {
                return new OfferCallBuilder(URI(this.serverURL));
            }
        },
        notifications: {
            value: function notifications() {
                return new NotificationsCallBuilder(URI(this.serverURL));
            }
        },
        trades: {
            value: function trades() {
                return new TradeCallBuilder(URI(this.serverURL));
            }
        },
        prices: {
            value: function prices() {
                return new PriceCallBuilder(URI(this.serverURL));
            }
        },
        publicInfo: {
            value: function publicInfo() {
                return new PublicInfoCallBuilder(URI(this.serverURL));
            }
        },
        paths: {

            /**
             * The Stellar Network allows payments to be made between assets through path payments. A path payment specifies a
             * series of assets to route a payment through, from source asset (the asset debited from the payer) to destination
             * asset (the asset credited to the payee).
             *
             * A path search is specified using:
             *
             * * The destination address
             * * The source address
             * * The asset and amount that the destination account should receive
             *
             * As part of the search, horizon will load a list of assets available to the source address and will find any
             * payment paths from those source assets to the desired destination asset. The search's amount parameter will be
             * used to determine if there a given path can satisfy a payment of the desired amount.
             *
             * Returns new {@link PathCallBuilder} object configured with the current Horizon server configuration.
             *
             * @param {string} source The sender's account ID. Any returned path will use a source that the sender can hold.
             * @param {string} destination The destination account ID that any returned path should use.
             * @param {Asset} destinationAsset The destination asset.
             * @param {string} destinationAmount The amount, denominated in the destination asset, that any returned path should be able to satisfy.
             * @returns {@link PathCallBuilder}
             */

            value: function paths(source, destination, destinationAsset, destinationAmount) {
                return new PathCallBuilder(URI(this.serverURL), source, destination, destinationAsset, destinationAmount);
            }
        },
        payments: {

            /**
             * Returns new {@link PaymentCallBuilder} object configured with the current Horizon server configuration.
             * @returns {PaymentCallBuilder}
             */

            value: function payments() {
                return new PaymentCallBuilder(URI(this.serverURL));
            }
        },
        effects: {

            /**
             * Returns new {@link EffectCallBuilder} object configured with the current Horizon server configuration.
             * @returns {EffectCallBuilder}
             */

            value: function effects() {
                return new EffectCallBuilder(URI(this.serverURL));
            }
        },
        abxUsers: {

            /**
             * Returns new {@link AbxUserCallBuilder} object configured with the current Horizon server configuration.
             * @returns {AbxUserCallBuilder}
             */

            value: function abxUsers() {
                return new AbxUserCallBuilder(URI(this.serverURL));
            }
        },
        users: {

            /**
             * Returns new {@link RegRequestCallBuilder} object configured with the current Horizon server configuration.
             * @returns {UserCallBuilder}
             */

            value: function users() {
                return new UserCallBuilder(URI(this.serverURL));
            }
        },
        fees: {
            /**
            * Returns new {@link FeeCallBuilder} object configured with the current Horizon server configuration.
            * @returns {FeeCallBuilder}
            */

            value: function fees() {
                return new FeeCallBuilder(URI(this.serverURL));
            }
        },
        feesOverview: {
            /**
            * Returns new {@link FeesOverviewCallBuilder} object configured with the current Horizon server configuration.
            * @returns {FeesOverviewCallBuilder}
            */

            value: function feesOverview() {
                return new FeesOverviewCallBuilder(URI(this.serverURL));
            }
        },
        defaultLimits: {
            value: function defaultLimits() {
                return new DefaultLimitsCallBuilder(URI(this.serverURL));
            }
        },
        documents: {

            /**
             * Returns new {@link DocumentCallBuilder} object configured with the current Horizon server configuration.
             * @returns {DocumentCallBuilder}
             */

            value: function documents() {
                return new DocumentCallBuilder(URI(this.serverURL));
            }
        },
        loadAccount: {

            /**
             * Fetches an account's most current state in the ledger and then creates and returns an {@link Account} object.
             * @param {string} accountId - The account to load.
             * @returns {Promise} Returns a promise to the {@link AccountResponse} object with populated sequence number.
             */

            value: function loadAccount(accountId) {
                return this.accounts().accountId(accountId).call().then(function (res) {
                    return new AccountResponse(res);
                });
            }
        },
        loadAccountWithSign: {
            value: function loadAccountWithSign(accountId, keypair) {
                return this.accounts().accountId(accountId).callWithSignature(keypair).then(function (res) {
                    return new AccountResponse(res);
                });
            }
        },
        approveRegistration: {

            /* User POST Requests to the Horizon */
            // TODO: Add JsDoc

            value: function approveRegistration(userData, transaction, keypair) {
                var tx = "";
                if (transaction !== "") tx = transaction.toEnvelope().toXDR().toString("base64");

                userData.tx = tx;
                return this._sendUserPostRequest(userData, "users/approve", keypair);
            }
        },
        rejectPendingTransaction: {
            value: function rejectPendingTransaction(txHash, keypair) {
                var endpoint = "/transactions/" + txHash;
                var config = this._getConfig(endpoint, keypair);
                config.headers["content-type"] = "application/json";
                var promise = axios.patch(this._getURL(endpoint), { state: 3 }, config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        deletePendingTransaction: {
            value: function deletePendingTransaction(txHash, keypair) {
                var endpoint = "/transactions/" + txHash;
                var config = this._getConfig(endpoint, keypair);
                config.headers["content-type"] = "application/json";
                var promise = axios["delete"](this._getURL(endpoint), config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        createUser: {
            value: function createUser(params, keypair) {
                var prefix = "users/create";
                return this._sendUserPostRequest(params, prefix, keypair);
            }
        },
        updateUser: {
            value: function updateUser(params, keypair) {
                var prefix = "users/update";
                return this._sendUserPostRequest(params, prefix, keypair);
            }
        },
        sendDocs: {

            /**
             * Store user verification document
             * @param {object} params.
             * @param {string} params.accountId - Source account.
             * @param {string} params.type - Type of the document.
             * @param {string} params.name - File name.
             * @param {string} params.file - DataUrl encoded file.
             * @returns {Promise} Returns a promise.
             */

            value: function sendDocs(params, keypair) {
                var prefix = "users/" + params.accountId + "/documents/" + params.type;
                return this._sendUserPostRequest(params, prefix, keypair);
            }
        },
        deleteWallet: {
            value: function deleteWallet(username, keypair) {
                var prefix = "users/unverified/delete";
                return this._sendUserPostRequest({ username: username }, prefix, keypair);
            }
        },
        resendToken: {
            value: function resendToken(username, keypair) {
                var prefix = "users/unverified/resend_token";
                return this._sendUserPostRequest({ username: username }, prefix, keypair);
            }
        },
        addContact: {

            /**
             * Store user verification document
             * @param {object} params
             * @param {string} params.userId - AccountId of the source.
             * @param {string} params.account_id - AccountId of the contact.
             * @param {string} params.nickname - Pretty name for `params.counterpartyId`.
             * @returns {Promise} Returns a promise.
             */

            value: function addContact(params, keypair) {
                var prefix = "users/" + params.userId + "/contacts";
                var config = this._getConfig("/" + prefix, keypair);
                var promise = axios.post(this._getURL(prefix), querystring.stringify(params), config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        updateContact: {

            /**
             * Store user verification document
             * @param {object} params
             * @param {string} params.userId - AccountId of the source.
             * @param {string} params.contactId - Id of the contact.
             * @param {string} params.account_id - AccountId of the contact.
             * @param {string} params.nickname - Name of the contact.
             * @returns {Promise} Returns a promise.
             */

            value: function updateContact(params, keypair) {
                var prefix = "users/" + params.userId + "/contacts/" + params.account_id;
                var config = this._getConfig("/" + prefix, keypair);
                var promise = axios.patch(this._getURL(prefix), querystring.stringify(params), config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        deleteContact: {

            /**
             * Store user verification document
             * @param {object} params
             * @param {string} params.userId - AccountId of the source.
             * @param {string} params.contactId - Id of the contact.
             * @returns {Promise} Returns a promise.
             */

            value: function deleteContact(params, keypair) {
                var prefix = "users/" + params.userId + "/contacts/" + params.contactId;
                var config = this._getConfig("/" + prefix, keypair);
                var promise = axios["delete"](this._getURL(prefix), config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        sendContactRequest: {
            value: function sendContactRequest(params, keypair) {
                var requestData = { email: params.email };
                var prefix = "users/" + params.account_id + "/contacts/requests";
                var config = this._getConfig("/" + prefix, keypair);
                config.headers["Content-Type"] = "application/json";
                var promise = axios.post(this._getURL(prefix), requestData, config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        updateContactRequest: {
            value: function updateContactRequest(params, keypair) {
                var requestData = { state: params.state };
                var prefix = "users/" + params.account_id + "/contacts/requests/" + params.request_id;
                var config = this._getConfig("/" + prefix, keypair);
                config.headers["Content-Type"] = "application/json";
                var promise = axios.patch(this._getURL(prefix), requestData, config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        _sendUserPostRequest: {
            value: function _sendUserPostRequest(params, prefix, keypair) {
                var isJson = arguments[3] === undefined ? false : arguments[3];

                var requestData = {};
                var config = this._getConfig("/" + prefix, keypair);
                if (isJson) {
                    config.headers["Content-Type"] = "application/json";
                    requestData = params;
                } else {
                    requestData = querystring.stringify(params);
                }

                var promise = axios.post(this._getURL(prefix), requestData, config).then(function (response) {
                    return response.data;
                })["catch"](function (response) {
                    if (response instanceof Error) {
                        return Promise.reject(response);
                    } else {
                        return Promise.reject(response.data);
                    }
                });
                return toBluebird(promise);
            }
        },
        _getConfig: {
            value: function _getConfig(address, keypair) {
                var SIGNATURE_VALID_SEC = 60;
                var validUntil = Math.floor(new Date().getTime() / 1000 + SIGNATURE_VALID_SEC).toString();
                //temporary. should be fixed or refactored
                var signatureBase = "{ uri: '" + address + "', valid_untill: '" + validUntil.toString() + "'}";
                keypair = stellarBase.Keypair.fromRawSeed(keypair._secretSeed);
                var data = hash(signatureBase);

                var signature = keypair.signDecorated(data);
                return {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-AuthValidUnTillTimestamp": validUntil.toString(),
                        "X-AuthPublicKey": keypair.accountId(),
                        "X-AuthSignature": signature.toXDR("base64")
                    },
                    timeout: SUBMIT_TRANSACTION_TIMEOUT };
            }
        },
        _getURL: {
            value: function _getURL(prefix) {
                var filters = [prefix];
                if (Config.isURLPrefix() === true) {
                    filters = Config.getURLPrefixedPath(prefix);
                }

                return URI(this.serverURL).segment(filters).toString();
            }
        }
    });

    return Server;
})();