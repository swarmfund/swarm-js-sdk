import {NotFoundError, NetworkError, BadRequestError} from "./errors";
import forEach from 'lodash/forEach';
import { xdr, Account, hash } from "swarm-js-base";
import { Config } from "./config";

let URI = require("urijs");
let URITemplate = require("urijs").URITemplate;

let axios = require("axios");
var EventSource = require( "./EventSource.js" );
let toBluebird = require("bluebird").resolve;

var SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;
var SIGNATURE_VALID_SEC = 60;
/**
 * Creates a new {@link CallBuilder} pointed to server defined by serverUrl.
 *
 * This is an **abstract** class. Do not create this object directly, use {@link Server} class.
 * @param {string} serverUrl
 * @class CallBuilder
 */
export class CallBuilder {
  constructor(serverUrl) {
    this.url = serverUrl;
    this.filter = [];
  }

  /**
   * @private
   */
  checkFilter() {
    if (this.filter.length >= 2) {
      throw new BadRequestError("Too many filters specified", this.filter);
    }
    if (this.filter.length === 1) {
      this.url.segment(this.filter[0]);
    }
  }

  /**
   * @private
   */
  checkPrefix() {
    if (Config.isURLPrefix === true) {
      this.url.segment(Config.getURLPrefix().concat(this.filter[0]));
    }
  }

