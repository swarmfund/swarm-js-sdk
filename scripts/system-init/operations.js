const config = require('./config')
const helpers = require('./../helpers')
const StellarSdk = require('../../lib/index');

const accounts = [
    {
        email: 'alice@mail.com', 
        accountId: 'GABEAZ4VBERMJY5PAEMOP7AS2VFCRAKXB3J3A3IHZ25DIZFSWG2S4AE6',
        policy: 0,
        accountType: StellarSdk.xdr.AccountType.notVerified().value
    },
    {
        email: 'bob@mail.com', 
        accountId: 'GDJIZI4U67IZPWV26PYMPSIQTVTZAUDDID5PLA7W54ZKW6TEB664UQZT',
        policy: 0,
        accountType: StellarSdk.xdr.AccountType.notVerified().value
    },
    {
        email: 'john@mail.com', 
        accountId:'GDS67HI27XJIJEL7IGHVJVNHPXZLMW6F3O45OXIMKAUNGIR2ROBUKTT4',
        policy: 0,
        accountType: StellarSdk.xdr.AccountType.notVerified().value
    },
]

const tokensForIssuance = [
    {code: 'SUN', amount: '100000', emit: '1500'},
    {code: 'USD', amount: '100000', emit: '1500'},
]

module.exports = {
    createAssets: () => {
        return tokensForIssuance.map(asset =>
             helpers.createAsset(config, config.master, config.master.accountId(), asset.code)
            )
    },
    preEmitCoins: () => {
        return tokensForIssuance.map(asset =>
            helpers.performPreIssuance(config, config.master, config.master, asset.code, asset.amount)
        )
    },
    createAccount: () => { 
        return accounts.map(a => helpers.createAccount(config, a))
    },
    issueTokens: () => {
        return accounts.map(a => {
            return tokensForIssuance.map(asset => {
                return helpers.loadBalanceIDForAsset(config, a.accountId, asset.code)
                    .then(bId => helpers.issue(config, config.master, bId, asset.code, asset.emit))
            })
        })
    }
}

