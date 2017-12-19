import { AccountCallBuilder } from "./account_call_builder";
import { AccountResponse } from "./account_response";
import { Config } from "./config";
import { LedgerCallBuilder } from "./ledger_call_builder";
import { ReviewableRequestCallBuilder } from "./reviewable_request_call_builder";
import { TransactionCallBuilder } from "./transaction_call_builder";
import { OperationCallBuilder } from "./operation_call_builder";
import { PaymentCallBuilder } from "./payment_call_builder";
import { UserCallBuilder } from "./user_call_builder";
import { FeeCallBuilder } from "./fee_call_builder";
import { FeesOverviewCallBuilder } from "./fees_overview_call_builder";
import { DefaultLimitsCallBuilder } from "./default_limits_call_builder";
import { DocumentCallBuilder } from "./document_call_builder";
import { ForfeitRequestCallBuilder } from "./forfeit_request_call_builder";
import { RecoveryRequestCallBuilder } from "./recovery_request_call_builder";
import { PaymentRequestCallBuilder } from "./payment_request_call_builder";
import { ContactsCallBuilder } from "./contacts_call_builder";
import { ContactRequestCallBuilder } from './contact_request_call_builder';
import { AssetCallBuilder } from "./asset_call_builder";
import { AssetPairCallBuilder } from "./asset_pair_call_builder";
import { BalanceCallBuilder } from "./balance_call_builder";
import { ExchangeCallBuilder } from "./exchange_call_builder";
import { TrustCallBuilder } from "./trust_call_builder";
import { NotificationsCallBuilder } from "./notifications_call_builder";
import { OfferCallBuilder } from "./offer_call_builder";
import { OrderBookCallBuilder } from "./order_book_call_builder";
import { PublicInfoCallBuilder } from "./public_info_call_builder";
import { TradeCallBuilder } from "./trade_call_builder";
import { PriceCallBuilder } from "./price_call_builder";
import { Account, hash, Operation, xdr } from "swarm-js-base";
import stellarBase from 'swarm-js-base';

let axios = require("axios");
let toBluebird = require("bluebird").resolve;
let URI = require("urijs");
let querystring = require('querystring');

export const SUBMIT_TRANSACTION_TIMEOUT = 20 * 1000;

export class Server {
    /**
     * Server handles the network connection to a [Horizon](https://www.stellar.org/developers/horizon/learn/index.html)
     * instance and exposes an interface for requests to that instance.
     * @constructor
     * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`).
     * @param {object} [opts]
     * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
     */
    constructor(serverURL, opts = {}) {
        this.serverURL = URI(serverURL);
        try{
            Config.setURLPrefix(this.serverURL.path());
            // it is necessary to delete the prefix after saving for the correct signature,
            // the prefix will be added before the call
            this.serverURL.segment([]);
        } catch(err) {
            console.log(err);
        }


        let allowHttp = Config.isAllowHttp();
        if (typeof opts.allowHttp !== 'undefined') {
            allowHttp = opts.allowHttp;
        }

        if (this.serverURL.protocol() != 'https' && !allowHttp) {
            throw new Error('Cannot connect to insecure horizon server');
        }
    }

    submitOperation(op, sourceID, signerKP, multiSigTx = false) {
        let source = new stellarBase.Account(sourceID);
        let tx = new stellarBase.TransactionBuilder(source)
          .addOperation(op)
          .build();
        tx.sign(signerKP);
        if (!!multiSigTx) {
            return this.submitTransaction(tx, multiSigTx, signerKP);
        }
        return this.submitTransaction(tx);
    }

    submitTransaction(transaction, multiSigTx, keypair) {
        // proper call is submitTransactions(tx),
        // backend will handle pending flow auto-magically.
        if (multiSigTx !== undefined) {
            console.error("DeprecationWarning: multiSigTx is deprecated");
        }
        if (keypair !== undefined) {
            console.error("DeprecationWarning: keypair is deprecated");
        }
        let path = "transactions";
        let tx = transaction.toEnvelope().toXDR().toString("base64");

        let config = {
            timeout: SUBMIT_TRANSACTION_TIMEOUT,
            headers: {
                'content-type': 'application/json',
            }
        };

        const repeatDetails = {
            config: config,
            tx: tx
        };

        let promise = axios.post(this._getURL(path), { tx }, config)
            .then(response => response.data)
            .catch(error => {
                if (error instanceof Error) {
                    const details = error.response;
                    if (details.status === 403) {
                        error.repeatDetails = repeatDetails;
                    }
                    return Promise.reject(error);
                }
                return Promise.reject(error.data);
            });
        return toBluebird(promise);
    }

