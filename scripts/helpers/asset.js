var reviewableRequestHelper = require('./review_request')
const StellarSdk = require('../../lib/index');


function createAssetCreationRequest(testHelper, owner, issuer, assetCode) {
    let opts = {
        requestID: "0",
        code: assetCode,
        name: assetCode + " name",
        preissuedAssetSigner: issuer,
        description: "Description",
        externalResourceLink: "https://myasset.com",
        maxIssuanceAmount: "100000000",
        policies: 3,
        // policies: StellarSdk.xdr.AssetPolicy.assetTransferable().value +
        // StellarSdk.xdr.AssetPolicy.baseAsset().value,

    };
    let operation = StellarSdk.ManageAssetBuilder.assetCreationRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner);
}


function createAsset(testHelper, owner, issuer, assetCode) {
    return createAssetCreationRequest(testHelper, owner, issuer, assetCode)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().manageAssetResult().success().requestId().toString();
            time.Sleep()
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        }).then(_ => {
            console.log(assetCode, ' <-- Asset successfully created')
        });
}

module.exports = {
    createAssetCreationRequest,
    createAsset
}