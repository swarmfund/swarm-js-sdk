import {CallBuilder} from "./call_builder";

export class ReverseFederationCallBuilder extends CallBuilder {
    
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('reverse_federation');
    }

    accountId(id) {
        this.filter.push(['reverse_federation', id]);
        return this;
    }
}
