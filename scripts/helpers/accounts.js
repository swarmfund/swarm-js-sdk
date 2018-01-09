const StellarSdk = require('../../lib/index');

function createNewAccount(testHelper, accountId, accountType, accountPolicies = undefined) {
    const opts = {
        destination: accountId,
        accountType: accountType,
        source: testHelper.master.accountId(),
        accountPolicies: accountPolicies,
    };
    const operation = StellarSdk.Operation.createAccount(opts);
    return testHelper.server.submitOperation(operation, testHelper.master.accountId(), testHelper.master)
        .then(res => {
            console.log('Account created: ', accountId)
            return res
        })
}

function createBalanceForAsset(testHelper, sourceKP, assetCode) {
    let opts = {
        destination: sourceKP.accountId(),
        action: StellarSdk.xdr.ManageBalanceAction.create(),
        asset: assetCode,
    };
    const operation = StellarSdk.Operation.manageBalance(opts);
    return testHelper.server.submitOperation(operation, sourceKP.accountId(), sourceKP)
        .then(res => {
            console.log('Balance created for ', sourceKP.accountId())
            return res
        })
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


function addSuperAdmin(testHelper, sourceAccId, keypair, address, details) {
    console.log("Add SuperAdmin: ", address)
    var source = new StellarSdk.Account(sourceAccId)
    var tx = new StellarSdk.TransactionBuilder(source)
        .addOperation(StellarSdk.Operation.setOptions({
            signer: {
                pubKey: address,
                weight: details.weight,
                signerType: details.type,
                identity: `${details.identity}`,
                name: details.name,
            }
        }))
        .build();

    tx.sign(keypair);
    return testHelper.server.submitTransaction(tx)
}

function setThresholds(helper, source, kp, thresholds) {
    var tx = new StellarSdk.TransactionBuilder(new StellarSdk.Account(source))
        .addOperation(StellarSdk.Operation.setOptions({
            masterWeight: thresholds.master || undefined,
            highThreshold: thresholds.high || undefined,
            mediumThreshold: thresholds.medium || undefined,
            lowThreshold: thresholds.low || undefined,
        }))
        .build();

    tx.sign(kp);
    return helper.server.submitTransaction(tx)
}

module.exports = {
    createNewAccount,
    createBalanceForAsset,
    loadBalanceForAsset,
    loadBalanceIDForAsset,
    addSuperAdmin,
    setThresholds,
}
