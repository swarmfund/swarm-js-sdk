import {CallBuilder} from "./call_builder";

export class BalanceCallBuilder extends CallBuilder {
    /**
     * Creates a new {@link PaymentCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#payments}.
     * @see [All Payments](https://www.stellar.org/developers/horizon/reference/payments-all.html)
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('balances');
    }

    forAccount(accountId) {
        this.url.addQuery('account', accountId);
        return this;
    }

    balanceId(balanceId) {
        this.filter.push(['balances', balanceId, 'asset']);
        return this;
    }

    forAsset(asset) {
        this.url.addQuery('asset', asset);
        return this;
    }

    account(balanceId) {
        this.filter.push(['balances', balanceId, 'account']);
        return this;
    }
}
