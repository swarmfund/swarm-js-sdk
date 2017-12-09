const asset = require('./asset')
const accounts = require('./accounts')
const fees = require('./fees')

function errorHandler(error) {
    console.info('Operation failed', error);
    if (error.response) {
        console.info('with status', error.response.status);
        console.info('ERROR -------------------->>>');
        console.info(JSON.stringify(error.response.data, null, 2));
        console.info('<<<--------------------------');
    } else {
        console.info('ERROR -------------------->>>');
        console.info('with error', JSON.stringify(error, null, 2));
        console.info('<<<--------------------------');
    }
}

module.exports = {
    createAccount: accounts.createNewAccount,
    createAsset: asset.createAsset,
    issue: issuance.issue,
    setFees: fees.setFees,
    loadBalanceIDForAsset: accounts.loadBalanceIDForAsset,
    performPreIssuance: issuance.performPreIssuance,
    errorHandler: errorHandler
}