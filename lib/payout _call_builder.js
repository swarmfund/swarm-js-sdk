"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var CallBuilder = require("./call_builder").CallBuilder;

var PayoutCallBuilder = exports.PayoutCallBuilder = (function (_CallBuilder) {
    /**
     * Creates new {@link PayoutCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#payouts}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */

    function PayoutCallBuilder(serverUrl) {
        _classCallCheck(this, PayoutCallBuilder);

        _get(Object.getPrototypeOf(PayoutCallBuilder.prototype), "constructor", this).call(this, serverUrl);
        this.url.segment("payouts");
    }

    _inherits(PayoutCallBuilder, _CallBuilder);

    _createClass(PayoutCallBuilder, {
        forAsset: {

            /**
             * This endpoint responds with a collection of payout operations where given asset was the asset, whose holders had
             * received dividends
             */

            value: function forAsset(asset) {
                this.url.addQuery("asset", asset);
                return this;
            }
        },
        forLedger: {

            /**
             * This endpoint represents all payout operations that are part of a valid transactions in a given ledger.
             * @param {number} ledgerId Ledger ID
             * @returns {PayoutCallBuilder}
             */

            value: function forLedger(ledgerId) {
                this.filter.push(["ledgers", ledgerId, "payouts"]);
                return this;
            }
        },
        forTransaction: {

            /**
             * This endpoint represents all payout operations that are part of a given transaction.
             * @param {string} transactionId Transaction ID
             * @returns {PayoutCallBuilder}
             */

            value: function forTransaction(transactionId) {
                this.filter.push(["transactions", transactionId, "payouts"]);
                return this;
            }
        },
        sinceDate: {
            value: function sinceDate(date) {
                this.url.addQuery("since", date);
                return this;
            }
        },
        toDate: {
            value: function toDate(date) {
                this.url.addQuery("to", date);
                return this;
            }
        }
    });

    return PayoutCallBuilder;
})(CallBuilder);