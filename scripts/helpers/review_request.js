const isUndefined = require('lodash/isUndefined');
const StellarSdk = require('../../lib/index');


function loadRequestWithRetry (testHelper, requestID, reviewerKP) {
    return testHelper.server.reviewableRequests().reviewableRequest(requestID).callWithSignature(reviewerKP).catch(err => {
        if (!isUndefined(err.response) && err.response.status === 404) {
            console.log("received 404 for reviewable request - retrying");
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() => loadRequestWithRetry(testHelper, requestID, reviewerKP));
        }
        throw err;
    });
}

function reviewRequest(testHelper, requestID, reviewerKP, action, rejectReason) {
    return loadRequestWithRetry(testHelper, requestID, reviewerKP).then(request => {
        let opts = {
            requestID: requestID,
            requestHash: request.hash,
            requestType: request.details.request_type_i,
            action: action,
            reason: rejectReason,
        };
        let operation = StellarSdk.ReviewRequestBuilder.reviewRequest(opts);
        return testHelper.server.submitOperation(operation, reviewerKP.accountId(), reviewerKP);
    }).catch(err => {
        if (!isUndefined(err.response) && err.response.status === 404) {
            console.log("received 404 - retrying");
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() => reviewRequest(testHelper, requestID, reviewerKP, action, rejectReason));
        }
        throw err;
    });
}

function reviewWithdrawRequest(testHelper, requestID, reviewerKP, action, rejectReason, externalDetails) {
    return loadRequestWithRetry(testHelper, requestID, reviewerKP).then(request => {
        let opts = {
            requestID: requestID,
            requestHash: request.hash,
            requestType: request.details.request_type_i,
            action: action,
            reason: rejectReason,
            externalDetails: externalDetails,
        };
        let operation = StellarSdk.ReviewRequestBuilder.reviewWithdrawRequest(opts);
        return testHelper.server.submitOperation(operation, reviewerKP.accountId(), reviewerKP);
    }).catch(err => {
        if (!isUndefined(err.response) && err.response.status === 404) {
            console.log("received 404 - retrying");
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() => reviewRequest(testHelper, requestID, reviewerKP, action, rejectReason));
        }
        throw err;
    });
}

module.exports = {
    loadRequestWithRetry,
    reviewRequest,
    reviewWithdrawRequest
}
