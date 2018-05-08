const StellarSdk = require('../../lib/index');

function paymentV2ForAccount(testHelper, sourceKP, sourceBalanceID, destAccountID, amount, sourceFeeAsset, destFeeAsset, sourcePaysForDest) {
    let opts = _prepareOpts(sourceBalanceID, amount, sourceFeeAsset, destFeeAsset, sourcePaysForDest);
    opts.destination = destAccountID;

    let op = StellarSdk.PaymentV2Builder.paymentV2ForAccount(opts);
    return testHelper.server.submitOperation(op, sourceKP.accountId(), sourceKP);
}

function paymentV2ForBalance(testHelper, sourceKP, sourceBalanceID, destBalanceID, amount, sourceFeeAsset, destFeeAsset, sourcePaysForDest) {
    let opts = _prepareOpts(sourceBalanceID, amount, sourceFeeAsset, destFeeAsset, sourcePaysForDest);
    opts.destination = destBalanceID;

    let op = StellarSdk.PaymentV2Builder.paymentV2ForBalance(opts);
    return testHelper.server.submitOperation(op, sourceKP.accountId(), sourceKP);
}

function _prepareOpts(sourceBalanceID, amount, sourceFeeAsset, destFeeAsset, sourcePaysForDest) {
    let opts = {
        sourceBalanceId: sourceBalanceID,
        amount: amount,
        feeData: {
            sourceFee: {
                maxPaymentFee: "20",
                fixedFee: "10",
                feeAsset: sourceFeeAsset,
            },
            destinationFee: {
                maxPaymentFee: "5",
                fixedFee: "5",
                feeAsset: destFeeAsset,
            },
            sourcePaysForDest: sourcePaysForDest,
        },
        subject: "Payment V2 test",
        reference: "",
    };

    return opts;
}

module.exports = {
    paymentV2ForAccount,
    paymentV2ForBalance
};