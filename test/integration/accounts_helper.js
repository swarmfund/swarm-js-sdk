export function createNewAccount(testHelper, accountId, accountType, accountPolicies = undefined) {
    let opts = {
        destination: accountId,
        accountType: accountType,
        source: testHelper.master.accountId(),
        accountPolicies: accountPolicies,
    };
    let operation = StellarSdk.Operation.createAccount(opts);
    return testHelper.server.submitOperation(operation, testHelper.master.accountId(), testHelper.master);
}

export function createBalanceForAsset(testHelper, sourceKP, assetCode) {
    let opts = {
        destination: sourceKP.accountId(),
        balanceId: StellarSdk.Keypair.random().balanceId(),
        action: StellarSdk.xdr.ManageBalanceAction.manageBalanceCreate(),
        asset: assetCode,
    };

    let operation = StellarSdk.Operation.manageBalance(opts);
    return testHelper.server.submitOperation(operation, sourceKP.accountId(), sourceKP);
}

function findBalanceByAsset(balances, asset) {
    for (var i = 0; i < balances.length; i++) {
        if (balances[i].asset === asset) {
            return balances[i]
        }
    }
}

export function loadBalanceForAsset(testHelper, accountKP, asset) {
    return testHelper.server.loadAccountWithSign(accountKP.accountId(), accountKP)
        .then(source => {
            return findBalanceByAsset(source.balances, asset)
        });
}

export function loadBalanceIDForAsset(testHelper, accountKP, asset) {
    console.log("Loading balance for asset: " + asset);
    return loadBalanceForAsset(testHelper, accountKP, asset).then(balance => {
        return balance.balance_id;
    })
}