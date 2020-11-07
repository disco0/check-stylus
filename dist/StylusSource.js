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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _sourceCache, _cssCache, _lastCompilationResult;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylusSource = exports.StylusSourceError = exports.StylusCallbackParameters = void 0;
//#region Import
const fs = __importStar(require("fs"));
const stylus = require("stylus");
const stylusStylus = require("stylus-stylus");
const c = require("chalk");
const regex_1 = require("./regex");
const styles = __importStar(require("./chalks"));
const error_1 = require("./error");
class StylusCallbackParameters {
}
exports.StylusCallbackParameters = StylusCallbackParameters;
class StylusSourceError {
    // fromStylus: boolean
    constructor(error) {
        const stylusError = error;
        // Why isn't Object.assign working smh
        this.source = stylusError;
        this.stack = stylusError.stack;
        this.message = stylusError.message;
        this.lineno = stylusError.lineno;
        this.column = stylusError.column;
        this.filename = stylusError.filename;
        this.stylusStack = stylusError.stylusStack;
        // this.fromStylus  = error.fromStylus
        let context = StylusSourceError.extractRawContextFromStack(this.stack, this.message);
        if (context && this.stack.length > context.length) {
            this.context = context.replace(/^[\t ]+/gm, '');
        }
    }
    //#region Util
    static extractRawContextFromStack(stack, message) {
        return stack.replace(RegExp('^Error: +[\\s\\n]*' + regex_1.escapeRegex(message) + '\\n*', 'gm'), '');
    }
}
exports.StylusSourceError = StylusSourceError;
//#endregion Errors
//#region Stylus Class
class StylusSource {
    constructor(sourcePath) {
        //#region File Source Content
        _sourceCache.set(this, void 0);
        //#endregion File Source Content
        //#region Compilation
        _cssCache.set(this, void 0);
        _lastCompilationResult.set(this, void 0);
        this.path = sourcePath;
        // Create a new compiler instance that can be continued later
        this.compilerInstance = stylus(this.source).use(stylusStylus());
    }
    loadSource(force) {
        /**
         * This is convoluted cos I couldn't get the type checker to correctly
         * infer that #sourceCache was narrowed to string type
         */
        let source;
        if (typeof __classPrivateFieldGet(this, _sourceCache) === 'undefined' || force === true) {
            try {
                source = fs.readFileSync(this.path, "utf8");
                __classPrivateFieldSet(this, _sourceCache, source);
                console.debug(styles.debug `Sucessfully loaded and stored content of source file ${this.path}.`);
            }
            catch (err) {
                console.warn(styles.error `Error reading source file from path ${c.underline `${this.path}`}.`);
                throw new Error(`Error reading stylus source file ${c.underline `${this.path}`}`);
            }
        }
        else {
            source = __classPrivateFieldGet(this, _sourceCache);
        }
        return source;
    }
    get source() { return this.loadSource(); }
    compile(force) {
        if (typeof __classPrivateFieldGet(this, _cssCache) === 'string' && __classPrivateFieldGet(this, _cssCache).length > 0 && !force)
            return __classPrivateFieldGet(this, _cssCache);
        try {
            let result = undefined;
            let errors = undefined;
            this.compilerInstance.render((error, css, js) => {
                if (null !== error)
                    errors = new StylusSourceError(error);
                __classPrivateFieldSet(this, _lastCompilationResult, ({ error: error, css, js }));
                if (css)
                    result = css;
                if (error)
                    errors = error;
            });
            if (result) {
                console.debug(styles.debug `Sucessfully compiled and cached result.`);
                __classPrivateFieldSet(this, _cssCache, result);
                return result;
            }
            else {
                console.warn(styles.warn `No css returned during compilation.`);
                if (errors) {
                    console.warn(styles.warn `Errors generated during compilation.`); // %o`, errors)
                    return errors;
                }
                return '';
            }
        }
        catch (err) {
            console.warn(styles.invert.warn `Error during compilation of stylus source ${c.underline `${this.path}`}`);
            return err;
        }
    }
    outputResult(result) {
        if (typeof result !== 'string') {
            error_1.displayCompileError(result);
        }
        else {
            console.log(`${c.underline(this.path.split(/[\\\/]/).slice(-1)[0].replace(/styl$/, 'css')) + ':'}`);
            console.log(result);
        }
    }
}
exports.StylusSource = StylusSource;
_sourceCache = new WeakMap(), _cssCache = new WeakMap(), _lastCompilationResult = new WeakMap();
//#endregion Declarations
