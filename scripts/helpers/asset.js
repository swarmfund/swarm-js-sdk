var reviewableRequestHelper = require('./review_request')
const StellarSdk = require('../../lib/index');


function createAssetCreationRequest(testHelper, owner, issuer, assetCode, policy, logoId) {
    let opts = {
        requestID: "0",
        code: assetCode,
        name: assetCode + " name",
        preissuedAssetSigner: issuer,
        description: "Description",
        externalResourceLink: "https://myasset.com",
        maxIssuanceAmount: "100000000",
        policies: policy,
        logoId: logoId,
    };
    let operation = StellarSdk.ManageAssetBuilder.assetCreationRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner);
}

function createAsset(testHelper, owner, issuer, assetCode, policy, logoId) {
    return createAssetCreationRequest(testHelper, owner, issuer, assetCode, policy, logoId)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().manageAssetResult().success().requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        }).then(res => {
            console.log(assetCode, ' <-- Asset successfully created');
            return res;
        });
}

module.exports = {
    createAssetCreationRequest,
    createAsset
}