    repeatTransaction(config, tx) {
      var path = 'transactions';

      let promise = axios.post(
        this._getURL(path), { tx }, config)
            .then(function(response) {
              return response.data;
            })
            .catch(function(response) {
              if (response instanceof Error) {
                return Promise.reject(response);
              } else {
                return Promise.reject(response.data);
              }
            });
      return toBluebird(promise);
    }

    /**
     * Returns new {@link AccountCallBuilder} object configured by a current Horizon server configuration.
     * @returns {AccountCallBuilder}
     */
    accounts() {
        return new AccountCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link ContactsCallBuilder} object configured by a current Horizon server configuration.
     * @returns {ContactsCallBuilder}
     */
    contacts() {
        return new ContactsCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link ContactRequestCallBuilder} object configured by a current Horizon server configuration.
     * @returns {ContactRequestCallBuilder}
     */
    contactRequests() {
        return new ContactRequestCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link LedgerCallBuilder} object configured by a current Horizon server configuration.
     * @returns {LedgerCallBuilder}
     */
    ledgers() {
        return new LedgerCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link ReviewableRequestCallBuilder} object configured by a current Horizon server configuration.
     * @returns {ReviewableRequestCallBuilder}
     */
    reviewableRequests() {
        return new ReviewableRequestCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link TransactionCallBuilder} object configured by a current Horizon server configuration.
     * @returns {TransactionCallBuilder}
     */
    transactions() {
        return new TransactionCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link PendingTransactionCallBuilder} object configured by a current Horizon server configuration.
     * and account id
     * @returns {PendingTransactionCallBuilder}
     */
    pendingTransactions(accountId) {
        return new PendingTransactionCallBuilder(URI(this.serverURL), accountId);
    }
    /**
     * Returns new {@link OperationCallBuilder} object configured by a current Horizon server configuration.
     * @returns {OperationCallBuilder}
     */
    operations() {
        return new OperationCallBuilder(URI(this.serverURL));
    }

    forfeitRequests() {
        return new ForfeitRequestCallBuilder(URI(this.serverURL));
    }

    recoveryRequests() {
        return new RecoveryRequestCallBuilder(URI(this.serverURL));
    }

    paymentRequests() {
        return new PaymentRequestCallBuilder(URI(this.serverURL));
    }

    assets() {
        return new AssetCallBuilder(URI(this.serverURL));
    }

    assetPairs () {
        return new AssetPairCallBuilder(URI(this.serverURL));
    }

    balances() {
        return new BalanceCallBuilder(URI(this.serverURL));
    }

    exchanges() {
        return new ExchangeCallBuilder(URI(this.serverURL));
    }

    trusts() {
        return new TrustCallBuilder(URI(this.serverURL));
    }

    orderBooks() {
        return new OrderBookCallBuilder(URI(this.serverURL));
    }

    offers() {
        return new OfferCallBuilder(URI(this.serverURL));
    }

    notifications () {
        return new NotificationsCallBuilder(URI(this.serverURL));
    }

    trades() {
        return new TradeCallBuilder(URI(this.serverURL));
    }

    prices() {
        return new PriceCallBuilder(URI(this.serverURL));
    }

    publicInfo() {
        return new PublicInfoCallBuilder(URI(this.serverURL));
    }

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
    paths(source, destination, destinationAsset, destinationAmount) {
        return new PathCallBuilder(URI(this.serverURL), source, destination, destinationAsset, destinationAmount);
    }

