var reviewableRequestHelper = require('./review_request')
const StellarSdk = require('../../lib/index');


function createSaleCreationRequest(testHelper, owner, baseAsset, quoteAsset, startTime, endTime, price, softCap, hardCap) {
    let opts = {
        requestID: "0",
        baseAsset: baseAsset,
        quoteAsset: quoteAsset,
        name: baseAsset + quoteAsset,
        startTime: startTime,
        endTime: endTime,
        price: price,
        softCap: softCap,
        hardCap: hardCap,
        details: {
            short_description: "short description",
            description: "Token sale description",
            logo: "logo",
            name: "sale name",
        },
    };
    let operation = StellarSdk.SaleRequestBuilder.createSaleCreationRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner);
}

function createSale(testHelper, owner, baseAsset, quoteAsset, startTime, endTime, price, softCap, hardCap) {
    return createSaleCreationRequest(testHelper, owner, baseAsset, quoteAsset, startTime, endTime, price, softCap, hardCap)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var success = result.result().results()[0].tr().createSaleCreationRequestResult().success();
            var id = success.requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        }).then(res => {
            console.log(baseAsset, quoteAsset, ' <-- Sale successfully created');
            return res;
        });
}

module.exports = {
    createSaleCreationRequest,
    createSale
}