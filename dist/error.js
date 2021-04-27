"use strict";
//#region Import
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
exports.displayCompileError = exports.defaultIndent = void 0;
const c = require("chalk");
const naturalNumber_1 = require("./naturalNumber");
const styles = __importStar(require("./chalks"));
const { entries } = Object;
//#endregion Import
exports.defaultIndent = 0;
function displayCompileError(error, indent = exports.defaultIndent) {
    (0, naturalNumber_1.assertNaturalNumber)(indent);
    const errMsg = [
        styles.error `Errors during compilation:`,
        ...[
            // `Name: ` + c.bold.underline`"${error.name}"`,
            c.red.bold `Message:\n${c.dim.red(error.message)}`,
            ...error.context ? [c.red.bold `Context:\n${c.dim.red(error.context)}`] : []
        ].map(line => " ".repeat(indent) + line)
    ].join("\n");
    // console.dir(error)
    console.log(errMsg);
    // Test
    let { stack, message, name } = error;
    if (!(stack && message)) {
        console.info(c.dim.red `Missing ${[
            ...error.stack ? [] : ['stack'],
            ...error.message ? [] : ['message'],
        ].join(', ')}`);
        return;
    }
    return;
    let nameIdx = 21;
    let valIdx = 18;
    let printNameAndValue = (o) => {
        let [k, v] = entries(o)[0];
        if (!(k && typeof k === 'string' || !(k.match('error')))) {
            return;
        }
        console.log(c.ansi256(nameIdx)(k));
        console.log(c.ansi256(valIdx)(v));
    };
}
exports.displayCompileError = displayCompileError;
