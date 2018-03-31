import * as feesHelper from '../../scripts/helpers/fees'
import * as reviewableRequestHelper from '../../scripts/helpers/review_request'
import * as issuanceHelper from '../../scripts/helpers/issuance'
import * as assetHelper from '../../scripts/helpers/asset'
import * as accountHelper from '../../scripts/helpers/accounts'
import * as withdrawHelper from '../../scripts/helpers/withdraw'
import * as saleHelper from '../../scripts/helpers/sale'
import * as offerHelper from '../../scripts/helpers/offer'
import * as limitsUpdateHelper from '../../scripts/helpers/limits_update'
import * as amlAlertHelper from '../../scripts/helpers/aml_alert'
import * as kycHelper from '../../scripts/helpers/kyc'

let config = require('../../scripts/config');

const MAX_INT64_AMOUNT = '9223372036854.775807';

describe("Integration test", function () {
    // We need to wait for a ledger to close
    const TIMEOUT = 60 * 20000;
    this.timeout(TIMEOUT);
    this.slow(TIMEOUT / 2);

    let env = 'local';
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


      it("Create and withdraw asset", function (done) {
            var assetCode = "USD" + Math.floor(Math.random() * 1000);
            var assetPolicy = StellarSdk.xdr.AssetPolicy.transferable().value | StellarSdk.xdr.AssetPolicy.withdrawable().value | StellarSdk.xdr.AssetPolicy.twoStepWithdrawal().value;
            var preIssuedAmount = "10000.000000";
            var syndicateKP = StellarSdk.Keypair.random();
            var newAccountKP = StellarSdk.Keypair.random();
            console.log("Creating new account for issuance " + syndicateKP.accountId());
            accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
                .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), assetCode, assetPolicy))
                .then(() => issuanceHelper.performPreIssuance(testHelper, syndicateKP, syndicateKP, assetCode, preIssuedAmount))
                .then(() => accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.general().value, 0))
                .then(() => issuanceHelper.fundAccount(testHelper, newAccountKP, assetCode, syndicateKP, preIssuedAmount))
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
                            return reviewableRequestHelper.reviewTwoStepWithdrawRequest(testHelper, requestID, syndicateKP, StellarSdk.xdr.ReviewRequestOpAction.approve().value,
                                "", { two_step_details: "Updated two step external details" }).then(() => {
                                    return reviewableRequestHelper.reviewWithdrawRequest(testHelper, requestID, syndicateKP, StellarSdk.xdr.ReviewRequestOpAction.approve().value,
                                        "", { one_step_withdrawal: "Updated external details" }, StellarSdk.xdr.ReviewableRequestType.withdraw().value)
                                });
                        })
                })
                .then(() => done())
                .catch(err => {
                    done(err)
                });
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
    
        it("Create sale for asset", function (done) {
            var syndicateKP = StellarSdk.Keypair.random();
            var baseAsset = "BTC" + Math.floor(Math.random() * 1000);
            var quoteAsset = "USD" + Math.floor(Math.random() * 1000);
            var startTime = Math.round((new Date()).getTime() / 1000);
            var price = 4.5;
            var softCap = 2250;
            var hardCap = 4500;
            var maxIssuanceAmount = hardCap / price;
            var saleParticipantKP = StellarSdk.Keypair.random();
            accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
                .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), baseAsset, 0, maxIssuanceAmount.toString(), maxIssuanceAmount.toString()))
                .then(() => assetHelper.createAsset(testHelper, testHelper.master, testHelper.master.accountId(), quoteAsset, StellarSdk.xdr.AssetPolicy.baseAsset().value, (hardCap).toString(), (hardCap).toString()))
                .then(() => saleHelper.createSale(testHelper, syndicateKP, baseAsset, quoteAsset, startTime + "", startTime + 60 * 10 + "", softCap.toString(), hardCap.toString(), [{
                    price: price.toString(),
                    asset: quoteAsset
                }]))
                .then(() => accountHelper.createNewAccount(testHelper, saleParticipantKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0))
                .then(() => issuanceHelper.fundAccount(testHelper, saleParticipantKP, quoteAsset, testHelper.master, (hardCap).toString()))
                .then(() => accountHelper.createBalanceForAsset(testHelper, saleParticipantKP, baseAsset))
                .then(() => offerHelper.participateInSale(testHelper, saleParticipantKP, baseAsset, hardCap.toString(), quoteAsset))
                .then(() => saleHelper.checkSaleState(testHelper, baseAsset))
                .then(() => done())
                .catch(err => done(err));
        });
    
    
        it("Create fundrasing for asset", function (done) {
            var syndicateKP = StellarSdk.Keypair.random();
            var baseAsset = "BTC" + Math.floor(Math.random() * 1000);
            var quoteAsset = "ETH" + Math.floor(Math.random() * 1000);
            var defaultQuoteAsset = "USD" + Math.floor(Math.random() * 1000);
            var startTime = Math.round((new Date()).getTime() / 1000);
            var price = 1;
            var softCap = 2250;
            var hardCap = 4500;
            var maxIssuanceAmount = hardCap / price;
            var saleParticipantKP = StellarSdk.Keypair.random();
            accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
                .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), baseAsset, 0, maxIssuanceAmount.toString(), maxIssuanceAmount.toString()))
                .then(() => assetHelper.createAsset(testHelper, testHelper.master, testHelper.master.accountId(), quoteAsset, StellarSdk.xdr.AssetPolicy.baseAsset().value, MAX_INT64_AMOUNT, MAX_INT64_AMOUNT))
                .then(() => assetHelper.createAsset(testHelper, testHelper.master, testHelper.master.accountId(), defaultQuoteAsset, StellarSdk.xdr.AssetPolicy.baseAsset().value, MAX_INT64_AMOUNT, MAX_INT64_AMOUNT))
                .then(() => assetHelper.createAssetPair(testHelper, quoteAsset, defaultQuoteAsset, "1"))
                .then(() => saleHelper.createSale(testHelper, syndicateKP, baseAsset, defaultQuoteAsset, startTime + "", startTime + 60 * 10 + "", softCap.toString(),
                    hardCap.toString(), [{ price: price.toString(), asset: quoteAsset }], true))
                .then(() => accountHelper.createNewAccount(testHelper, saleParticipantKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0))
                .then(() => issuanceHelper.fundAccount(testHelper, saleParticipantKP, quoteAsset, testHelper.master, MAX_INT64_AMOUNT))
                .then(() => accountHelper.createBalanceForAsset(testHelper, saleParticipantKP, baseAsset))
                .then(() => offerHelper.participateInSale(testHelper, saleParticipantKP, baseAsset, undefined, quoteAsset, '0.000001'))
                .then(() => assetHelper.updateAssetPrice(testHelper, quoteAsset, defaultQuoteAsset, "0.000001"))
                .then(() => offerHelper.participateInSale(testHelper, saleParticipantKP, baseAsset, (hardCap / 0.000001).toString(), quoteAsset))
                // first not remove offers with 0 base amount
                .then(() => saleHelper.checkSaleState(testHelper, baseAsset))
                // close sale
                .then(() => saleHelper.checkSaleState(testHelper, baseAsset))
                .then(() => done())
                .catch(err => done(err));
        });
    
        it("Create asset and change preissuer", function (done) {
            var syndicateKP = StellarSdk.Keypair.random();
            var preissuerKP = StellarSdk.Keypair.random();
            var newPreissuerKP = StellarSdk.Keypair.random();
            var code = "MATOKEN" + Math.floor(Math.random() * 1000);
            console.log("Asset code: " + code);
            console.log("pre issuer: " + preissuerKP.accountId());
            var maxIssuance = "101001";
            accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
                .then(() => assetHelper.createAsset(testHelper, syndicateKP, preissuerKP.accountId(), code, 0, maxIssuance, "0"))
                .then(() => accountHelper.addSuperAdmin(testHelper, syndicateKP.accountId(), syndicateKP, preissuerKP.accountId(), {
                    weight: 255,
                    type: StellarSdk.xdr.SignerType.txSender().value,
                    identity: 1,
                    name: "tx sender",
                }))
                .then(() => assetHelper.changePreIssuerSigner(testHelper, code, newPreissuerKP.accountId(), syndicateKP, preissuerKP))
                .then(() => accountHelper.addSuperAdmin(testHelper, syndicateKP.accountId(), syndicateKP, newPreissuerKP.accountId(), {
                    weight: 255,
                    type: StellarSdk.xdr.SignerType.txSender().value,
                    identity: 1,
                    name: "tx sender",
                }))
                .then(() => issuanceHelper.performPreIssuance(testHelper, syndicateKP, newPreissuerKP, code, maxIssuance))
                .then(() => done())
                .catch(err => {
                    done(err);
                })
        });
    
        it("Create referrer and two referrals", function (done) {
            let referrerKP = StellarSdk.Keypair.random();
            let firstReferralKP = StellarSdk.Keypair.random();
            let secondReferralKP = StellarSdk.Keypair.random();
            accountHelper.createNewAccount(testHelper, referrerKP.accountId(), StellarSdk.xdr.AccountType.general().value, 0)
                .then(() => accountHelper.createNewAccount(testHelper, firstReferralKP.accountId(), StellarSdk.xdr.AccountType.general().value, 0, referrerKP.accountId()))
                .then(() => accountHelper.createNewAccount(testHelper, secondReferralKP.accountId(), StellarSdk.xdr.AccountType.general().value, 0, referrerKP.accountId()))
                .then(() => done())
                .catch(err => {
                    done(err);
                })
    })

    it("Create KYC request and change KYC", function (done) {
        let newAccountKP = StellarSdk.Keypair.random();
        let requestID = "0";
        let kycLevel = 1;
        let kycData = { "hash": "bb36c7c58c4c32d98947c8781c91c7bb797c3647" };
        accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.notVerified().value, 0)
            .then(() => kycHelper.createKYCRequest(testHelper, newAccountKP, requestID, newAccountKP.accountId(), StellarSdk.xdr.AccountType.general().value, kycLevel, kycData))
            .then(requestID => reviewableRequestHelper.reviewUpdateKYCRequest(testHelper, requestID, master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "", 0, 30, {}))
            .then(() => done())
            .catch(err => done(err));
    });
    it("Create AML alert and approve and reject", function (done) {
        var assetCode = "ETH" + Math.floor(Math.random() * 1000);
        var preIssuedAmount = "10000.000000";
        var syndicateKP = StellarSdk.Keypair.random();
        var newAccountKP = StellarSdk.Keypair.random();
        let amlAlertAmount = Number(preIssuedAmount) / 2;
        console.log("Creating new account for issuance " + syndicateKP.accountId());
        accountHelper.createNewAccount(testHelper, syndicateKP.accountId(), StellarSdk.xdr.AccountType.syndicate().value, 0)
            .then(() => assetHelper.createAsset(testHelper, syndicateKP, syndicateKP.accountId(), assetCode, 0))
            .then(() => issuanceHelper.performPreIssuance(testHelper, syndicateKP, syndicateKP, assetCode, preIssuedAmount))
            .then(() => accountHelper.createNewAccount(testHelper, newAccountKP.accountId(), StellarSdk.xdr.AccountType.general().value, 0))
            .then(() => issuanceHelper.fundAccount(testHelper, newAccountKP, assetCode, syndicateKP, preIssuedAmount))
            .then(() => accountHelper.loadBalanceForAsset(testHelper, newAccountKP.accountId(), assetCode))
            .then(balance => {
                expect(balance.balance).to.be.equal(preIssuedAmount);
                return amlAlertHelper.createAMLAlert(testHelper, balance.balance_id, amlAlertAmount.toString())
            }).then(requestID => {
                return reviewableRequestHelper.reviewAmlAlertRequest(testHelper, requestID, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.approve().value, "",
                    "Testing AML requests");
            }).then(() => accountHelper.loadBalanceForAsset(testHelper, newAccountKP.accountId(), assetCode))
            .then(balance => {
                expect(Number(balance.balance)).to.be.equal(amlAlertAmount);
                return amlAlertHelper.createAMLAlert(testHelper, balance.balance_id, amlAlertAmount.toString())
            }).then(requestID => {
                return reviewableRequestHelper.reviewAmlAlertRequest(testHelper, requestID, testHelper.master, StellarSdk.xdr.ReviewRequestOpAction.permanentReject().value, "Already processed",
                    "Testing AML requests");
            }).then(() => accountHelper.loadBalanceForAsset(testHelper, newAccountKP.accountId(), assetCode))
            .then(balance => {
                expect(Number(balance.balance)).to.be.equal(amlAlertAmount);
                done();
            })
            .catch(err => { done(err) });
    });

});