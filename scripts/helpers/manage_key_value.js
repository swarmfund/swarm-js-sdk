const StellarSdk = require('../../lib/index');

function manageKeyValue(testHelper, key, action, KVType, source, value) {

    const opts = {
        key             : key,
        action          : action,
        kvType          : KVType,
    };

    if (action === 1) {
        opts.value = value;
    }

    const operation = StellarSdk.ManageKeyValueOpBuilder.createManageKeyValueOp(opts);
    return testHelper.server.submitOperationGroup([operation], testHelper.master.accountId(), testHelper.master);
}

function createKYCRuleKey(accountType,kyclvl,typeToSet,kycLvlToSet)
{
    return "kyc_lvlup_rule:"+accountType+":"+kyclvl+":"+typeToSet+":"+kycLvlToSet;
}

module.exports = {
    manageKeyValue,
    createKYCRuleKey
}