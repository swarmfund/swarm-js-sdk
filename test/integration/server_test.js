import * as feesHelper from '../../scripts/helpers/fees'
import * as reviewableRequestHelper from '../../scripts/helpers/review_request'
import * as issuanceHelper from '../../scripts/helpers/issuance'
import * as assetHelper from '../../scripts/helpers/asset'
import * as accountHelper from '../../scripts/helpers/accounts'
import * as withdrawHelper from '../../scripts/helpers/withdraw'
import * as saleHelper from '../../scripts/helpers/sale'

let config = require('../../scripts/config');

describe("Integration test", function () {
    // We need to wait for a ledger to close
    const TIMEOUT = 60 * 20000;
    this.timeout(TIMEOUT);
    this.slow(TIMEOUT / 2);

    let env = 'dev';
    let currentConfig = config.getConfig(env);
    let server = currentConfig.server;
    let master = currentConfig.master;

    let testHelper = {
        master: master,
        server: server,
    };

    before(function (done) {
        this.timeout(60 * 1000);
        checkConnection(done);
    });

    function checkConnection(done) {
        server.loadAccountWithSign(master.accountId(), master)
            .then(source => {
                console.log('Horizon up and running!');
                done();
            })
            .catch(err => {
                console.log(err);
                console.log("Couldn't connect to Horizon... Trying again.");
                setTimeout(() => checkConnection(done), 20000);
            });
    }

    it("Create asset and perform issuance", function (done) {
        var assetCode = "USD" + Math.floor(Math.random() * 1000);
        var assetPolicy = StellarSdk.xdr.AssetPolicy.transferable().value |  StellarSdk.xdr.AssetPolicy.withdrawable().value;
        var preIssuedAmount = "10000.0000";
        var syndicateKP = StellarSdk.Keypair.random();
        var newAccountKP = StellarSdk.Keypair.random();
        console.log("Creating new account for issuance " + syndicateKP.accountId());
        accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
            .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), assetCode, assetPolicy))
            .then(() => issuanceHelper.performPreIssuance(testHelper, syndicateKP, syndicateKP, assetCode, preIssuedAmount))
            .then(() => accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.general().value, 0))
            .then(() => accountHelper.createBalanceForAsset(testHelper, newAccountKP, assetCode))
            .then(() => accountHelper.loadBalanceIDForAsset(testHelper, newAccountKP.accountId(), assetCode))
            .then(balanceID => issuanceHelper.issue(testHelper, syndicateKP, balanceID, assetCode, preIssuedAmount))
            .then(() => accountHelper.loadBalanceForAsset(testHelper, newAccountKP.accountId(), assetCode))
            .then(balance => {
                expect(balance.balance).to.be.equal(preIssuedAmount);
                
            })
            // withdraw all the assets available with auto conversion to BTC
            .then(() => {
                let autoConversionAsset = "BTC" + Math.floor(Math.random() * 1000);
                return assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), autoConversionAsset, 0)
                .then(() => assetHelper.createAssetPair(testHelper, assetCode, autoConversionAsset))
                .then(() => accountHelper.loadBalanceIDForAsset(testHelper, newAccountKP.accountId(), assetCode))
                .then(balanceID => {
                    return withdrawHelper.withdraw(testHelper, newAccountKP, balanceID, preIssuedAmount, autoConversionAsset)
                })
                .then(requestID => {
                    return reviewableRequestHelper.reviewWithdrawRequest(testHelper, requestID, syndicateKP, StellarSdk.xdr.ReviewRequestOpAction.approve().value, 
                    "", "Updated external details")
                })
            }) 
            .then(() => done())
            .catch(err => { done(err) });
    });

    it("Update account from unverified to syndicate", function (done) {
        var newAccountKP = StellarSdk.Keypair.random();
        accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0)
            .then(() => {
                accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
            })
            .then(() => done())
            .catch(err => done(err));
    });

    it("Create sale for asset", function(done) {
        var syndicateKP = StellarSdk.Keypair.random();
        var baseAsset = "BTC" + Math.floor(Math.random() * 1000);
        var quoteAsset = "USD" + Math.floor(Math.random() * 1000);
        var startTime = Math.round((new Date()).getTime() / 1000);
        var maxIssuanceAmount = "500";
        var price = "4.5";
        var softCap = "2250";
        accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
        .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), baseAsset, 0, maxIssuanceAmount))
        .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), quoteAsset, 0))
        .then(() => saleHelper.createSale(testHelper, syndicateKP, baseAsset, quoteAsset, startTime + "", startTime + 60*10 + "", price, softCap, "20000"))
        .then(() => done())
        .catch(err => done(err));
    });
})