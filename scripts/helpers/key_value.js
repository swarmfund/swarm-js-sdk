const StellarSdk = require('../../lib/index');

function putKeyValue(testHelper, source, key, value) {
    let opts = {
        key: key,
        value: value
    };
    let operation = StellarSdk.ManageKeyValueBuilder.putKeyValue(opts);
    console.log("After create operation put");
    console.log(operation);
    return testHelper.server.submitOperation(operation, source.accountId(), source);
}

function deleteKeyValue(testHelper, source, key) {
    let operation = StellarSdk.ManageKeyValueBuilder.deleteKeyValue({
        key: key
    });
    return testHelper.server.submitOperation(operation, source.accountId(), source);
}

module.exports = {
    putKeyValue,
    deleteKeyValue
};