var reviewableRequestHelper = require('./review_request');
const StellarSdk = require('../../lib/index');


function createLimitsUpdateRequest(testHelper, source, documentHash) {
    const opts = {
        limitsUpdateRequestData: {
        documentHash: documentHash
    }
    };
    const operation = StellarSdk.Operation.setOptions(opts);
    return testHelper.server.submitOperation(operation, source.accountId(), source)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().setOptionsResult().success().limitsUpdateRequestId().toString();
            console.log("LimitsUpdateRequest created: " + id);
            return id
        })
}

module.exports = {
    createLimitsUpdateRequest
}