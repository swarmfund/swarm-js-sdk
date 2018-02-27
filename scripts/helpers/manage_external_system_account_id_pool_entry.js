const StellarSdk = require('../../lib/index');

function createExternalSystemAccountIdPoolEntry(testHelper, externalSystemType, data) {
    let operation = StellarSdk.ManageExternalSystemAccountIdPoolEntryBuilder.createExternalSystemAccountIdPoolEntry({
        externalSystemType: externalSystemType,
        data: data,
    });
    return testHelper.server.submitOperation(operation, testHelper.master.accountId(), testHelper.master);
}

module.exports = {
    createExternalSystemAccountIdPoolEntry
};