    /**
     * Returns new {@link PaymentCallBuilder} object configured with the current Horizon server configuration.
     * @returns {PaymentCallBuilder}
     */
    payments() {
        return new PaymentCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link EffectCallBuilder} object configured with the current Horizon server configuration.
     * @returns {EffectCallBuilder}
     */
    effects() {
        return new EffectCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link AbxUserCallBuilder} object configured with the current Horizon server configuration.
     * @returns {AbxUserCallBuilder}
     */
    abxUsers() {
        return new AbxUserCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link RegRequestCallBuilder} object configured with the current Horizon server configuration.
     * @returns {UserCallBuilder}
     */
    users() {
        return new UserCallBuilder(URI(this.serverURL));
    }
     /**
     * Returns new {@link FeeCallBuilder} object configured with the current Horizon server configuration.
     * @returns {FeeCallBuilder}
     */
    fees() {
        return new FeeCallBuilder(URI(this.serverURL));
    }
     /**
     * Returns new {@link FeesOverviewCallBuilder} object configured with the current Horizon server configuration.
     * @returns {FeesOverviewCallBuilder}
     */
    feesOverview() {
       return new FeesOverviewCallBuilder(URI(this.serverURL));
    }

    defaultLimits() {
        return new DefaultLimitsCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link DocumentCallBuilder} object configured with the current Horizon server configuration.
     * @returns {DocumentCallBuilder}
     */
    documents() {
        return new DocumentCallBuilder(URI(this.serverURL));
    }

    /**
     * Fetches an account's most current state in the ledger and then creates and returns an {@link Account} object.
     * @param {string} accountId - The account to load.
     * @returns {Promise} Returns a promise to the {@link AccountResponse} object with populated sequence number.
     */
    loadAccount(accountId) {
        return this.accounts()
            .accountId(accountId)
            .call()
            .then(function(res) {
                return new AccountResponse(res);
            });
    }
    loadAccountWithSign(accountId, keypair) {
        return this.accounts()
            .accountId(accountId)
            .callWithSignature(keypair)
            .then(function(res) {
                return new AccountResponse(res);
            });
    }

    /* User POST Requests to the Horizon */
    // TODO: Add JsDoc
    approveRegistration(userData, transaction, keypair) {
        let tx = "";
        if (transaction !== "")
           tx = transaction.toEnvelope().toXDR().toString("base64");

        userData.tx = tx;
        return this._sendUserPostRequest(userData, 'users/approve', keypair);
    }

