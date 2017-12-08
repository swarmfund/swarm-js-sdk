const StellarSdk = require('../../lib/index');


function createNewAccount(testHelper, account) {
    const opts = {
        destination: account.accountId,
        accountType: account.accountType,
        source: testHelper.master.accountId(),
        accountPolicies: account.policies,
    };
    const operation = StellarSdk.Operation.createAccount(opts);
    return testHelper.server.submitOperation(operation, testHelper.master.accountId(), testHelper.master);
}

function findBalanceByAsset(balances, asset) {
    for (var i = 0; i < balances.length; i++) {
        if (balances[i].asset === asset) {
            return balances[i]
        }
    }
}

function loadBalanceForAsset(testHelper, accountId, asset) {
    return testHelper.server.loadAccountWithSign(accountId, testHelper.master)
        .then(source => {
            return findBalanceByAsset(source.balances, asset)
        });
}

function loadBalanceIDForAsset(testHelper, accountId, asset) {
    return loadBalanceForAsset(testHelper, accountId, asset).then(balance => {
        return balance.balance_id;
    })
}

module.exports = {
  createNewAccount,
  loadBalanceIDForAsset
}
