"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var CallBuilder = require("./call_builder").CallBuilder;

var CoinsEmissionRequestCallBuilder = exports.CoinsEmissionRequestCallBuilder = (function (_CallBuilder) {
    /**
     * Creates a new {@link CoinsEmissionRequestCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#coinsEmissionRequests}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */

    function CoinsEmissionRequestCallBuilder(serverUrl) {
        _classCallCheck(this, CoinsEmissionRequestCallBuilder);

        _get(Object.getPrototypeOf(CoinsEmissionRequestCallBuilder.prototype), "constructor", this).call(this, serverUrl);
        this.url.segment("coins_emission_requests");
    }

    _inherits(CoinsEmissionRequestCallBuilder, _CallBuilder);

    _createClass(CoinsEmissionRequestCallBuilder, {
        coinsEmissionRequest: {

            /**
             * The coinsEmissionRequest details endpoint provides information on a single coins emission request. The request ID provided in the id
             * argument specifies which request to load.
             * @see [request Details]
             * @param {number} requestId Request ID
             * @returns {CoinsEmissionRequestCallBuilder}
             */

            value: function coinsEmissionRequest(requestId) {
                this.filter.push(["coins_emission_requests", requestId]);
                return this;
            }
        },
        forAsset: {

            /**
             * This endpoint represents all coins emission requests that were included in valid transactions with asset.
             * @param {string} asset For example: `XAAU`
             * @returns {CoinsEmissionRequestCallBuilder}
             */

            value: function forAsset(asset) {
                this.url.addQuery("asset", asset);
                return this;
            }
        },
        forExchange: {

            /**
             * This endpoint represents all coins emission requests that were included in valid transactions that initiated by a particular exchange.
             * @param {string} exchangeId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
             * @returns {CoinsEmissionRequestCallBuilder}
             */

            value: function forExchange(exchangeId) {
                this.url.addQuery("exchange", exchangeId);
                return this;
            }
        },
        forState: {

            /**
             * This endpoint represents all coins emission requests that were included in valid transactions with state.
             * @param {int} state 1:PENDING, 2:ACCEPTED, 3:REJECTED
             * @returns {CoinsEmissionRequestCallBuilder}
             */

            value: function forState(state) {
                this.url.addQuery("state", state);
                return this;
            }
        },
        forReference: {

            /**
             * This endpoint represents all coins emission requests that were submitted with indicated reference.
             * @param {string} reference
             * @returns {CoinsEmissionRequestCallBuilder}
             */

            value: function forReference(reference) {
                this.url.addQuery("reference", reference);
                return this;
            }
        }
    });

    return CoinsEmissionRequestCallBuilder;
})(CallBuilder);