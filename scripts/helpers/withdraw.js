const StellarSdk = require('../../lib/index');

function withdraw(testHelper, source, balance, amount, externalDetails, destAsset) {
    // TODO add fees calculations and convert to destAsset
    const opts = {
        balance: balance,
        amount: amount,
        fee: {
            fixed: "0",
            percent: "0"
        },
        externalDetails: externalDetails,
        destAsset: destAsset,
        expectedDestAssetAmount: amount
    };
    const operation = StellarSdk.CreateWithdrawRequestBuilder.createWithdrawWithAutoConversion(opts);
    return testHelper.server.submitOperation(operation, source.accountId(), source)
        .then(response => {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().createWithdrawalRequestResult().success().requestId().toString();
            return id
        })
}

module.exports = {
    withdraw
}
