function setFees(testHelper, feeType, fixedFee, percentFee, asset = baseAsset, subtype = '0', feeAsset = undefined) {
    return testHelper.server.loadAccountWithSign(testHelper.master.accountId(), testHelper.master)
        .then(source => {
            let opts = {
                fee: {
                    feeType,
                    asset,
                    fixedFee,
                    percentFee,
                    subtype: subtype,
                    upperBound: "10000000",
                    feeAsset: feeAsset,
                }
            };

            let op = StellarSdk.Operation.setFees(opts);
            let tx = new StellarSdk.TransactionBuilder(source)
                .addOperation(op)
                .build();

            tx.sign(testHelper.master);

            return testHelper.server.submitTransaction(tx);
        });
}

module.exports = {
  setFees
};