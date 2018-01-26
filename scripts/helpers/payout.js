const StellarSdk = require('../../lib/index');

function performPayout(testHelper, source, asset, sourceBalanceId, maxPayoutAmount) {
    const opts = {
        asset: asset,
        sourceBalanceId: sourceBalanceId,
        maxPayoutAmount: maxPayoutAmount,
        fee: {
            fixed: "0",
            percent: "0"
        },
    };
    const operation = StellarSdk.PayoutOpBuilder.payoutOp(opts);
    return testHelper.server.submitOperation(operation, source.accountId(), source);
}

module.exports = {
    performPayout
};
