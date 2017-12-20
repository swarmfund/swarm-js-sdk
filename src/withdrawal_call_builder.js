import {CallBuilder} from "./call_builder";

export class WithdrawalCallBuilder extends CallBuilder {
    /**
     * Creates a new {@link WithdrawalCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#withdrawals}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('request/withdrawals');
    }

    /**
     * Filters withdrawals by destination asset.
     * @param {string} asset For example: `BTC`
     * @returns {WithdrawalCallBuilder}
     */
    forDestAsset(asset) {
        this.url.addQuery('to_asset', asset);
        return this;
    }

    /**
     * Filters withdrawals by requester.
     * @param {string} requester For example: `GDRYPVZ63SR7V2G46GKRGABJD3XPDNWQ4B4PQPJBTTDUEAKH5ZECPTSN`
     * @returns {WithdrawalCallBuilder}
     */
    forRequester(requester) {
        this.url.addQuery('requester', requester);
        return this;
    }

    /**
     * Filters withdrawals by state.
     * @param {number} state For example: Pending: 1, Canceled: 2, Approved: 3, Rejected: 4, PermanentlyRejected: 5
     * @returns {WithdrawalCallBuilder}
     */
    forState(state) {
        this.url.addQuery('state', state);
        return this;
    }
}
