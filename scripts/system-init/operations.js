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

const baseAssetPolicy = StellarSdk.xdr.AssetPolicy.transferable().value +
  StellarSdk.xdr.AssetPolicy.baseAsset().value

const tokensForIssuance = [
    {code: 'SUN', policy: baseAssetPolicy, maxAmount: "100000000", amount: '100000', emit: '1500' },
    {code: 'USD', policy: baseAssetPolicy, maxAmount: "0"  },
    {code: 'BTC', policy: 0, maxAmount: "0" },
    {code: 'ETH', policy: 0, maxAmount: "0" },
]

const assetPairs = [
    { base: 'BTC', quote: 'SUN', policy: 0, price: "19842" },
    { base: 'ETH', quote: 'SUN', policy: 0, price: "842"},
    { base: 'SUN', quote: 'USD', policy: 0, price: "1"},
]

module.exports = {
    createAssets: () => {
        return tokensForIssuance.map(asset =>
             helpers.assets.createAsset(config, config.master, config.master.accountId(), asset.code, asset.policy, asset.maxAmount)
            )
    },

    createAssetPairs: () => {
        return assetPairs.map(pair => helpers.assets.createAssetPair(config, pair.base, pair.quote, pair.price))
    },

    preEmitCoins: () => {
        return tokensForIssuance.map(asset => {
            if (asset.maxAmount === "0") {
                return Promise.resolve()
            }
            return helpers.issuance.performPreIssuance(config, config.master, config.master, asset.code, asset.amount)
        })
    },

    createAccount: () => { 
        return accounts.map(a => helpers.accounts.createNewAccount(config, a.accountId, a.accountType, a.policy))
    },

    issueTokens: () => {
        return accounts.map(a => {
            return tokensForIssuance.map(asset => {
                if (asset.maxAmount === "0") {
                    return Promise.resolve()
                }
                return helpers.accounts.loadBalanceIDForAsset(config, a.accountId, asset.code)
                    .then(bId => helpers.issuance.issue(config, config.master, bId, asset.code, asset.emit))
            })
        })
    },

    addAdmins: () => config.admins.map((a, i) => helpers.accounts.addSuperAdmin(config.master.accountId(), config.master, a, i))
}

