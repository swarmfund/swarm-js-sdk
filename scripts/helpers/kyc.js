var reviewableRequestHelper = require('./review_request');
const StellarSdk = require('../../lib/index');

function createKYCRequest(testHelper, source, requestID, accountToUpdateKYC, accountTypeToSet,
                          kycLevelToSet, kycData, allTasks) {
    const opts = {
        requestID: requestID,
        accountToUpdateKYC: accountToUpdateKYC,
        accountTypeToSet: accountTypeToSet,
        kycLevelToSet: kycLevelToSet,
        kycData: kycData,
        allTasks: allTasks,
    };
    const operation = StellarSdk.CreateUpdateKYCRequestBuilder.createUpdateKYCRequest(opts);
    return testHelper.server.submitOperation(operation, source.accountId(), source)
        .then(response => {
            let result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            let id = result.result().results()[0].tr().createUpdateKycRequestResult().success().requestId().toString();
            console.log("UpdateKYCRequest created: " + id);
            return id;
        })
}

module.exports = {
    createKYCRequest
};