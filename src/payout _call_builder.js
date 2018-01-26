import {CallBuilder} from "./call_builder";

export class PayoutCallBuilder extends CallBuilder {
    /**
     * Creates new {@link PayoutCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#payouts}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('payouts');
    }

    /**
     * This endpoint responds with a collection of payout operations where given asset was the asset, whose holders had
     * received dividends
     */
    forAsset(asset) {
        this.url.addQuery('asset', asset);
        return this;
    }

    /**
     * This endpoint represents all payout operations that are part of a valid transactions in a given ledger.
     * @param {number} ledgerId Ledger ID
     * @returns {PayoutCallBuilder}
     */
    forLedger(ledgerId) {
        this.filter.push(['ledgers', ledgerId, 'payouts']);
        return this;
    }

    /**
     * This endpoint represents all payout operations that are part of a given transaction.
     * @param {string} transactionId Transaction ID
     * @returns {PayoutCallBuilder}
     */
    forTransaction(transactionId) {
        this.filter.push(['transactions', transactionId, 'payouts']);
        return this;
    }

    sinceDate(date) {
        this.url.addQuery('since', date);
        return this;
    }

    toDate(date) {
        this.url.addQuery('to', date);
        return this;
    }
}