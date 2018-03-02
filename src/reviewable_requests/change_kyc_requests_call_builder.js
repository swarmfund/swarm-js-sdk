import {ReviewableRequestCallBuilder} from "./reviewable_request_call_builder";

export class ChangeKYCRequestCallBuilder extends ReviewableRequestCallBuilder {
    /**
     * Creates a new {@link ChangeKYCRequestCallBuilder} pointed to server defined by serverUrl
     *
     * Do not create this object directly, use {@link Server#reviewableRequestsHelper#change_kyc}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('request/change_kyc');
    }

    /**
     * Filters KYC changing
     * @param {string} updated_account_id For example: `GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB`
     * @returns {ChangeKYCRequestCallBuilder}
     */
    forAccount(updated_account_id) {
        this.url.addQuery('updated_account_id', updated_account_id);
        return this;
    }
}
