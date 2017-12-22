import {CallBuilder} from "./call_builder";

export class SalesCallBuilder extends CallBuilder {
  /**
   * Creates a new {@link SalesCallBuilder} pointed to server defined by serverUrl.
   *
   * Do not create this object directly, use {@link Server#sales}.
   * @constructor
   * @extends CallBuilder
   * @param {string} serverUrl Horizon server URL.
   */
  constructor(serverUrl) {
    super(serverUrl);
    this.url.segment('sales');
  }

  /**
   * Provides information on a single sale.
   * @param {string} id Sale ID
   * @returns {SalesCallBuilder}
   */

  sale(id) {
    this.filter.push(['sales', id.toString()]);
    return this;
  }

  /**
   * Filters sales by asset
   * @param {string} asset For example: `USD`
   * @returns {SalesCallBuilder}
   */
  forAsset(asset) {
    this.url.addQuery('asset', asset);
    return this;
  }

  /**
   * Filters sales by owner
   * @param {string} owner For example: `GDRYPVZ63SR7V2G46GKRGABJD3XPDNWQ4B4PQPJBTTDUEAKH5ZECPTSN`
   * @returns {SalesCallBuilder}
   */

  forOwner(owner) {
    this.url.addQuery('owner', owner);
    return this;
  }

  /**
   * Filters sales by open state
   * @param {boolean} openOnly
   * @return {SalesCallBuilder}
   */
  openOnly(openOnly = true) {
    this.url.addQuery('open_only', openOnly);
    return this;
  }
}
