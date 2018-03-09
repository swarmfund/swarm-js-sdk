var reviewableRequestHelper = require('./review_request')
const isUndefined = require('lodash/isUndefined');
const StellarSdk = require('../../lib/index');


function createSaleCreationRequest(testHelper, owner, baseAsset, defaultQuoteAsset, startTime, endTime, softCap, hardCap, quoteAssets, isCrowdfunding) {
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

function createSale(testHelper, owner, baseAsset, defaultQuoteAsset, startTime, endTime, softCap, hardCap, quoteAssets, isCrowdfunding) {
    return createSaleCreationRequest(testHelper, owner, baseAsset, defaultQuoteAsset, startTime, endTime, softCap, hardCap, quoteAssets, isCrowdfunding)
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
        if(isUndefined(sale)){
            console.log("received 404 for reviewable request - retrying");
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() => checkSaleState(testHelper, baseAsset));
        }
        else {
       let operation = StellarSdk.SaleRequestBuilder.checkSaleState({saleID: sale.id});
    return testHelper.server.submitOperationGroup([operation], testHelper.master.accountId(), testHelper.master);}
    }).then(response => {
        return response;
    });
}


function manageSale(testHelper, action, saleOwner) {

    return testHelper.server.sales().forOwner(saleOwner.accountId())
        .call()
        .then(sales => {
        return sales.records[0];
    }).then(sale => {
        /*if(isUndefined(sale)) if(isUndefined(sale)){
            console.log("received 404 for reviewable request - retrying");
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() => manageSale(testHelper, action,saleOwner));
        }
        else {*/
            console.log(sale.id);
        let operation = StellarSdk.SaleRequestBuilder.manageSale({saleId: sale.id, action: action});
        return testHelper.server.submitOperationGroup([operation], saleOwner.accountId(), saleOwner)
    }).then(response => {
        return response;
    });
}

module.exports = {
    createSaleCreationRequest,
    createSale,
    checkSaleState,
    manageSale
}