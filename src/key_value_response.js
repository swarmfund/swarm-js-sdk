import {KeyValue as BaseKeyValue} from "swarm-js-base";
import forIn from "lodash/forIn";

export class key_value_response {

    constructor(response) {
        this._baseKeyValue = new BaseKeyValue(response.key);
        // Extract response fields
        forIn(response,(value,key) =>{
            this[key] = value;
        })
    }

    keyValueKey() {
        return this._baseKeyValue.keyValueKey();
    }
};