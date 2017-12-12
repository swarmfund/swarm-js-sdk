var reviewableRequestHelper = require('./review_request')
const StellarSdk = require('../../lib/index');


function createAssetCreationRequest(testHelper, owner, issuer, assetCode, policy) {
    let opts = {
        requestID: "0",
        code: assetCode,
        name: assetCode + " name",
        preissuedAssetSigner: issuer,
        description: "Description",
        externalResourceLink: "https://myasset.com",
        maxIssuanceAmount: "100000000",
        policies: policy,
        logoId: "logoID"

    };
    let operation = StellarSdk.ManageAssetBuilder.assetCreationRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner);
}

function createAsset(testHelper, owner, issuer, assetCode, policy) {
    return createAssetCreationRequest(testHelper, owner, issuer, assetCode, policy)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().manageAssetResult().success().requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        }).then(res => {
            console.log(assetCode, ' <-- Asset successfully created');
            return res;
        });
}

function createAssetPair(testHelper, baseAsset, quoteAsset) {
    let operation = StellarSdk.Operation.manageAssetPair({
        action: StellarSdk.xdr.ManageAssetPairAction.create(),
        base: baseAsset,
        quote: quoteAsset,
        policies: 0,
        physicalPriceCorrection: "0",
        maxPriceStep: "0",
        physicalPrice: "1",
    });
    return testHelper.server.submitOperation(operation, testHelper.master.accountId(), testHelper.master);
}

module.exports = {
    createAssetCreationRequest,
    createAsset,
    createAssetPair
}