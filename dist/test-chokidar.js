"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = require("process");
const path_1 = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
const chalk_1 = __importDefault(require("chalk"));
const chokidar_1 = require("chokidar");
const watchOptions = {
    ignored: /^\./,
    persistent: true
};
const onChange = (path, stat) => console.log(`[change] ${chalk_1.default.underline.blue(path)}`);
let testDir = path_1.resolve(((_b = (_a = process_1.env.HOME) !== null && _a !== void 0 ? _a : process_1.env.HOMEPATH) !== null && _b !== void 0 ? _b : os_1.homedir()), '.tmp');
let testFiles = [path_1.resolve(testDir, 'tmp.styl')];
testFiles.forEach(filePath => {
    if (!fs_1.existsSync(filePath))
        throw new Error('File does not exist:' + filePath);
});
console.log(`Input:${testFiles.map(file => `\n ->> ${chalk_1.default.ansi256(32)(file)}`)}`);
const watcher = chokidar_1.watch(testFiles, watchOptions)
    .on('add', onChange)
    .on('change', onChange);
const watched = Object.entries(watcher.getWatched()).flatMap(([dir, files]) => files.map(file => dir + '/' + file));
console.log(`Watching:${watched.map(file => `\n ->> ${chalk_1.default.ansi256(32)(file)}`)}`);
// watcher.close();
