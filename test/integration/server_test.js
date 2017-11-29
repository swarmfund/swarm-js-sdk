describe("Integration test", function () {
    // We need to wait for a ledger to close
    const TIMEOUT = 60 * 20000;
    this.timeout(TIMEOUT);
    this.slow(TIMEOUT / 2);
    
    StellarSdk.Network.use(new StellarSdk.Network("Test SDF Network ; September 2015"))
    let server = new StellarSdk.Server('http://127.0.0.1:8000', { allowHttp: true });
    let master = StellarSdk.Keypair.fromSecret("SCIMXOIWIB32R7JI6ISNYSCO2BFST5E6P3TLBM4TTLHH57IK6SJPGZT2");

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

    it("Create account", function (done) {
        let newAccountKP = StellarSdk.Keypair.random();
        createNewAccount(newAccountKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
})