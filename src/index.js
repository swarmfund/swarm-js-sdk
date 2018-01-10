require('es6-promise').polyfill();

// stellar-sdk classes to expose
export * from "./enums";
export * from "./errors";
export {Config} from "./config";
export {Server} from "./server";

// expose classes and functions from 'swarm-js-base'
export * from "swarm-js-base";

export default module.exports;
