
import forIn from "lodash/forIn";

export class KeyValueResponse {
    constructor(response) {
        forIn(response,(value,key) =>{
            this[key] = value;
        })
    }

    keyValueKey() {
        return this["key"];
    }
};