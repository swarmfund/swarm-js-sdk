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
    let master = StellarSdk.Keypair.fromSecret("SCIMXOIWIB32R7JI6ISNYSCO2BFST5E6P3TLBM4TTLHH57IK6SJPGZT2");

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




    function createAsset(owner, issuer, assetCode) {
        let opts = {
            requestID: "0",
            code: assetCode,
            name: assetCode + " name",
            preissuedAssetSigner: issuer,
            description: "Description",
            externalResourceLink: "https://myasset.com",
            maxIssuanceAmount: "100000000",
            policies: StellarSdk.xdr.AssetPolicy.assetTransferable().value,

        };
        let operation = StellarSdk.ManageAssetBuilder.assetCreationRequest(opts);
        return server.submitOperation(operation, owner.accountId(), owner);
    }

    it("Create account", function (done) {
        let newAccountKP = StellarSdk.Keypair.random();
        accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it("Create asset and perform issuance", function (done) {
        var assetCode = "USD" + Math.floor(Math.random() * 1000);
        var preIssuedAmount = "10000.0000";
        var newAccountKP = StellarSdk.Keypair.random();
        console.log("Creating new account for issuance " + newAccountKP.accountId());
        assetHelper.createAsset(testHelper, master, master.accountId(), assetCode)
            .then(() => issuanceHelper.performPreIssuance(testHelper, master, master, assetCode, preIssuedAmount))
            .then(() => accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0))
            .then(() => accountHelper.loadBalanceIDForAsset(testHelper, newAccountKP, assetCode))
            .then(balanceID => issuanceHelper.issue(testHelper, master, balanceID, assetCode, preIssuedAmount))
            .then(() => accountHelper.loadBalanceForAsset(testHelper, newAccountKP, assetCode))
            .then(balance => {
                expect(balance.balance).to.be.equal(preIssuedAmount);
                done();
            })
            .catch(err => { done(err) });
    });
})