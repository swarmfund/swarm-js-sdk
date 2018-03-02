var reviewableRequestHelper = require('./review_request');
const StellarSdk = require('../../lib/index');

function createKYCRequest(testHelper, source, requestID, updatedAccount, accountTypeToSet,
                          kycLevel, kycData) {
    const opts = {
        requestID: requestID,
        updatedAccount: updatedAccount,
        accountTypeToSet: accountTypeToSet,
        kycLevel: kycLevel,
        kycData: kycData
    };
    const operation = StellarSdk.CreateKYCRequestBuilder.createKYCRequest(opts);
    return testHelper.server.submitOperation(operation, source.accountId(), source)
        .then(response => {
            let result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            let id = result.result().results()[0].tr().createKycRequestResult().success().requestId().toString();
            console.log("ChangeKYCRequest created: " + id);
            return id;
        })
}

function performChangeKYC(testHelper, source, requestID, updatedAccount, accountTypeToSet,
                          kycLevel, kycData) {
    return createKYCRequest(testHelper, source, requestID, updatedAccount, accountTypeToSet,
        kycLevel, kycData)
        .then(id => {
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master,
                StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        })
        .then(res => {
            console.log("PerformedChangeKYC: ", kycLevel, kycData);
            return res;
        }).catch(err => {
            console.log(err.response.data.extras);
        });
}

module.exports = {
    createKYCRequest,
    performChangeKYC
};