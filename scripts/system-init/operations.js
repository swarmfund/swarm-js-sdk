const config = require('../config')
const helpers = require('./../helpers')
const StellarSdk = require('../../lib/index');
const _ = require('lodash');

let env = 'staging';
let currentConfig = config.getConfig(env);

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
        accountId: 'GDS67HI27XJIJEL7IGHVJVNHPXZLMW6F3O45OXIMKAUNGIR2ROBUKTT4',
        policy: 0,
        accountType: StellarSdk.xdr.AccountType.notVerified().value
    },
]

const baseAssetPolicy = StellarSdk.xdr.AssetPolicy.transferable().value |
    StellarSdk.xdr.AssetPolicy.baseAsset().value | StellarSdk.xdr.AssetPolicy.twoStepWithdrawal().value;

const tokensForIssuance = [
    {code: 'SUN', policy: baseAssetPolicy, maxAmount: "100000000", amount: '10000000', emit: '1500'},
    {code: 'USD', policy: 0, maxAmount: "0"},
    {code: 'BTC', policy: 0, maxAmount: "0"},
    {code: 'ETH', policy: 0, maxAmount: "0"},
]

const assetPairs = [
    {base: 'BTC', quote: 'SUN', policy: 0, price: "19842"},
    {base: 'ETH', quote: 'SUN', policy: 0, price: "842"},
    {base: 'SUN', quote: 'USD', policy: 0, price: "1"},
]

module.exports = {
    createAssets: () => {
        return tokensForIssuance.map(asset =>
            helpers.assets.createAsset(currentConfig, currentConfig.master, currentConfig.master.accountId(), asset.code, asset.policy, asset.maxAmount)
        )
    },

    createAssetPairs: () => {
        return assetPairs.map(pair => helpers.assets.createAssetPair(currentConfig, pair.base, pair.quote, pair.price))
    },

    preEmitCoins: () => {
        return tokensForIssuance.map(asset => {
            if (asset.maxAmount === "0") {
                return Promise.resolve()
            }
            return helpers.issuance.performPreIssuance(currentConfig, currentConfig.master, currentConfig.master, asset.code, asset.amount)
        })
    },

    createAccount: () => {
        return accounts.map(a => helpers.accounts.createNewAccount(currentConfig, a.accountId, a.accountType, a.policy))
    },

    issueTokens: () => {
        return accounts.map(a => {
            return tokensForIssuance.map(asset => {
                if (asset.maxAmount === "0") {
                    return Promise.resolve()
                }
                return helpers.accounts.loadBalanceIDForAsset(currentConfig, a.accountId, asset.code)
                    .then(bId => helpers.issuance.issue(currentConfig, currentConfig.master, bId, asset.code, asset.emit))
            })
        })
    },

    addAdmins: () => {
        return _.map(currentConfig.admins, (details, address) =>
            helpers.accounts.addSuperAdmin(
                currentConfig, currentConfig.master.accountId(), currentConfig.master, address, details
            )
        )
    },

    setThresholds: () => helpers.accounts.setThresholds(currentConfig, currentConfig.master.accountId(), currentConfig.master, currentConfig.thresholds)

}

