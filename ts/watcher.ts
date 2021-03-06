//#region Import

// Node
import type * as fs from 'fs'

// npm
import { watch } from 'chokidar'
import type * as Chokidar from 'chokidar'
import c from 'chalk'

import { debugLog } from './log'
import { options } from './yargs'
import { StylusSource } from './StylusSource';
import utils from './util';

//#endregion Import

type OnChange = <T extends Chokidar.FSWatcher>(this: T | unknown, path: string, stats?: fs.Stats) => void;

const watchers: Chokidar.FSWatcher[] = [];
const watched: string[] = [];
const watchConfig: Chokidar.WatchOptions = 
{
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
    cwd: utils.cwd,
    
    ...utils.os.isDarwin() ? { } : {
        useFsEvents: false
    }
    
    // ... options['any-file'] ? { ignored: '!*.styl' } : { },
}

export function watchStylusFile(...filePaths: string[])
{
    debugLog(c.ansi256(32)`Watching files:` + filePaths.map((filePath: string) => `\n - ${filePath}` ).join(''));

    const instance = watch(filePaths, watchConfig)
                            .on('add', compileOnChange)
                            .on('change', compileOnChange);

    if(!instance)
        throw new Error('Failed to instantiate watcher instance.')

    watchers.push(instance);
    watched.push(...Object.entries(instance.getWatched()).flatMap(([dir, files]) => 
        files.map(file => dir + '/' + file)
    ));
};

const compileOnChange: OnChange = (path, stat) =>
{
    if(stat && !stat.isFile()) 
        return;

    debugLog(`Compiling file: ${c.underline.blue(path)}`)

    // TODO: This is probably not that efficient, maybe just make a single instance or one per
    //       file.
    const compiler = new StylusSource(path, options['nocss'] ?? false);

    (result => {
        // if(options.nocss)
        //     return
        // else
            compiler.outputResult(result)
    })(compiler.compile())
};
