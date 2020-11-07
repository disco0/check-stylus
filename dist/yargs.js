"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = void 0;
const yargs = __importStar(require("yargs"));
//#region Parse args
exports.options = yargs
    .option('any-file', {
    alias: ['a', 'any'],
    type: "boolean",
    describe: "Don't check file extensions when reading files from arguments.",
    conflicts: ['stdin']
})
    .option('stdin', {
    alias: ['-'],
    type: "boolean",
    describe: "Read file from stdin (TODO: Not implemented.)",
    conflicts: ['any-file']
})
    .option('clip', {
    alias: ['c'],
    type: "boolean",
    describe: "Read source from clipboard (TODO: Not implemented - Need to support WSL passthrough)",
    conflicts: ['any-file']
})
    .option('watch', {
    alias: ['w'],
    type: "boolean",
    describe: "Watch input file",
    conflicts: ['stdin', 'clip']
})
    .option('debug', {
    alias: ['v', 'verbose'],
    type: "boolean",
    describe: "Enable verbose logging"
})
    .argv;
//#endregion Parse args
exports.default = yargs;
