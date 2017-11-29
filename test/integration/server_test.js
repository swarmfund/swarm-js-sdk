describe("integration tests", function () {
  // We need to wait for a ledger to close
  const TIMEOUT = 60 * 20000;
  this.timeout(TIMEOUT);
  this.slow(TIMEOUT / 2);

  // Docker Stellar
  StellarSdk.Network.use(new StellarSdk.Network("Test SDF Network ; September 2015"))
  let server = new StellarSdk.Server('http://127.0.0.1:8000', { allowHttp: true });
  let master = StellarSdk.Keypair.fromSecret("SCIMXOIWIB32R7JI6ISNYSCO2BFST5E6P3TLBM4TTLHH57IK6SJPGZT2");
  let issuance = StellarSdk.Keypair.fromSecret("SCIMXOIWIB32R7JI6ISNYSCO2BFST5E6P3TLBM4TTLHH57IK6SJPGZT2");
  let baseAsset = "USDT";
  let baseExchange = "System";
  before(function (done) {
    this.timeout(60 * 1000);
    checkConnection(done);
  });

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

  function findBalanceByAsset(balances, asset = baseAsset) {
    for (var i = 0; i < balances.length; i++) {
      if (balances[i].asset === asset) {
        return balances[i]
      }
    }
  }

  function findBalanceById(balances, balanceId) {
    for (var i = 0; i < balances.length; i++) {
      if (balances[i].balance_id === balanceId) {
        return balances[i]
      }
    }
  }

  function checkConnection(done) {
    server.loadAccountWithSign(master.accountId(), master)
      .then(source => {
        console.log('Horizon up and running!');
        done();
      })
      .catch(err => {
        console.log("Couldn't connect to Horizon... Trying again.");
        setTimeout(() => checkConnection(done), 20000);
      });
  }

  function addSigner(sourceID, signerKP, newSignerID, newSignerWeight, newSignerType, newSignerIdentity) {
    let opts = {
      signer: {
        pubKey: newSignerID,
        weight: newSignerWeight,
        signerType: newSignerType,
        identity: newSignerIdentity,
      },
    };
    let operation = StellarSdk.Operation.setOptions(opts);
    return server.submitOperation(operation, sourceID, signerKP);
  }

  function manageTrust(sourceID, signerKP, allowedAccount, balanceToUse, action) {
    let opts = {
      trustData: {
        allowedAccount,
        balanceToUse,
        action
      },
    };
    let operation = StellarSdk.Operation.setOptions(opts);
    return server.submitOperation(operation, sourceID, signerKP);
  }

  function setOptions(sourceID, signerKP, opts) {
    let op = StellarSdk.Operation.setOptions(opts);
    return server.submitOperation(op, sourceID, signerKP);
  }

  function manageBalance(source, destination, balanceId, action, asset = baseAsset) {
    let opts = {
      destination,
      balanceId,
      action,
      asset
    };
    let op = StellarSdk.Operation.manageBalance(opts);
    return server.submitOperation(op, source.accountId(), source);
  }

  function manageAsset(source, code,
    action = StellarSdk.xdr.ManageAssetAction.manageAssetCreate(), policies = 1, assetForms = []) {
    return server.loadAccountWithSign(source.accountId(), master)
      .then(txSourceAccount => {
        let opts = {
          action,
          code,
          physicalPrice,
          policies,
        };
        let op = StellarSdk.Operation.manageAsset(opts);
        let tx = new StellarSdk.TransactionBuilder(txSourceAccount)
          .addOperation(op)
          .build();

        tx.sign(source);

        return server.submitTransaction(tx);
      });
  }

  function manageForfeitRequest(source, balance, amount, details) {
    return server.loadAccountWithSign(source.accountId(), master)
      .then(txSourceAccount => {
        let opts = {
          balance,
          amount,
          details
        };
        let op = StellarSdk.Operation.manageForfeitRequest(opts);
        let tx = new StellarSdk.TransactionBuilder(txSourceAccount)
          .addOperation(op)
          .build();

        tx.sign(source);

        return server.submitTransaction(tx);
      });
  }
  function setLimitsForAccountType(accountType, dailyOut = 100100, weeklyOut = 100100, monthlyOut = 100100, annualOut = 100100, source = master) {
    let opts = {
      limits: {
        dailyOut,
        weeklyOut,
        monthlyOut,
        annualOut
      },
      accountType,
    };
    let op = StellarSdk.Operation.setLimits(opts);
    return server.submitOperation(op, source.accountId(), source);
  }

  function setLimitsForAccount(account, dailyOut = 200100, weeklyOut = 200100, monthlyOut = 200100, annualOut = 200100, source = master) {
    let opts = {
      limits: {
        dailyOut,
        weeklyOut,
        monthlyOut,
        annualOut
      },
      account,
    };
    let op = StellarSdk.Operation.setLimits(opts);
    return server.submitOperation(op, source.accountId(), source);
  }

  function recover(source, account, oldSigner, newSigner) {
    return server.loadAccountWithSign(source.accountId(), master)
      .then(txSourceAccount => {
        let opts = {
          account,
          oldSigner,
          newSigner
        };
        let op = StellarSdk.Operation.recover(opts);
        let tx = new StellarSdk.TransactionBuilder(txSourceAccount)
          .addOperation(op)
          .build();

        tx.sign(source);

        return server.submitTransaction(tx);
      });
  }

  function reviewPaymentRequest(paymentId, source = master, accept) {
    return server.loadAccountWithSign(source.accountId(), master)
      .then(txSourceAccount => {
        let rejectReason;
        if (!accept) {
          rejectReason = 'rejected test reason';
        }
        let opts = {
          paymentId,
          accept,
          rejectReason
        };
        let op = StellarSdk.Operation.reviewPaymentRequest(opts);
        let tx = new StellarSdk.TransactionBuilder(txSourceAccount)
          .addOperation(op)
          .build();

        tx.sign(source);

        return server.submitTransaction(tx);
      });
  }



  function manageInvoice(sourceKP, sender, receiverBalance, amount = '10', invoiceId = '0') {
    let opts = {
      sender,
      receiverBalance, amount, invoiceId,
    };
    let operation = StellarSdk.Operation.manageInvoice(opts);
    return server.submitOperation(operation, sourceKP.accountId(), sourceKP);
  }

  function createNewAccountBySigner(accountId, accountType, signer) {
    return server.loadAccountWithSign(master.accountId(), master)
      .then(source => {
        let opts = {
          destination: accountId,
          accountType: accountType,
          source: master.accountId(),
        };
        let op = StellarSdk.Operation.setFees(opts);
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(op)
          .build();

        tx.sign(signer);

        return server.submitTransaction(tx, true);
      });
  }

  function setFees(feeType, fixedFee, percentFee, asset = baseAsset) {
    return server.loadAccountWithSign(master.accountId(), master)
      .then(source => {
        let opts = {
          fees: [{
            feeType,
            asset,
            fixedFee,
            percentFee,
            subtype: '0'
          }
          ],
        };

        let op = StellarSdk.Operation.setFees(opts);
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(op)
          .build();

        tx.sign(master);

        return server.submitTransaction(tx);
      });
  }

  function refreshOptions() {
    let opts = {
      lowThreshold: 0,
      medThreshold: 0,
      masterWeight: 1
    };
    return setOptions(master.accountId(), master, opts)
  }



  function blockAccount(accountId, accountType) {
    return server.loadAccountWithSign(master.accountId(), master)
      .then(source => {
        let opts = {
          account: accountId,
          blockReasonsToAdd: 1,
          accountType
        };

        let op = StellarSdk.Operation.manageAccount(opts);
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(op)
          .build();

        tx.sign(master);

        return server.submitTransaction(tx);
      });
  }

  function buildPaymentWithBalances(sourceKP, sourceBalanceId, destination,
    destinationBalanceId, amount, subject, asset = baseAsset) {
    return server.fees().fee(StellarSdk.xdr.FeeType.paymentFee().value, asset).call()
      .then(fee => {
        let paymentFee = StellarSdk.Operation.calcPercentFee(amount, fee.percent);
        let fixedFee = fee.fixed;
        let feeData = {
          sourceFee: {
            paymentFee: paymentFee,
            fixedFee: fixedFee
          },
          destinationFee: {
            paymentFee: paymentFee,
            fixedFee: fixedFee
          },
          sourcePaysForDest: true
        };
        let opts = { destination, destinationBalanceId, sourceBalanceId, amount, subject, feeData };
        return StellarSdk.Operation.payment(opts);
      })
  }

  function buildPayment(sourceKP, destinationBalanceId, amount, subject, reference = '') {
    return server.loadAccountWithSign(sourceKP.accountId(), sourceKP)
      .then(source => {
        let sourceBalance = findBalanceByAsset(source.balances, baseAsset);
        let sourceBalanceId = sourceBalance.balance_id;
        let asset = sourceBalance.asset;
        return { sourceBalanceId, destinationBalanceId, amount, subject, asset };
      }).then(opts => {
        return server.fees().fee(StellarSdk.xdr.FeeType.paymentFee().value, opts.asset).call().then(fee => {
          let paymentFee = StellarSdk.Operation.calcPercentFee(opts.amount, fee.percent);
          let fixedFee = fee.fixed;
          opts.reference = reference;
          opts.feeData = {
            sourceFee: {
              paymentFee: paymentFee,
              fixedFee: fixedFee
            },
            destinationFee: {
              paymentFee: paymentFee,
              fixedFee: fixedFee
            },
            sourcePaysForDest: true
          };
          return StellarSdk.Operation.payment(opts);
        })
      })
  }

  function reviewInvoice(sourceKP, destinationBalanceId, amount, invoiceId, accept = true) {
    return server.loadAccountWithSign(sourceKP.accountId(), sourceKP)
      .then(source => {
        let sourceBalance = findBalanceByAsset(source.balances, baseAsset)
        let sourceBalanceId = sourceBalance.balance_id;
        let asset = sourceBalance.asset;
        return { sourceBalanceId, destinationBalanceId, amount, invoiceId, asset };
      }).then(opts => {
        return server.fees().fee(StellarSdk.xdr.FeeType.paymentFee().value, opts.asset).call().then(fee => {
          let paymentFee = StellarSdk.Operation.calcPercentFee(opts.amount, fee.percent);
          let fixedFee = fee.fixed;
          opts.feeData = {
            sourceFee: {
              paymentFee: paymentFee,
              fixedFee: fixedFee
            },
            destinationFee: {
              paymentFee: paymentFee,
              fixedFee: fixedFee
            },
            sourcePaysForDest: true
          };

          opts.invoiceReference = {
            invoiceId,
            accept
          };
          opts.subject = destinationBalanceId;
          return StellarSdk.Operation.payment(opts);
        })
      })
  }



  function buildDirectDebit(sourceKP, destinationBalanceId, amount, subject, from, reference = '') {
    return server.loadAccountWithSign(sourceKP.accountId(), sourceKP)
      .then(source => {
        let sourceBalance = findBalanceByAsset(source.balances, baseAsset)
        let sourceBalanceId = sourceBalance.balance_id;
        let asset = sourceBalance.asset;
        return { sourceBalanceId, destinationBalanceId, amount, subject, asset };
      }).then(paymentOpts => {
        return server.fees().fee(StellarSdk.xdr.FeeType.paymentFee().value, paymentOpts.asset).call().then(fee => {
          let paymentFee = StellarSdk.Operation.calcPercentFee(paymentOpts.amount, fee.percent);
          let fixedFee = fee.fixed;
          paymentOpts.reference = reference;
          paymentOpts.feeData = {
            sourceFee: {
              paymentFee: paymentFee,
              fixedFee: fixedFee
            },
            destinationFee: {
              paymentFee: paymentFee,
              fixedFee: fixedFee
            },
            sourcePaysForDest: true
          };
          let opts = {
            paymentOp: paymentOpts,
            from
          }
          return StellarSdk.Operation.directDebit(opts);
        })
      })
  }


  function manageCoinsEmissionRequest(requestOp, sourceKP) {
    return server.loadAccountWithSign(sourceKP.accountId(), sourceKP)
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(requestOp)
          .build();

        tx.sign(sourceKP);

        return server.submitTransaction(tx)
      });
  }

  function manualEmission(sourceKP, issuer, receiver, amount, asset = baseAsset, issuanceKP = issuance) {
    return server.loadAccountWithSign(sourceKP.accountId(), sourceKP)
      .then(source => {
        var opts = {
          request: {
            requestId: '0',
            receiver,
            issuer,
            amount,
            asset,
            reference: issuer
          },
          approve: true
        };
        let op = StellarSdk.Operation.reviewCoinsEmissionRequest(opts);
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(op)
          .build();

        tx.sign(sourceKP);
        return server.submitTransaction(tx);
      });
  }


  function reviewCoinsEmissionRequest(manageEmissionRequest, sourceKP, issuanceKP = issuance) {
    return server.loadAccountWithSign(sourceKP.accountId(), sourceKP)
      .then(source => {
        var opts = {
          request: manageEmissionRequest,
          approve: true
        };
        var serialNumber = StellarSdk.Keypair.random().accountId();
        var preEmOpts = {
          amount: manageEmissionRequest.amount,
          asset: manageEmissionRequest.asset,
          serialNumber,
          keyPairs: [issuanceKP]
        }
        var preEmission = StellarSdk.PreEmission.build(preEmOpts);
        opts.preEmissions = [preEmission.toXDR("hex")];
        let op = StellarSdk.Operation.reviewCoinsEmissionRequest(opts);
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(op)
          .build();

        tx.sign(sourceKP);
        return server.submitTransaction(tx);
      });
  }


  function buildCoinsEmissionRequestOp(sourceKP, receiver, amount, asset = baseAsset, requestId = '0', reference = '') {
    if (reference == '') {
      reference = StellarSdk.Keypair.random().accountId();
    }
    var opts = {
      requestId,
      receiver,
      amount,
      asset,
      reference,
      action: StellarSdk.xdr.ManageCoinsEmissionRequestAction.manageCoinsEmissionRequestCreate()
    };
    let operation = StellarSdk.Operation.manageCoinsEmissionRequest(opts);
    return server.submitOperation(operation, sourceKP.accountId(), sourceKP);
  }

  function submitPayment(paymentOp, sourceKP) {
    return server.submitOperation(paymentOp, sourceKP.accountId(), sourceKP);
  }

  function uploadPreemissions(sourceKP, asset = baseAsset, issuanceKP = issuance) {
    var opts = {};
    var preEmOpts = {
      amount: '100',
      asset,
      serialNumber: StellarSdk.Keypair.random().accountId(),
      keyPairs: [issuanceKP]
    }
    var preEmission = StellarSdk.PreEmission.build(preEmOpts);
    opts.preEmissions = [preEmission.toXDR("hex")];
    var op = StellarSdk.Operation.uploadPreemissions(opts);
    return server.submitOperation(op, sourceKP.accountId(), sourceKP);
  }

  const emitCoins = (n) => {
    console.log('emitting funds')
    let queue = Promise.resolve();
    var arr = Array.apply(null, { length: n }).map(Number.call, Number)
    arr.forEach(i => {
      queue = queue
        .then(() => uploadPreemissions(master))
    });
    queue = queue.then(() => console.log('emitted ok'));
    return queue
  };

  describe("help endpoints", function () {
    it("get fee for XAAU for payment", function (done) {
      server.fees().fee(0, baseAsset)
        .callWithSignature(master)
        .then(result => {
          console.log(result);
          expect(true);
          done();
        });
    });
  })

  describe("/transaction", function () {
    it("get transactions for master account", function (done) {
      server.transactions().forAccount("GDRYPVZ63SR7V2G46GKRGABJD3XPDNWQ4B4PQPJBTTDUEAKH5ZECPTSN")
        .callWithSignature(master)
        .then(result => {
          expect(true);
          done();
        });
    });
  });

  describe("/accounts", function () {
    it("create new account with policies", function (done) {
        let newAccount = StellarSdk.Keypair.random();
        createNewAccount(newAccount.accountId(), 2, 1)
        .then(result => {
            return server.accounts().accountId(newAccount.accountId())
                .callWithSignature(StellarSdk.Keypair.fromSecret("SCIMXOIWIB32R7JI6ISNYSCO2BFST5E6P3TLBM4TTLHH57IK6SJPGZT2"))
        })
        .then(account => {
          expect(account.policies.account_policies_type_i).to.equal(1);
          done();
        }).catch(err => done(err));
    })

    it("get master account", function (done) {
      server.accounts().accountId(master.accountId())
        .callWithSignature(StellarSdk.Keypair.fromSecret("SCIMXOIWIB32R7JI6ISNYSCO2BFST5E6P3TLBM4TTLHH57IK6SJPGZT2"))
        .then(account => {
          // The first account should be a master account
          expect(account.account_id).to.equal(master.accountId());
          done();
        });
    });

    it("get non master account", function (done) {
      let newAccount = StellarSdk.Keypair.random();
      createNewAccount(newAccount.accountId(), 2)
        .then(result => {
          return server.accounts().accountId(newAccount.accountId())
            .callWithSignature(StellarSdk.Keypair.fromSecret("SCIMXOIWIB32R7JI6ISNYSCO2BFST5E6P3TLBM4TTLHH57IK6SJPGZT2"))
        })
        .then(account => {
          expect(account.account_id).to.equal(newAccount.accountId());
          done();
        }).catch(err => done(err));
    });


    it("get non master account with its own signature", function (done) {
      let newAccount = StellarSdk.Keypair.random();
      createNewAccount(newAccount.accountId(), 2)
        .then(result => {
          return server.accounts().accountId(newAccount.accountId())
            .callWithSignature(newAccount)
        })
        .then(account => {
          expect(account.account_id).to.equal(newAccount.accountId());
          done();
        }).catch(err => {
          console.log(err);
          console.log(err.response);
          done(err);
        });
    });

    it("get non master account without signature", function (done) {
      server.accounts().accountId("GDNPGOAIFTB5QAW3HG2IXZXID4ZQOUXKWA7HQJD3SOMJIBU72TBSU55H")
        .call()
        .then(result => {
          done(result);
        }).catch(err => {
          expect(err.response.status).to.equal(404);
          done()
        });
    });

    it("create and block account", function (done) {
      let newAccount = StellarSdk.Keypair.random();
      createNewAccount(newAccount.accountId(), 2)
        .then(result => {
          return blockAccount(newAccount.accountId(), 2)
        })
        .then(result => {
          return server.accounts().accountId(newAccount.accountId())
            .callWithSignature(newAccount)
        })
        .then(account => {
          expect(account.account_id).to.equal(newAccount.accountId());
          expect(account.is_blocked).to.equal(true);
          done();
        }).catch(err => done(err));
    });
  });


  it("manual emission success", function (done) {
    let newAccount = StellarSdk.Keypair.random();
    let subject = 'subj123'
    let admin = 'GACTSHY7CWXU5QRASOWNRLL2JXNIN2N5L53CH6T4YATRJK3XSIUU6KFL'
    console.log('creating acc: ');
    console.log(newAccount.accountId());
    createNewAccount(newAccount.accountId(), 2)
      .then(result => {
        console.log('upload emission');
        return uploadPreemissions(master);
      })
      .then(result => {
        console.log('manual emission');
        return manualEmission(master, master.accountId(), newAccount.balanceId(), '100');
      })
      .then(result => {
        return server.accounts().accountId(newAccount.accountId()).callWithSignature(newAccount)
      })
      .then(result => {
        var baseBalance = findBalanceById(result.balances, newAccount.balanceId())
        expect(baseBalance.balance).to.equal('100.0000');
        done();
      }).catch(err => {
        console.log(err.response);
        done(err);
      });
  })

  it("review coins emission request", function (done) {
    let newAccount = StellarSdk.Keypair.random();
    let op;
    createNewAccount(newAccount.accountId(), 2)
      .then(result => {
        console.log('upload emission');
        return uploadPreemissions(master);
      })
      .then(result => {
        console.log('building request');
        return buildCoinsEmissionRequestOp(master, newAccount.balanceId(), '100');
      })
      .then(result => {
        return server.emissionRequests().forReference(newAccount.balanceId()).callWithSignature(master);
      }).then(result => {
        return new Promise(resolve => setTimeout(resolve, 2000))
      })
      .then(result => {
        console.log('obtaining');
        return server.emissionRequests().order('desc').callWithSignature(master);
      })
      .then(response => {
        return server.emissionRequests().coinsEmissionRequest(response.records[0].paging_token).callWithSignature(master);
      })
      .then(result => {
        console.log(result);
        expect(result.approved).to.equal(true);
        return server.accounts().accountId(newAccount.accountId()).callWithSignature(newAccount)
      })
      .then(result => {
        console.log(result.balances);
        var baseBalance = findBalanceById(result.balances, newAccount.balanceId())
        expect(baseBalance.balance).to.equal('100.0000');
        done();
      }).catch(err => {
        console.log(err);
        console.log(err.response.data.extras);
        done(err.response);
      });
  });

    describe("/recover", function () {
        it("create account and recover master key", function (done) {
            let oldAccount = StellarSdk.Keypair.random().accountId();
            let newSigner = StellarSdk.Keypair.random().accountId();
            createNewAccount(oldAccount, 2)
                .then(result => {
                    return server.accounts().accountId(oldAccount).callWithSignature(master)
                })
                .then(result => {
                    expect(result.signers.length).to.equal(1);
                    expect(result.signers[0].public_key).to.equal(oldAccount);
                })
                .then(result => {
                    console.log('manage recovery request');
                    return recover(master, oldAccount, oldAccount, newSigner)
                })
                .then(result => {
                    // waiting for tx to get into horizon
                    return new Promise(resolve => setTimeout(resolve, 2000))
                })
                .then(result => {
                    return server.accounts().accountId(oldAccount).callWithSignature(master)
                })
                .then(result => {
                    expect(result.signers.length).to.equal(1);
                    expect(result.signers[0].public_key).to.equal(newSigner);
                    done();
                }).catch(err => done(err));
        });
    })

    describe("invoices", function () {
        it("manage invoice and delete", function (done) {
            let account1 = StellarSdk.Keypair.random();
            let account2 = StellarSdk.Keypair.random();
            let invoiceId = '-1';
            createNewAccount(account1.accountId(), 2)
                .then(result => {
                    return createNewAccount(account2.accountId(), 2);
                })
                .then(result => {
                    return manageInvoice(account1, account2.accountId(), account1.balanceId())
                })
                .then(result => {
                    return new Promise(resolve => setTimeout(resolve, 2000))
                })
                .then(result => {
                    return server.operations().forAccount(account1.accountId()).callWithSignature(account1)
                })
                .then(result => {
                    expect(result.records.length).to.equal(2);
                    let invoiceOp = result.records[1];
                    expect(invoiceOp.type).to.equal('manage_invoice');
                    expect(invoiceOp.state).to.equal(1);
                    invoiceId = invoiceOp.identifier;
                })
                .then(result => {
                    return manageInvoice(account1, account2.accountId(), account1.balanceId(), '0', invoiceId)
                })
                .then(result => {
                    return new Promise(resolve => setTimeout(resolve, 5000))
                })
                .then(result => {
                    return server.operations().forAccount(account1.accountId()).callWithSignature(account1)
                })
                .then(result => {
                    expect(result.records.length).to.equal(2);
                    let invoiceOp = result.records[1];
                    expect(invoiceOp.type).to.equal('manage_invoice');
                    expect(invoiceOp.state).to.equal(4);
                })
                .then(result => {
                    done();
                }).catch(err => {
                console.log(err);
                done(err)
            });
        });

        it("manage invoice and reject", function (done) {
            let account1 = StellarSdk.Keypair.random();
            let account2 = StellarSdk.Keypair.random();
            let invoiceOp;
            createNewAccount(account1.accountId(), 2)
                .then(result => {
                    return createNewAccount(account2.accountId(), 2);
                })
                .then(result => {
                    return manageInvoice(account1, account2.accountId(), account1.balanceId())
                })
                .then(result => {
                    return new Promise(resolve => setTimeout(resolve, 2000))
                })
                .then(result => {
                    return server.operations().forAccount(account2.accountId()).callWithSignature(account2)
                })
                .then(result => {
                    expect(result.records.length).to.equal(2);
                    invoiceOp = result.records[1];
                    expect(invoiceOp.type).to.equal('manage_invoice');
                    expect(invoiceOp.state).to.equal(1);
                })
                .then(result => {
                    return reviewInvoice(account2, account1.balanceId(), invoiceOp.amount, invoiceOp.identifier, false)
                })
                .then(paymentOp => {
                    return submitPayment(paymentOp, account2)
                }).then(result => {
                return new Promise(resolve => setTimeout(resolve, 5000))
            })
                .then(result => {
                    return server.operations().forAccount(account1.accountId()).callWithSignature(account1)
                })
                .then(result => {
                    expect(result.records.length).to.equal(2);
                    let invoiceOp = result.records[1];
                    expect(invoiceOp.type).to.equal('manage_invoice');
                    expect(invoiceOp.state).to.equal(3);
                })
                .then(result => {
                    done();
                }).catch(err => {
                console.log(err.response);
                done(err)
            });
        });

    });
})