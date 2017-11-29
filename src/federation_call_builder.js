import {CallBuilder} from "./call_builder";

export class FederationCallBuilder extends CallBuilder {
    
    constructor(serverUrl) {
        super(serverUrl);
        this.url.segment('federation');
    }

    key(key) {
        this.filter.push(['federation', key]);
        return this;
    }
}
