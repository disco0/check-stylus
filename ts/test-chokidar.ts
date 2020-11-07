import { env } from 'process'
import { resolve } from 'path'
import { existsSync } from 'fs';
import { homedir } from 'os';

import c from 'chalk';
import { watch } from 'chokidar'

const watchOptions: import('chokidar').WatchOptions =
{
    ignored: /^\./, 
    persistent: true
}
const onChange = (path: string, stat: import('fs').Stats) =>
    console.log(`[change] ${c.underline.blue(path)}`);

let testDir = resolve((env.HOME ?? env.HOMEPATH ?? homedir()), '.tmp');
let testFiles = [ resolve(testDir, 'tmp.styl') ] as const;
testFiles.forEach(filePath => {
    if(!existsSync(filePath)) 
        throw new Error('File does not exist:' + filePath);
})
console.log(`Input:${testFiles.map(file => `\n ->> ${c.ansi256(32)(file)}`)}`)

const watcher = watch(testFiles, watchOptions)
                    .on('add', onChange)
                    .on('change', onChange);

const watched = Object.entries(watcher.getWatched()).flatMap(([dir, files]) => 
    files.map(file => dir + '/' + file)
); 
console.log(`Watching:${watched.map(file => `\n ->> ${c.ansi256(32)(file)}`)}`)

// watcher.close();
