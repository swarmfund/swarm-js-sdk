var reviewableRequestHelper = require('./review_request');
const StellarSdk = require('../../lib/index');
var _swarmJsBase = require("swarm-js-base");
var hash = _swarmJsBase.hash;

function createLimitsUpdateRequest(testHelper, source, documentData) {
    const opts = {
        limitsUpdateRequestData: {
        documentHash: hash(documentData)
    }
    };
    const operation = StellarSdk.SetOptionsBuilder.setOptions(opts);
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