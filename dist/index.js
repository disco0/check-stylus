"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const yargs_1 = require("./yargs");
const log_1 = require("./log");
const StylusSource_1 = require("./StylusSource");
const watcher_1 = require("./watcher");
//#region Parse Options
const stylusSourcePathRegex = /\.styl$/;
const stylusSourcePaths = yargs_1.options['any-file']
    ? yargs_1.options._.filter(arg => arg.length > 0 && fs_1.existsSync(arg))
    : yargs_1.options._.filter(arg => stylusSourcePathRegex.test(arg));
{
    const fileCount = stylusSourcePaths.length;
    log_1.debugLog(chalk_1.default.ansi256(17) `Compiling ${fileCount} files:` +
        `\n ${chalk_1.default.ansi256(248) `>`} %s`.repeat(fileCount), ...stylusSourcePaths.map(file => chalk_1.default.bold.ansi256(4).underline `${file}`));
}
//#endregion Parse Options
if (yargs_1.options.watch)
    watcher_1.watchStylusFile(...stylusSourcePaths);
else {
    const compilations = stylusSourcePaths.map(path => new StylusSource_1.StylusSource(path));
    for (const instance of compilations) {
        console.log(`Compiling ${chalk_1.default.underline(instance.path)}`);
        const result = instance.compile();
        instance.outputResult(result);
    }
}
