const StellarSdk = require('../../lib/index');
var accountHelper = require('./accounts')



function createOffer(testHelper, source, baseAsset, quoteAsset, price, baseAmount, isBuy, orderBookID) {
    return accountHelper.loadBalanceIDForAsset(testHelper, source.accountId(), baseAsset)
    .then(baseBalanceID => {
        return accountHelper.loadBalanceIDForAsset(testHelper, source.accountId(), quoteAsset).then(quoteBalanceID => {
            return {baseBalanceID, quoteBalanceID};
        })
    }).then(balances => {
        let opts = {
            baseBalance: balances.baseBalanceID,
            quoteBalance: balances.quoteBalanceID,
            isBuy: isBuy,
            amount: baseAmount,
            price: price,
            orderBookID: orderBookID,
            fee: "0",
        };

        let operation = StellarSdk.ManageOfferBuilder.manageOffer(opts);
        return testHelper.server.submitOperationGroup([operation], source.accountId(), source);
    });
}

function findQuoteAssetForAsset(sale, quoteAsset) {
    for (var i = 0; i < sale.quote_assets.quote_assets.length; i++) {
        if (sale.quote_assets.quote_assets[i].asset == quoteAsset) {
            return sale.quote_assets.quote_assets[i];
        }
    }

    throw new Error("Failed to find quote asset of the sale for asset: " + quoteAsset);
}

function participateInSale(testHelper, source, baseAsset, quoteAmount, quoteAsset) {
    return testHelper.server.sales().forBaseAsset(baseAsset).callWithSignature(source).then(sales => {
        return sales.records[0];
    }).then(sale => {
        let saleQuoteAsset = findQuoteAssetForAsset(sale, quoteAsset);
        let baseAmount = Math.round(Number.parseFloat(quoteAmount)/Number.parseFloat(saleQuoteAsset.price) * StellarSdk.Operation.ONE) /StellarSdk.Operation.ONE;
        console.log(baseAmount);
        return createOffer(testHelper, source, sale.base_asset, quoteAsset, saleQuoteAsset.price, baseAmount.toString(), true, sale.id);
    });
}

module.exports = {
    createOffer,
    participateInSale
}