  /**
   * Triggers a HTTP request using this builder's current configuration.
   * Returns a Promise that resolves to the server's response.
   * @returns {Promise}
   */
  call() {
    this.checkFilter();
    return this._sendNormalRequest(this.url)
      .then(r => this._parseResponse(r));
  }
  /**
   * Should be used when forming GET requests subjected to Signature
   */
  callWithSignature(keypair) {
    this.checkFilter();
    var config = this._getRequestConfig(this.url, keypair);
    return this._sendNormalRequest(this.url, config)
      .then(r => this._parseResponse(r));
}
  /**
   * Creates an EventSource that listens for incoming messages from the server. To stop listening for new
   * events call the function returned by this method.
   * @see [Horizon Response Format](https://www.stellar.org/developers/horizon/learn/responses.html)
   * @see [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
   * @param {object} [options] EventSource options.
   * @param {function} [options.onmessage] Callback function to handle incoming messages.
   * @param {function} [options.onerror] Callback function to handle errors.
   * @returns {function} Close function. Run to close the connection and stop listening for new events.
   */
  stream(options, keypair) {
    this.checkFilter();

    // EventSource object
    let es;
    // timeout is the id of the timeout to be triggered if there were no new messages
    // in the last 15 seconds. The timeout is reset when a new message arrive.
    // It prevents closing EventSource object in case of 504 errors as `readyState`
    // property is not reliable.
    let timeout;

    var createTimeout = () => {
      timeout = setTimeout(() => {
        es.close();
        es = createEventSource();
      }, 45*1000);
    };

    var createEventSource = () => {
      try {
        var config = this._getRequestConfig(URI(this.url), keypair);
        this.checkPrefix();
        es = new EventSource(this.url.toString(), config);
      } catch (err) {
        if (options.onerror) {
          options.onerror(err);
          options.onerror('EventSource not supported');
        }
        return false;
      }

      createTimeout();

      es.onmessage = message => {
        var result = message.data ? this._parseRecord(JSON.parse(message.data)) : message;
        if (result.paging_token) {
          this.url.setQuery("cursor", result.paging_token);
        }
        clearTimeout(timeout);
        createTimeout();
        options.onmessage(result);
      };

      es.onerror = error => {
        if (options.onerror) {
          options.onerror(error);
        }
      };

      return es;
    };

    createEventSource();
    return function close() {
      clearTimeout(timeout);
      es.close();
    };
  }
  /**
   * @private
   */
   _getRequestConfig(url, keypair) {
    if (!keypair) {
      throw new Error("Need keypair");
    }
    let validUntil = Math.floor((new Date().getTime() / 1000) + SIGNATURE_VALID_SEC).toString();
    let signatureBase = "{ uri: '" + url.resource() + "', valid_untill: '" + validUntil.toString() + "'}";
    let data = hash(signatureBase);
    let signature = keypair.signDecorated(data);
    return {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        'X-AuthValidUnTillTimestamp': validUntil.toString(),
        'X-AuthPublicKey': keypair.accountId(),
        'X-AuthSignature': signature.toXDR("base64")
      },
      timeout: SUBMIT_TRANSACTION_TIMEOUT
    };
   }
  /**
   * @private
   */
  _requestFnForLink(link) {
    return opts => {
      let uri;

      if (link.template) {
        let template = URITemplate(link.href);
        uri = URI(template.expand(opts));
      } else {
        uri = URI(link.href);
      }

      return this._sendNormalRequest(uri).then(r => this._parseRecord(r));
    };
  }

  /**
   * Convert each link into a function on the response object.
   * @private
   */
  _parseRecord(json) {
    if (!json._links) {
      return json;
    }
    forEach(json._links, (n, key) => {json[key] = this._requestFnForLink(n);});
    return json;
  }

  _sendNormalRequest(url, config) {
    if (url.authority() === '') {
      url = url.authority(this.url.authority());
    }

    if (url.protocol() === '') {
      url = url.protocol(this.url.protocol());
    }

    if (Config.isURLPrefix() === true) {
      url.segment(Config.getURLPrefixedPath(url.path()));
    }

    // Temp fix for: https://github.com/stellar/js-stellar-sdk/issues/15
    var promise = axios.get(url.toString(), config).then(function (response) {
      return response.data;
    })["catch"](this._handleNetworkError);
          return toBluebird(promise);
  }

  /**
   * @private
   */
  _parseResponse(json) {
    if (json._embedded && json._embedded.records) {
      return this._toCollectionPage(json);
    } else {
      return this._parseRecord(json);
    }
  }

  /**
   * @private
   */
  _toCollectionPage(json) {
    for (var i = 0; i < json._embedded.records.length; i++) {
      json._embedded.records[i] = this._parseRecord(json._embedded.records[i]);
    }
    return {
      records: json._embedded.records,
      next: (keypair) => {
        if (keypair) {
          var config = this._getRequestConfig(URI(json._links.next.href), keypair);
          return this._sendNormalRequest(URI(json._links.next.href), config)
            .then(r => this._toCollectionPage(r));
        } else {
          return this._sendNormalRequest(URI(json._links.next.href))
            .then(r => this._toCollectionPage(r));
        }
      },
      prev: (keypair) => {
        if (keypair) {
          var config = this._getRequestConfig(URI(json._links.next.href), keypair);
          return this._sendNormalRequest(URI(json._links.prev.href), config)
            .then(r => this._toCollectionPage(r));
        } else {
          return this._sendNormalRequest(URI(json._links.prev.href))
            .then(r => this._toCollectionPage(r));
        }
      }
    };
  }

  /**
   * @private
   */
  _handleNetworkError(response) {
    if (response instanceof Error) {
      return Promise.reject(response);
    } else {
      switch (response.status) {
        case 404:
          return Promise.reject(new NotFoundError(response.data, response));
        default:
          return Promise.reject(new NetworkError(response.status, response));
      }
    }
  }

  /**
   * Adds `cursor` parameter to the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/learn/paging.html)
   * @param {string} cursor A cursor is a value that points to a specific location in a collection of resources.
   */
  cursor(cursor) {
    this.url.addQuery("cursor", cursor);
    return this;
  }

  /**
   * Adds `limit` parameter to the current call. Returns the CallBuilder object on which this method has been called.
   * @see [Paging](https://www.stellar.org/developers/horizon/learn/paging.html)
   * @param {number} number Number of records the server should return.
   */
  limit(number) {
    this.url.addQuery("limit", number);
    return this;
  }

  /**
   * Adds `order` parameter to the current call. Returns the CallBuilder object on which this method has been called.
   * @param {"asc"|"desc"} direction
   */
  order(direction) {
    this.url.addQuery("order", direction);
    return this;
  }
}
