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
var _a;
var _sourceCache, _cssCache, _lastCompilationResult, _filenameCache;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylusSource = exports.StylusSourceError = void 0;
// Node
const fs = __importStar(require("fs"));
// npm
const c = require("chalk");
const stylus = require("stylus");
const stylusStylus = require("stylus-stylus");
const regex_1 = require("./regex");
const styles = __importStar(require("./chalks"));
const log_1 = require("./log");
const error_1 = require("./error");
const yargs_1 = require("./yargs");
//#endregion Import
//#region Compilation Paths
// TODO: Add directory of each file being watched to paths
const renderPaths = [];
if (yargs_1.options.paths)
    renderPaths.push(...yargs_1.options.paths);
class StylusSourceError {
    constructor(error) {
        const stylusError = error;
        // TypeScript typechecker can't handle Object.assign working smh
        this.source = stylusError;
        this.stack = stylusError.stack;
        this.message = stylusError.message;
        this.lineno = stylusError.lineno;
        this.column = stylusError.column;
        this.filename = stylusError.filename;
        this.stylusStack = stylusError.stylusStack;
        // this.fromStylus  = stylusError.fromStylus
        let context = StylusSourceError.extractRawContextFromStack(this.stack, this.message);
        if (context && this.stack.length > context.length)
            this.context = context.replace(/^[\t ]+/gm, '');
    }
    //#region Util
    static extractRawContextFromStack(stack, message) {
        return stack.replace(RegExp('^Error: +[\\s\\n]*' + regex_1.escapeRegex(message) + '\\n*', 'gm'), '');
    }
}
exports.StylusSourceError = StylusSourceError;
//#endregion Errors
const stylusRendererOptions = {
    paths: renderPaths
};
if (Object.keys(stylusRendererOptions).length > 0)
    log_1.debugLog(styles.debug `Stylus Render Options:\n${JSON.stringify(stylusRendererOptions, null, 4)}`);
//#region Stylus Class
class StylusSource {
    constructor(sourcePath, noEmitCSS = StylusSource.noEmitCSSInitial) {
        this.noEmitCSS = noEmitCSS;
        //#region File Source Content
        _sourceCache.set(this, void 0);
        //#endregion File Source Content
        //#region Compilation
        _cssCache.set(this, void 0);
        _lastCompilationResult.set(this, void 0);
        //#endregion Compilation
        //#region Util
        _filenameCache.set(this, {});
        // Idiot check
        // TODO: Consider throwing error here, as this is kind of important and 
        //       in theory a file watcher should not fuck this up
        if (!(fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile())) {
            const errorString = `StylusSource Constructor: Source path passed in constructor does not exist or is not a file: ${sourcePath}`;
            log_1.debugLog(styles.warn(errorString));
        }
        this.path = sourcePath;
        // Create a new compiler instance that can be continued later
        // this.compilerInstance = newStylusRendererInstance(this.source);
        this.compilerInstance = StylusSource.CreateRenderer(this.source);
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
            log_1.debugLog(`Returning cached compilation.`);
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
            // If --nocss passed, don't print css and heading
            if (this.noEmitCSS) {
                // TODO: Keep something like this, or just output nothing for --nocss?
                console.log(styles.debug(`Compiled: ${c.underline.ansi256(21).dim(this.filename)}`));
                return;
            }
            console.log(`${c.underline(this.filename.replace(/styl$/, 'css')) + ':'}`);
            console.log(result);
        }
    }
    get filename() {
        //#region Cache
        if (__classPrivateFieldGet(this, _filenameCache).path === this.path
            && typeof __classPrivateFieldGet(this, _filenameCache).value === 'string'
            && __classPrivateFieldGet(this, _filenameCache).value.length > 0)
            return __classPrivateFieldGet(this, _filenameCache).value;
        //#endregion Cache
        const value = this.path.split(/[\/]|(?<!([\\]{2})*[\\])[\\]/).slice(-1)[0];
        // Cache value and the path its resolved from
        Object.assign(__classPrivateFieldGet(this, _filenameCache), { value, path: this.path });
        return value;
    }
    //#endregion Util
    //#region Static Methods
    static CreateRenderer(stylusSource = '') {
        // Create
        const instance = stylus(stylusSource, stylusRendererOptions);
        // Load plugins
        instance.use(stylusStylus());
        return instance;
    }
    // TODO: Decide on where to put this, either here just the object
    static get RendererOptions() {
        return stylusRendererOptions;
    }
    static get RendererPaths() {
        return stylusRendererOptions.paths || [];
    }
}
exports.StylusSource = StylusSource;
_sourceCache = new WeakMap(), _cssCache = new WeakMap(), _lastCompilationResult = new WeakMap(), _filenameCache = new WeakMap();
StylusSource.noEmitCSSInitial = (_a = yargs_1.options['nocss']) !== null && _a !== void 0 ? _a : false;
//#endregion Declarations
