import {CallBuilder} from "./call_builder";

export class AbxUserCallBuilder extends CallBuilder {
    /** Creates a new {@link AbxUserCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#abxUsers}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('integrations/abx/users');
        return this;
    }

    /**
     * @param {string} integrationId Integration ID
     * @returns {AbxUserCallBuilder}
     */
    forIntegrationId(integrationId) {
        this.url.addQuery('integration_id', integrationId);
        return this;
    }
}
