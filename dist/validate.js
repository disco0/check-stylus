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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
var _sourceCache, _cssCache;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylusSource = exports.IndentedLog = void 0;
const fs = __importStar(require("fs"));
const process = __importStar(require("process"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const stylus_1 = __importDefault(require("stylus"));
const { entries, fromEntries } = Object;
//#region __dirname
//@ts-expect-error
if (!__dirname)
    var __dirname = (_a = global.__dirname) !== null && _a !== void 0 ? _a : path.resolve();
//#endregion __dirname
//#region Read Args
const { argv, execArgv } = process;
const stylusSourcePathRegex = /\.styl$/;
const stylusSourcePaths = argv.filter(arg => stylusSourcePathRegex.test(arg));
const fileCount = stylusSourcePaths.length;
console.log(chalk_1.default.ansi256(17) `Compiling ${fileCount} files:` +
    `\n ${chalk_1.default.ansi256(248) `>`} %s`.repeat(fileCount), ...stylusSourcePaths.map(file => chalk_1.default.bold.ansi256(4).underline `${file}`));
/**
 * Validates parameter `obj` is an integer is equal to or greater than zero
 */
function assertRealNumber(obj) {
    if (!Number.isInteger(obj) && (obj >= 0))
        throw new Error('Value ' + obj.toString() + ' is not zero or positive integer.');
}
class IndentedLog {
    constructor(initialIndent = 0) {
        this.indent = 0;
        assertRealNumber(initialIndent);
    }
}
exports.IndentedLog = IndentedLog;
//#endregion IndentedLog
//#region Stylus Class
class StylusSource {
    constructor(sourcePath) {
        //#region File Source Content
        _sourceCache.set(this, void 0);
        //#endregion File Source Content
        //#region Compilation
        _cssCache.set(this, void 0);
        this.path = sourcePath;
        // Create a new compiler instance that can be continued later
        this.compilerInstance = stylus_1.default(this.source);
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
                console.debug(`Sucessfully loaded and stored content of source file ${this.path}.`);
            }
            catch (err) {
                console.warn(`Error reading source file from path ${chalk_1.default.underline `${this.path}`}.`);
                throw new Error(`Error reading stylus source file ${chalk_1.default.underline `${this.path}`}`);
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
            this.compilerInstance.render((err, css, js) => {
                if (css)
                    result = css;
                if (err)
                    errors = err;
            });
            if (result) {
                console.debug(`Sucessfully compiled and cached result.`);
                __classPrivateFieldSet(this, _cssCache, result);
                return result;
            }
            else {
                console.warn(` No css returned during compilation.`);
                if (errors) {
                    console.warn(`Errors generated during compillation: %o`, errors);
                    return errors;
                }
                return '';
            }
        }
        catch (err) {
            console.warn(`Error during compilation of stylus source ${chalk_1.default.underline `${this.path}`}`);
            return err;
        }
    }
}
exports.StylusSource = StylusSource;
_sourceCache = new WeakMap(), _cssCache = new WeakMap();
//#endregion Stylus Class
const compilations = stylusSourcePaths.map(path => new StylusSource(path));
for (const instance of compilations) {
    console.log(`Compiling ${chalk_1.default.underline(instance.path)}`);
    let compilation = instance.compile();
    if (compilation instanceof Error) {
        let indent = 4;
        const message = [
            `Errors during compilation:`,
            `Name: "${compilation.name}"`,
            `Message: "${compilation.message}"`,
            ...compilation.stack ? [`Stack: ${compilation.stack}`] : []
        ].map(line => " ".repeat(indent) + line).join("\n");
        console.log(chalk_1.default.ansi256(124)(message));
    }
    else {
        console.log(`${chalk_1.default.underline(instance.path.split(/[\\\/]/).slice(-1)[0].replace(/styl$/, 'css')) + ':'}`);
        console.log(compilation);
    }
}