    rejectPendingTransaction(txHash, keypair) {
        let endpoint = `/transactions/${txHash}`;
        let config = this._getConfig(endpoint, keypair);
        config.headers['content-type'] = 'application/json';
        let promise = axios.patch(this._getURL(endpoint), { state: 3 }, config)
            .then(response => response.data)
            .catch(response => {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    return Promise.reject(response.data);
                }
            });
        return toBluebird(promise);
    }

    deletePendingTransaction(txHash, keypair) {
        let endpoint = `/transactions/${txHash}`;
        let config = this._getConfig(endpoint, keypair);
        config.headers['content-type'] = 'application/json';
        let promise = axios.delete(this._getURL(endpoint), config)
            .then(response => response.data)
            .catch(response => {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    return Promise.reject(response.data);
                }
            });
        return toBluebird(promise);
    }

    createUser(params, keypair) {
        let prefix = "users/create";
        return this._sendUserPostRequest(params, prefix, keypair);
    }

    updateUser(params, keypair) {
        let prefix = "users/update";
        return this._sendUserPostRequest(params, prefix, keypair);
    }

    /**
     * Store user verification document
     * @param {object} params.
     * @param {string} params.accountId - Source account.
     * @param {string} params.type - Type of the document.
     * @param {string} params.name - File name.
     * @param {string} params.file - DataUrl encoded file.
     * @returns {Promise} Returns a promise.
     */
    sendDocs(params, keypair) {
        let prefix = `users/${params.accountId}/documents/${params.type}`;
        return this._sendUserPostRequest(params, prefix, keypair);
    }

    deleteWallet(username, keypair) {
        let prefix = "users/unverified/delete";
        return this._sendUserPostRequest({ username: username }, prefix, keypair);
    }

    resendToken(username, keypair) {
        let prefix = "users/unverified/resend_token";
        return this._sendUserPostRequest({ username: username }, prefix, keypair);
    }

    /**
     * Store user verification document
     * @param {object} params
     * @param {string} params.userId - AccountId of the source.
     * @param {string} params.account_id - AccountId of the contact.
     * @param {string} params.nickname - Pretty name for `params.counterpartyId`.
     * @returns {Promise} Returns a promise.
     */
    addContact(params, keypair) {
        let prefix = `users/${params.userId}/contacts`;
        let config = this._getConfig("/" + prefix, keypair);
        let promise = axios.post(this._getURL(prefix),
                querystring.stringify(params), config)
            .then(function(response) {
                return response.data;
            })
            .catch(function(response) {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    return Promise.reject(response.data);
                }
            });
        return toBluebird(promise);
    }

    /**
     * Store user verification document
     * @param {object} params
     * @param {string} params.userId - AccountId of the source.
     * @param {string} params.contactId - Id of the contact.
     * @param {string} params.account_id - AccountId of the contact.
     * @param {string} params.nickname - Name of the contact.
     * @returns {Promise} Returns a promise.
     */
    updateContact(params, keypair) {
        let prefix = `users/${params.userId}/contacts/${params.account_id}`;
        let config = this._getConfig("/" + prefix, keypair);
        let promise = axios.patch(this._getURL(prefix),
                querystring.stringify(params), config)
            .then(function(response) {
                return response.data;
            })
            .catch(function(response) {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    return Promise.reject(response.data);
                }
            });
        return toBluebird(promise);
    }

    /**
     * Store user verification document
     * @param {object} params
     * @param {string} params.userId - AccountId of the source.
     * @param {string} params.contactId - Id of the contact.
     * @returns {Promise} Returns a promise.
     */
    deleteContact(params, keypair) {
        let prefix = `users/${params.userId}/contacts/${params.contactId}`;
        let config = this._getConfig("/" + prefix, keypair);
        let promise = axios.delete(this._getURL(prefix), config)
            .then(function(response) {
                return response.data;
            })
            .catch(function(response) {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    return Promise.reject(response.data);
                }
            });
        return toBluebird(promise);
    }

    sendContactRequest (params, keypair) {
      const requestData = { email: params.email };
      let prefix = `users/${params.account_id}/contacts/requests`;
        let config = this._getConfig("/" + prefix, keypair);
        config.headers["Content-Type"] = "application/json";
        let promise = axios.post(this._getURL(prefix), requestData, config)
          .then(function(response) {
            return response.data;
          })
          .catch(function(response) {
            if (response instanceof Error) {
              return Promise.reject(response);
            } else {
              return Promise.reject(response.data);
            }
          });
        return toBluebird(promise);
    }

    updateContactRequest (params, keypair) {
      const requestData = { state: params.state };
      let prefix = `users/${params.account_id}/contacts/requests/${params.request_id}`;
      let config = this._getConfig("/" + prefix, keypair);
      config.headers["Content-Type"] = "application/json";
      let promise = axios.patch(this._getURL(prefix), requestData, config)
        .then(function(response) {
          return response.data;
        })
        .catch(function(response) {
          if (response instanceof Error) {
            return Promise.reject(response);
          } else {
            return Promise.reject(response.data);
          }
        });
      return toBluebird(promise);
    }

    _sendUserPostRequest(params, prefix, keypair, isJson=false) {
        let requestData = {};
        let config = this._getConfig("/" + prefix, keypair);
        if (isJson) {
            config.headers["Content-Type"] = "application/json";
            requestData = params;
        } else {
            requestData = querystring.stringify(params);
        }

        let promise = axios.post(this._getURL(prefix), requestData, config)
            .then(function(response) {
                return response.data;
            })
            .catch(function(response) {
                if (response instanceof Error) {
                    return Promise.reject(response);
                } else {
                    return Promise.reject(response.data);
                }
            });
        return toBluebird(promise);
    }

    _getConfig(address, keypair) {
        let SIGNATURE_VALID_SEC = 60;
        let validUntil = Math.floor((new Date().getTime() / 1000) + SIGNATURE_VALID_SEC).toString();
        //temporary. should be fixed or refactored
        let signatureBase = "{ uri: '" + address + "', valid_untill: '" + validUntil.toString() + "'}";
        keypair = stellarBase.Keypair.fromRawSeed(keypair._secretSeed);
        let data = hash(signatureBase);

        let signature = keypair.signDecorated(data);
        return {
            headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    'X-AuthValidUnTillTimestamp': validUntil.toString(),
                    'X-AuthPublicKey': keypair.accountId(),
                    'X-AuthSignature': signature.toXDR("base64")
                    },
            timeout: SUBMIT_TRANSACTION_TIMEOUT,
        };
    }
    _getURL(prefix) {
        let filters = [prefix];
        if (Config.isURLPrefix() === true) {
            filters = Config.getURLPrefixedPath(prefix);
        }

        return URI(this.serverURL).segment(filters).toString();
    }
}