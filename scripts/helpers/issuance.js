const StellarSdk = require('../../lib/index');
var reviewableRequestHelper = require('./review_request')
var accountHelper = require('./accounts')


function createPreIssuanceRequest(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount) {
    var preIssuanceRequest = StellarSdk.PreIssuanceRequest.build({
        amount: amount,
        reference: StellarSdk.Keypair.random().accountId(),
        asset: assetCode,
        keyPair: preIssuanceKP,
    });
    let op = StellarSdk.PreIssuanceRequestOpBuilder.createPreIssuanceRequestOp({ request: preIssuanceRequest });
    return testHelper.server.submitOperation(op, assetOwnerKP.accountId(), assetOwnerKP);
}

function performPreIssuance(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount) {
    return createPreIssuanceRequest(testHelper, assetOwnerKP, preIssuanceKP, assetCode, amount)
        .then(response => {
            let result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            let fulfilled = result.result().results()[0].tr().createPreIssuanceRequestResult().success().fulfilled();
            if (fulfilled)
                return response;
            let id = result.result().results()[0].tr().createPreIssuanceRequestResult().success().requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        })
        .then(res => {
            console.log('PerformedPreIssuance: ', amount, assetCode)
            return res
        }).catch(err => {
            console.log(err.response.data.extras)
        });
}

function issue(testHelper, requestor, receiverBalanceID, asset, amount) {
    const opts = {
        asset: asset,
        amount: amount,
        receiver: receiverBalanceID,
        reference: StellarSdk.Keypair.random().accountId(),
        externalDetails: { a: "some external details" },
    };

    const op = StellarSdk.CreateIssuanceRequestBuilder.createIssuanceRequest(opts);
    return testHelper.server.submitOperation(op, requestor.accountId(), requestor)
      .then(res => {
        console.log('Issued: ', amount, asset, 'to', receiverBalanceID)
        return res
      });
}

// fundAccount - creates new balance and issues funds to it
function fundAccount(testHelper, accountToBeFundedKP, assetCode, assetOwnerKP, amount) {
    return accountHelper.createBalanceForAsset(testHelper, accountToBeFundedKP, assetCode)
        .then(() => accountHelper.loadBalanceIDForAsset(testHelper, accountToBeFundedKP.accountId(), assetCode))
        .then(balanceID => issue(testHelper, assetOwnerKP, balanceID, assetCode, amount))
}

module.exports = {
    createPreIssuanceRequest,
    performPreIssuance,
    issue,
    fundAccount
}