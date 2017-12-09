import * as feesHelper from './fees_helper'
import * as reviewableRequestHelper from './review_request_helper'
import * as issuanceHelper from './issuance_helper'
import * as assetHelper from './asset_helper'
import * as accountHelper from './accounts_helper'


describe("Integration test", function () {
    // We need to wait for a ledger to close
    const TIMEOUT = 60 * 20000;
    this.timeout(TIMEOUT);
    this.slow(TIMEOUT / 2);

    StellarSdk.Network.use(new StellarSdk.Network("Test SDF Network ; September 2015"))
    let server = new StellarSdk.Server('http://127.0.0.1:8000', { allowHttp: true });
    let master = StellarSdk.Keypair.fromSecret("SBMFQCGDVJBC2NYBRPURK3ISC4XJGGOLHMGHF7MIHVXE2DIQSMY6NYRH");

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
        var preIssuedAmount = "10000.0000";
        var syndicateKP = StellarSdk.Keypair.random();
        var newAccountKP = StellarSdk.Keypair.random();
        console.log("Creating new account for issuance " + syndicateKP.accountId());
        accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
            .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), assetCode))
            .then(() => issuanceHelper.performPreIssuance(testHelper, syndicateKP, syndicateKP, assetCode, preIssuedAmount))
            .then(() => accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0))
            .then(() => accountHelper.createBalanceForAsset(testHelper, newAccountKP, assetCode))
            .then(() => accountHelper.loadBalanceIDForAsset(testHelper, newAccountKP, assetCode))
            .then(balanceID => issuanceHelper.issue(testHelper, syndicateKP, balanceID, assetCode, preIssuedAmount))
            .then(() => accountHelper.loadBalanceForAsset(testHelper, newAccountKP, assetCode))
            .then(balance => {
                expect(balance.balance).to.be.equal(preIssuedAmount);
                done();
            })
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
    })
})