var reviewableRequestHelper = require('./review_request')
const StellarSdk = require('../../lib/index');

function createSaleCreationRequest(testHelper, owner, baseAsset, defaultQuoteAsset, startTime, endTime, softCap, hardCap, quoteAssets, isCrowdfunding, baseAssetForHardCap) {
    let opts = {
        requestID: "0",
        baseAsset: baseAsset,
        defaultQuoteAsset: defaultQuoteAsset,
        name: baseAsset + defaultQuoteAsset,
        startTime: startTime,
        endTime: endTime,
        softCap: softCap,
        hardCap: hardCap,
        quoteAssets: quoteAssets,
        isCrowdfunding: isCrowdfunding,
        baseAssetForHardCap: baseAssetForHardCap,
        details: {
            short_description: "short description",
            description: "Token sale description",
            logo: {
                url: "logo_url",
                type: "logo_type",
            },
            name: "sale name",
        },
    };
    let operation = StellarSdk.SaleRequestBuilder.createSaleCreationRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner);
}

function createSale(testHelper, owner, baseAsset, defaultQuoteAsset, startTime, endTime, softCap, hardCap, quoteAssets, isCrowdfunding, baseAssetForHardCap) {
    return createSaleCreationRequest(testHelper, owner, baseAsset, defaultQuoteAsset, startTime, endTime, softCap, hardCap, quoteAssets, isCrowdfunding, baseAssetForHardCap)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var success = result.result().results()[0].tr().createSaleCreationRequestResult().success();
            var id = success.requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        }).then(res => {
            console.log(baseAsset, defaultQuoteAsset, ' <-- Sale successfully created');
            return res;
        });
}

function checkSaleState(testHelper, baseAsset) {
    return testHelper.server.sales().forBaseAsset(baseAsset).callWithSignature(testHelper.master).then(sales => {
        return sales.records[0];
    }).then(sale => {
       let operation = StellarSdk.SaleRequestBuilder.checkSaleState({saleID: sale.id});
    return testHelper.server.submitOperationGroup([operation], testHelper.master.accountId(), testHelper.master);
    }).then(response => {
        return response;
    });
}

function createUpdateSaleDetailsRequest(testHelper, owner, saleID) {
    let opts = {
        requestID: "0",
        saleID: saleID,
        newDetails: {
            short_description: "updated short description",
            description: "Token sale description",
            logo: {
                url: "logo_url",
                type: "logo_type",
            },
            name: "updated sale name",
        },
    };

    let operation = StellarSdk.ManageSaleBuilder.createUpdateSaleDetailsRequest(opts);
    return testHelper.server.submitOperation(operation, owner.accountId(), owner)
        .then(response => {
            let result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            let id = result.result().results()[0].tr().manageSaleResult().success().response().requestId().toString();
            console.log("UpdateSaleDetailsRequest created: " + id);
            return id;
        });
}

module.exports = {
    createSaleCreationRequest,
    createSale,
    checkSaleState,
    createUpdateSaleDetailsRequest
};