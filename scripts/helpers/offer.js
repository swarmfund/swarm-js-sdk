const StellarSdk = require('../../lib/index');
import * as accountHelper from './accounts'



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

function participateInSale(testHelper, source, baseAsset, quoteAmount) {
    return testHelper.server.sales().forBaseAsset(baseAsset).callWithSignature(source).then(sales => {
        return sales.records[0];
    }).then(sale => {
        let baseAmount = Number.parseFloat(quoteAmount)/Number.parseFloat(sale.price);
        return createOffer(testHelper, source, sale.base_asset, sale.quote_asset, sale.price, baseAmount.toString(), true, sale.id);
    });
}

module.exports = {
    createOffer,
    participateInSale
}