const StellarSdk = require('../lib/index');

function manageKeyValue(testHelper,key, action, value, source) {

    const opts = {
        key: key,
        action: action,
        value: xdr.void(),
        source: source
    };

    if (action === xdr.toInt(StellarSdk.ManageKvAction.put)) {
        opts.value = value;
    }

    const operation = StellarSdk.ManageKeyValueOpBuilder.manageKeyValueOp(opts);
    return testHelper.server.submitOperationGroup([operation], testHelper.master.accountId(), testHelper.master);
}