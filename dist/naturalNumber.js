"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNaturalNumber = exports.assertNaturalNumber = exports.isInt = void 0;
function isInt(obj) {
    return Number.isInteger(obj);
}
exports.isInt = isInt;
function unnaturalThrow(obj) {
    ((obj) => {
        throw new Error(`Value ${obj} is not zero or positive integer (ℕ₀).`);
    })(typeof obj === 'undefined' ?
        '[undefined]' :
        'toString' in obj && typeof obj['toString'] === 'function'
            ? obj.toString() :
            obj);
}
/**
 * Validates parameter `obj` is an integer is equal to or greater than zero
 */
function assertNaturalNumber(obj) {
    if (isInt(obj) && (obj >= 0))
        return;
    unnaturalThrow(obj);
}
exports.assertNaturalNumber = assertNaturalNumber;
/**
 * Validates parameter `obj` is an integer is equal to or greater than zero
 */
function checkNaturalNumber(obj) {
    if (isInt(obj) && (obj >= 0))
        return obj;
    else
        unnaturalThrow(obj);
}
exports.checkNaturalNumber = checkNaturalNumber;
