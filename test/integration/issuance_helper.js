import * as reviewableRequestHelper from './review_request_helper'

export function createPreIssuanceRequest(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount) {
    var preIssuanceRequest = StellarSdk.PreIssuanceRequest.build({
        amount: amount,
        reference: StellarSdk.Keypair.random().accountId(),
        asset: assetCode,
        keyPair: preIssuanceKP,
    });
    let op = StellarSdk.PreIssuanceRequestOpBuilder.createPreIssuanceRequestOp({ request: preIssuanceRequest });
    return testHelper.server.submitOperation(op, assetOwnerKP.accountId(), assetOwnerKP);
}

export function performPreIssuance(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount) {
    return createPreIssuanceRequest(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().createPreIssuanceRequestResult().success().requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        });
}

export function issue(testHelper, requestor, receiverBalanceID, asset, amount) {
    var opts = {
        asset: asset,
        amount: amount,
        receiver: receiverBalanceID,
        reference: StellarSdk.Keypair.random().accountId(),
    };

    let op = StellarSdk.CreateIssuanceRequestBuilder.createIssuanceRequest(opts);
    return testHelper.server.submitOperation(op, requestor.accountId(), requestor);
}