"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var AssetRequestsCallBuilder = require("./asset_requests_call_builder").AssetRequestsCallBuilder;

var PreissuanceRequestsCallBuilder = require("./preissuance_requests_call_builder").PreissuanceRequestsCallBuilder;

var IssuanceRequestsCallBuilder = require("./issuance_requests_call_builder").IssuanceRequestsCallBuilder;

var WithdrawalRequestsCallBuilder = require("./withdrawal_requests_call_builder").WithdrawalRequestsCallBuilder;

var SaleRequestsCallBuilder = require("./sales_requests_call_builder").SaleRequestsCallBuilder;

var ReviewableRequestCallBuilder = require("./reviewable_request_call_builder").ReviewableRequestCallBuilder;

var LimitsUpdateRequestsCallBuilder = require("./limits_update_requests_call_builder").LimitsUpdateRequestsCallBuilder;

var URI = require("urijs");

var ReviewableRequestsHelper = exports.ReviewableRequestsHelper = (function () {
    /**
     * Creates a new {@link ReviewableRequestsHelper} which provides methods 
     * to build specific reviewable request call builders
     *
     * Do not create this object directly, use {@link Server#reviewableRequestsHelper}.
     * @constructor
     * @param {string} serverUrl Horizon server URL.
     */

    function ReviewableRequestsHelper(serverURL) {
        _classCallCheck(this, ReviewableRequestsHelper);

        this.serverURL = URI(serverURL);
    }

    _createClass(ReviewableRequestsHelper, {
        assets: {

            /**
             * Returns new {@link AssetRequestsCallBuilder} object configured by a current Horizon server configuration.
             * @returns {AssetRequestsCallBuilder}
             */

            value: function assets() {
                return new AssetRequestsCallBuilder(URI(this.serverURL));
            }
        },
        preissuances: {

            /**
            * Returns new {@link PreissuanceRequestsCallBuilder} object configured by a current Horizon server configuration.
            * @returns {PreissuanceRequestsCallBuilder}
            */

            value: function preissuances() {
                return new PreissuanceRequestsCallBuilder(URI(this.serverURL));
            }
        },
        issuances: {

            /**
             * Returns new {@link IssuanceRequestsCallBuilder} object configured by a current Horizon server configuration.
             * @returns {IssuanceRequestsCallBuilder}
             */

            value: function issuances() {
                return new IssuanceRequestsCallBuilder(URI(this.serverURL));
            }
        },
        withdrawals: {

            /**
            * Returns new {@link WithdrawalRequestsCallBuilder} object configured by a current Horizon server configuration.
            * @returns {WithdrawalRequestsCallBuilder}
            */

            value: function withdrawals() {
                return new WithdrawalRequestsCallBuilder(URI(this.serverURL));
            }
        },
        sales: {

            /**
             * Returns new {@link SaleRequestsCallBuilder} object configured by a current Horizon server configuration.
             * @returns {SaleRequestsCallBuilder}
             */

            value: function sales() {
                return new SaleRequestsCallBuilder(URI(this.serverURL));
            }
        },
        request: {

            /**
             * Returns new {@link ReviewableRequestCallBuilder} object configured by a current Horizon server configuration.
             * @returns {ReviewableRequestCallBuilder}
             */

            value: function request() {
                return new ReviewableRequestCallBuilder(URI(this.serverURL));
            }
        },
        limits_updates: {
            /**
             * Returns new {@link LimitsUpdateRequestsCallBuilder} object configured by a current Horizon server configuration.
             * @returns {LimitsUpdateRequestsCallBuilder}
             */

            value: function limits_updates() {
                return new LimitsUpdateRequestsCallBuilder(URI(this.serverURL));
            }
        },
        change_kyc: {

            /**
             * Returns new {@link ChangeKYCRequestCallBuilder} object configured by a current Horizon server configuration.
             * @returns {ChangeKYCRequestCallBuilder}
             */

            value: function change_kyc() {
                return new ChangeKYCRequestCallBuilder(URI(this.serverURL));
            }
        }
    });

    return ReviewableRequestsHelper;
})();