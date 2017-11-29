import {CallBuilder} from "./call_builder";

export class AvailableEmissionsCallBuilder extends CallBuilder {
    
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('available_emissions');
    }
    
     /**
     * This endpoint represents available amount for particular asset.
     * @param {string} like XBU
     * @returns {AvailableEmissionsCallBuilder}
     */
    forAsset(asset) {
        this.filter.push(['available_emissions', asset]);
        return this;
    }
}
