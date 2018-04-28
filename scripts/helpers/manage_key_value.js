const StellarSdk = require('../lib/index');

function manageKeyValue(testHelper, key, action, KVType, source, value) {

    const opts = {
        key             : key,
        keyValueAction  : action,
        kvType          : KVType,
    };

    if (action === xdr.toInt(StellarSdk.ManageKvAction.put)) {
        opts.value = value;
    }

    const operation = StellarSdk.ManageKeyValueOpBuilder.manageKeyValueOp(opts);
    return testHelper.server.submitOperationGroup([operation], testHelper.master.accountId(), testHelper.master);
}