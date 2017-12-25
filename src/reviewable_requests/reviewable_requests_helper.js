import {AssetRequestsCallBuilder} from "./asset_requests_call_builder";
import {PreissuanceRequestsCallBuilder} from "./preissuance_requests_call_builder";
import {IssuanceRequestsCallBuilder} from "./issuance_requests_call_builder";
import {WithdrawalRequestsCallBuilder} from "./withdrawal_requests_call_builder";
import {SaleRequestsCallBuilder} from "./sales_requests_call_builder";
let URI = require("urijs");


export class ReviewableRequestsHelper {
    /**
     * Creates a new {@link ReviewableRequestsHelper} which provides methods 
     * to build specific reviewable request call builders
     *
     * Do not create this object directly, use {@link Server#reviewableRequestsHelper}.
     * @constructor
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverURL) {
        this.serverURL = URI(serverURL);
    }

    /**
     * Returns new {@link AssetRequestsCallBuilder} object configured by a current Horizon server configuration.
     * @returns {AssetRequestsCallBuilder}
     */
    assets() {
        return new AssetRequestsCallBuilder(URI(this.serverURL));
    }

     /**
     * Returns new {@link PreissuanceRequestsCallBuilder} object configured by a current Horizon server configuration.
     * @returns {PreissuanceRequestsCallBuilder}
     */
    preissuances() {
        return new PreissuanceRequestsCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link IssuanceRequestsCallBuilder} object configured by a current Horizon server configuration.
     * @returns {IssuanceRequestsCallBuilder}
     */
    issuances() {
        return new IssuanceRequestsCallBuilder(URI(this.serverURL));
    }

     /**
     * Returns new {@link WithdrawalRequestsCallBuilder} object configured by a current Horizon server configuration.
     * @returns {WithdrawalRequestsCallBuilder}
     */
    withdrawals() {
        return new WithdrawalRequestsCallBuilder(URI(this.serverURL));
    }

    /**
     * Returns new {@link SaleRequestsCallBuilder} object configured by a current Horizon server configuration.
     * @returns {SaleRequestsCallBuilder}
     */
    sales() {
        return new SaleRequestsCallBuilder(URI(this.serverURL));
    }
    
}