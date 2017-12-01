"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var CallBuilder = require("./call_builder").CallBuilder;

var ReviewableRequestCallBuilder = exports.ReviewableRequestCallBuilder = (function (_CallBuilder) {
    /**
     * Creates a new {@link ReviewableRequestCallBuilder} pointed to server defined by serverUrl.
     *
     * Do not create this object directly, use {@link Server#reviewableRequests}.
     * @constructor
     * @extends CallBuilder
     * @param {string} serverUrl Horizon server URL.
     */

    function ReviewableRequestCallBuilder(serverUrl) {
        _classCallCheck(this, ReviewableRequestCallBuilder);

        _get(Object.getPrototypeOf(ReviewableRequestCallBuilder.prototype), "constructor", this).call(this, serverUrl);
        this.url.segment("requests");
    }

    _inherits(ReviewableRequestCallBuilder, _CallBuilder);

    _createClass(ReviewableRequestCallBuilder, {
        reviewableRequest: {

            /**
             * Provides information on a single reviewable request.
             * @param id Reviewable request ID
             * @returns {LedgerCallBuilder}
             */

            value: function reviewableRequest(id) {
                this.filter.push(["requests", id.toString()]);
                return this;
            }
        }
    });

    return ReviewableRequestCallBuilder;
})(CallBuilder);