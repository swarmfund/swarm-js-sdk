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
    return loadBalanceForAsset(testHelper, accountKP, asset).then(balance => {
        return balance.balance_id;
    })
}