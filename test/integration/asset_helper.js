import * as reviewableRequestHelper from './review_request_helper'

export function createAssetCreationRequest(testHelper, owner, issuer, assetCode) {
    let opts = {
        requestID: "0",
        code: assetCode,
        name: assetCode + " name",
        preissuedAssetSigner: issuer,
        description: "Description",
        externalResourceLink: "https://myasset.com",
        maxIssuanceAmount: "100000000",
        policies: StellarSdk.xdr.AssetPolicy.assetTransferable().value,

    };
    let operation = StellarSdk.ManageAssetBuilder.assetCreationRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner);
}


export function createAsset(testHelper, owner, issuer, assetCode) {
    return createAssetCreationRequest(testHelper, owner, issuer, assetCode)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().manageAssetResult().success().requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        });
}