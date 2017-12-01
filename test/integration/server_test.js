import * as feesHelper from './fees_helper'
import * as reviewableRequestHelper from './review_request_helper'


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

    function createNewAccount(accountId, accountType, accountPolicies = undefined) {
        let opts = {
            destination: accountId,
            accountType: accountType,
            source: master.accountId(),
            accountPolicies: accountPolicies,
        };
        let operation = StellarSdk.Operation.createAccount(opts);
        return server.submitOperation(operation, master.accountId(), master);
    }
    

    function createAsset(owner, issuer, assetCode) {
        let opts = {
            requestID: "0",
            code: assetCode,
            name: assetCode +" name",
            preissuedAssetSigner: issuer,
            description: "Description",
            externalResourceLink:"https://myasset.com",
            maxIssuanceAmount: "100000000",
            policies: StellarSdk.xdr.AssetPolicy.assetTransferable().value,

        };
        let operation = StellarSdk.ManageAssetBuilder.assetCreationRequest(opts);
        return server.submitOperation(operation, owner.accountId(), owner);
    }

    it("Create account", function (done) {
        let newAccountKP = StellarSdk.Keypair.random();
        createNewAccount(newAccountKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it("Create asset", function(done) {
        var assetCode = "USD" + Math.floor(Math.random()*1000);
        createAsset(master, master.accountId(), assetCode).then((response)=> {
            var result = StellarSdk.xdr.TransactionResult.fromXDR(new Buffer(response.result_xdr, "base64"));
            var id = result.result().results()[0].tr().manageAssetResult().success().requestId().toString();
            return reviewableRequestHelper.reviewRequest(testHelper, id, master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "");
        }).then(() => done()).catch(err => {done(err)});
    });
})