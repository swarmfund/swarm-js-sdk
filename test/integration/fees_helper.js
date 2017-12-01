export function setFees(testHelper, feeType, fixedFee, percentFee, asset = baseAsset) {
    return testHelper.server.loadAccountWithSign(testHelper.master.accountId(), testHelper.master)
        .then(source => {
            let opts = {
                fee: {
                    feeType,
                    asset,
                    fixedFee,
                    percentFee,
                    subtype: '0',
                    upperBound: "10000000"
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
