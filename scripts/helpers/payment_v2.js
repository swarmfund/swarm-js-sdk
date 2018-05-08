const StellarSdk = require('../../lib/index');

function paymentV2(testHelper, sourceKP, sourceBalanceID, destination, amount, sourceFeeAsset, destFeeAsset, sourcePaysForDest) {
    let opts = {
        sourceBalanceId: sourceBalanceID,
        destination: destination,
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

    let op = StellarSdk.PaymentV2Builder.paymentV2(opts);
    return testHelper.server.submitOperation(op, sourceKP.accountId(), sourceKP);
}

module.exports = {
    paymentV2
};