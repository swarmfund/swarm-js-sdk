const asset = require('./asset')
const accounts = require('./accounts')
const issuance = require('./issuance')

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
    loadBalanceIDForAsset: accounts.loadBalanceIDForAsset,
    createAsset: asset.createAsset,
    issue: issuance.issue,
    performPreIssuance: issuance.performPreIssuance,
    errorHandler: errorHandler
}