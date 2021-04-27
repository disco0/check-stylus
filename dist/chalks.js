"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Styles_chalk;
Object.defineProperty(exports, "__esModule", { value: true });
exports.invert = exports.error = exports.warn = exports.debug = void 0;
const helpful_decorators_1 = require("helpful-decorators");
const chalk_1 = __importDefault(require("chalk"));
class Styles {
    constructor() {
        _Styles_chalk.set(this, Styles.c);
    }
    bindInner(styles) {
        return Object.fromEntries(Object.entries(styles)
            .map(([prop, fn]) => {
            return [prop, fn.bind(Styles.c)];
        }));
    }
    debug(...msg) {
        return __classPrivateFieldGet(this, _Styles_chalk, "f").ansi256(250)(...msg);
    }
    warn(...msg) {
        return __classPrivateFieldGet(this, _Styles_chalk, "f").ansi256(208)(...msg, '\n');
    }
    error(...msg) {
        return __classPrivateFieldGet(this, _Styles_chalk, "f").ansi256(208)(...msg);
    }
    path(...msg) {
        return __classPrivateFieldGet(this, _Styles_chalk, "f").ansi256(21).underline(...msg);
    }
}
_Styles_chalk = new WeakMap();
Styles.c = chalk_1.default;
__decorate([
    helpful_decorators_1.bind
], Styles.prototype, "debug", null);
__decorate([
    helpful_decorators_1.bind
], Styles.prototype, "warn", null);
__decorate([
    helpful_decorators_1.bind
], Styles.prototype, "error", null);
__decorate([
    helpful_decorators_1.bind
], Styles.prototype, "path", null);
function debug(...msg) {
    return chalk_1.default.ansi256(250)(...msg);
}
exports.debug = debug;
function warn(...msg) {
    return chalk_1.default.ansi256(208)(...msg, '\n');
}
exports.warn = warn;
function error(...msg) {
    return chalk_1.default.ansi256(208)(...msg);
}
exports.error = error;
exports.invert = {
    debug(...msg) {
        return chalk_1.default.inverse.ansi256(250)(...msg);
    },
    warn(...msg) {
        return chalk_1.default.inverse.ansi256(208)(...msg);
    },
    error(...msg) {
        return chalk_1.default.inverse.ansi256(208)(...msg);
    }
};
