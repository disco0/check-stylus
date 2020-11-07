"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugLog = void 0;
const constants_1 = require("./constants");
const loggingMethod = console.debug.bind(console);
const debugLogFn = (msg, ...rest) => {
    loggingMethod(msg, ...rest);
};
const disabledDebugLog = ((...args) => { });
exports.debugLog = constants_1.DEBUG ? debugLogFn : disabledDebugLog;
