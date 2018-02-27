const StellarSdk = require('../../lib/index');

function bindExternalSystemAccountId(testHelper, source, externalSystemType) {
    let operation = StellarSdk.BindExternalSystemAccountIdBuilder.createBindExternalSystemAccountIdOp({
        externalSystemType: externalSystemType,
    });
    return testHelper.server.submitOperation(operation, source.accountId(), source);
}

module.exports = {
    bindExternalSystemAccountId
};