"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var CallBuilder = require("./call_builder").CallBuilder;

var PendingTransactionCallBuilder = exports.PendingTransactionCallBuilder = (function (_CallBuilder) {
    /**
     * Creates a new {@link PendingTransactionCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#pending_transactions}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */

    function PendingTransactionCallBuilder(serverUrl) {
        _classCallCheck(this, PendingTransactionCallBuilder);

        _get(Object.getPrototypeOf(PendingTransactionCallBuilder.prototype), "constructor", this).call(this, serverUrl);
        this.url.segment("pending_transactions");
    }

    _inherits(PendingTransactionCallBuilder, _CallBuilder);

    _createClass(PendingTransactionCallBuilder, {
        transaction: {

            /**
             * The transaction details endpoint provides information on a single transaction. The transaction hash provided in the hash argument specifies which transaction to load.
             * @see [Transaction Details](https://www.stellar.org/developers/horizon/reference/transactions-single.html)
             * @param {string} transactionId Transaction ID
             * @returns {TransactionCallBuilder}
             */

            value: function transaction(transactionId) {
                this.filter.push(["pending_transactions", transactionId]);
                return this;
            }
        },
        withState: {

            /**
            * @param {int} state 1:PENDING, 2:SUCCESS, 3:REJECTED, 4:FAILED
            */

            value: function withState(state) {
                this.url.addQuery("state", state);
                return this;
            }
        },
        signedBy: {
            value: function signedBy(accountId) {
                this.url.addQuery("signed_by", accountId);
                return this;
            }
        },
        notSignedBy: {
            value: function notSignedBy(accountId) {
                this.url.addQuery("not_signed_by", accountId);
                return this;
            }
        }
    });

    return PendingTransactionCallBuilder;
})(CallBuilder);