import {CallBuilder} from "./call_builder";

export class CoinsEmissionRequestCallBuilder extends CallBuilder {
    /**
     * Creates a new {@link CoinsEmissionRequestCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#coinsEmissionRequests}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('coins_emission_requests');
    }

    /**
     * The coinsEmissionRequest details endpoint provides information on a single coins emission request. The request ID provided in the id
     * argument specifies which request to load.
     * @see [request Details]
     * @param {number} requestId Request ID
     * @returns {CoinsEmissionRequestCallBuilder}
     */
    coinsEmissionRequest(requestId) {
        this.filter.push(['coins_emission_requests', requestId]);
        return this;
    }

    /**
     * This endpoint represents all coins emission requests that were included in valid transactions with asset.
     * @param {string} asset For example: `XAAU`
     * @returns {CoinsEmissionRequestCallBuilder}
     */
    forAsset(asset) {
        this.url.addQuery('asset', asset);
        return this;
    }

    /**
     * This endpoint represents all coins emission requests that were included in valid transactions that initiated by a particular exchange.
     * @param {string} exchangeId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
     * @returns {CoinsEmissionRequestCallBuilder}
     */
    forExchange(exchangeId) {
        this.url.addQuery('exchange', exchangeId);
        return this;
    }

    /**
     * This endpoint represents all coins emission requests that were included in valid transactions with state.
     * @param {int} state 1:PENDING, 2:ACCEPTED, 3:REJECTED
     * @returns {CoinsEmissionRequestCallBuilder}
     */
    forState(state) {
        this.url.addQuery('state', state);
        return this;
    }

    /**
     * This endpoint represents all coins emission requests that were submitted with indicated reference.
     * @param {string} reference
     * @returns {CoinsEmissionRequestCallBuilder}
     */

    forReference(reference) {
        this.url.addQuery('reference', reference);
        return this;
    }
}
