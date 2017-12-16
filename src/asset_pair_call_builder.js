import {CallBuilder} from "./call_builder";

export class AssetPairCallBuilder extends CallBuilder {
  constructor(serverUrl) {
    super(serverUrl);
    this.url.segment('asset_pairs');
  }
}
