"use strict";
//#region Import
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchStylusFile = void 0;
// npm
const chokidar_1 = require("chokidar");
const chalk_1 = __importDefault(require("chalk"));
const log_1 = require("./log");
const yargs_1 = require("./yargs");
const StylusSource_1 = require("./StylusSource");
const util_1 = __importDefault(require("./util"));
const watchers = [];
const watched = [];
const watchConfig = {
    useFsEvents: true,
    followSymlinks: true,
    depth: 1,
    disableGlobbing: true,
    awaitWriteFinish: false,
    ignorePermissionErrors: true,
    persistent: true,
    atomic: true,
    ignored: /^\./,
    alwaysStat: true,
    ignoreInitial: false,
    interval: 150,
    cwd: util_1.default.cwd,
    ...util_1.default.os.isDarwin() ? {} : {
        useFsEvents: false
    }
    // ... options['any-file'] ? { ignored: '!*.styl' } : { },
};
function watchStylusFile(...filePaths) {
    log_1.debugLog(chalk_1.default.ansi256(32) `Watching files:` + filePaths.map((filePath) => `\n - ${filePath}`).join(''));
    const instance = chokidar_1.watch(filePaths, watchConfig)
        .on('add', compileOnChange)
        .on('change', compileOnChange);
    if (!instance)
        throw new Error('Failed to instantiate watcher instance.');
    watchers.push(instance);
    watched.push(...Object.entries(instance.getWatched()).flatMap(([dir, files]) => files.map(file => dir + '/' + file)));
}
exports.watchStylusFile = watchStylusFile;
;
const compileOnChange = (path, stat) => {
    var _a;
    if (stat && !stat.isFile())
        return;
    log_1.debugLog(`Compiling file: ${chalk_1.default.underline.blue(path)}`);
    // TODO: This is probably not that efficient, maybe just make a single instance or one per
    //       file.
    const compiler = new StylusSource_1.StylusSource(path, (_a = yargs_1.options['nocss']) !== null && _a !== void 0 ? _a : false);
    (result => {
        // if(options.nocss)
        //     return
        // else
        compiler.outputResult(result);
    })(compiler.compile());
};
