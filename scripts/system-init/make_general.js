const helpers = require('./../helpers');
const config = require('../config')
const StellarSdk = require('../../lib/index');

let env = 'dev';
let currentConfig = config.getConfig(env);

/*helpers.accounts.createNewAccount(currentConfig, "GDA2SZAWRC64BILEYP4G6KRRHM64FKMRNYKSHDLNQUQ7ZS6DK5377QF2", StellarSdk.xdr.AccountType.general().value, 0)
.then(()=> {console.log("success")}).catch(helpers.errorHandler);*/