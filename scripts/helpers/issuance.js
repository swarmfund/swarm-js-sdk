const StellarSdk = require('../../lib/index');

function loadRequestWithRetry(testHelper, requestID, reviewerKP) {
    return testHelper.server.reviewableRequests().reviewableRequest(requestID).callWithSignature(reviewerKP).catch(err => {
        if (!isUndefined(err.response) && err.response.status === 404) {
            console.log("received 404 for reviewable request - retring");
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() => loadRequestWithRetry(testHelper, requestID, reviewerKP));
        }
        throw err;
    });
}

 function reviewRequest(testHelper, requestID, reviewerKP, action, rejectReason) {
    return loadRequestWithRetry(testHelper, requestID, reviewerKP).then(request => {
        let opts = {
            requestID: requestID,
            requestHash: request.hash,
            requestType: request.details.request_type_i,
            action: action,
            reason: rejectReason,
        };
        let operation = StellarSdk.ReviewRequestBuilder.reviewRequest(opts);
        return testHelper.server.submitOperation(operation, reviewerKP.accountId(), reviewerKP);
    }).catch(err => {
        if (!isUndefined(err.response) && err.response.status === 404) {
            console.log("received 404 - retrying");
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() => reviewRequest(testHelper, requestID, reviewerKP, action, rejectReason));
        }
        throw err;
    });
}

 function createPreIssuanceRequest(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount) {
    var preIssuanceRequest = StellarSdk.PreIssuanceRequest.build({
        amount: amount,
        reference: StellarSdk.Keypair.random().accountId(),
        asset: assetCode,
        keyPair: preIssuanceKP,
    });
    let op = StellarSdk.PreIssuanceRequestOpBuilder.createPreIssuanceRequestOp({ request: preIssuanceRequest });
    return testHelper.server.submitOperation(op, assetOwnerKP.accountId(), assetOwnerKP);
}

 function performPreIssuance(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount) {
    return createPreIssuanceRequest(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().createPreIssuanceRequestResult().success().requestId().toString();
            return reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        })
        .catch(err => {
            console.log(err.response.data.extras)
        });
}

 function issue(testHelper, requestor, receiverBalanceID, asset, amount) {
    var opts = {
        asset: asset,
        amount: amount,
        receiver: receiverBalanceID,
        reference: StellarSdk.Keypair.random().accountId(),
    };

    let op = StellarSdk.CreateIssuanceRequestBuilder.createIssuanceRequest(opts);
    return testHelper.server.submitOperation(op, requestor.accountId(), requestor);
}

module.exports = {
    loadRequestWithRetry,
    reviewRequest,
    createPreIssuanceRequest,
    performPreIssuance,
    issue
}