var reviewableRequestHelper = require('./review_request')
const StellarSdk = require('../../lib/index');


function createAssetCreationRequest(testHelper, owner, issuer, assetCode, policy=0, maxIssuanceAmount="100000000", initialPreissuedAmount = "0") {
    console.log(assetCode,maxIssuanceAmount)
    let opts = {
        requestID: "0",
        code: assetCode,
        name: assetCode + " name",
        preissuedAssetSigner: issuer,
        description: "Description",
        externalResourceLink: "https://myasset.com",
        maxIssuanceAmount: maxIssuanceAmount,
        policies: policy,
        logoId: assetCode + " Logo",
        initialPreissuedAmount: initialPreissuedAmount,

    };
    let operation = StellarSdk.ManageAssetBuilder.assetCreationRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner);
}

function createAsset(testHelper, owner, issuer, assetCode, policy, maxIssuanceAmount) {
    return createAssetCreationRequest(testHelper, owner, issuer, assetCode, policy, maxIssuanceAmount)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var success = result.result().results()[0].tr().manageAssetResult().success()
            if (success.fulfilled() === true) {
                return 'Asset created'
            }
            var id = success.requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        }).then(res => {
            console.log(assetCode, ' <-- Asset successfully created');
            return res;
        });
}

function createAssetPair(testHelper, baseAsset, quoteAsset, physicalPrice = "1") {
    let operation = StellarSdk.Operation.manageAssetPair({
        action: StellarSdk.xdr.ManageAssetPairAction.create(),
        base: baseAsset,
        quote: quoteAsset,
        policies: 0,
        physicalPriceCorrection: "0",
        maxPriceStep: "0",
        physicalPrice: physicalPrice,
    });
    return testHelper.server.submitOperation(operation, testHelper.master.accountId(), testHelper.master);
}

module.exports = {
    createAssetCreationRequest,
    createAsset,
    createAssetPair
}