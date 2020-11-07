import { existsSync } from 'fs'

import c from 'chalk'

import { options } from './yargs'
import { debugLog } from './log'
import { StylusSource } from './StylusSource';
import { watchStylusFile } from './watcher'

//#region Parse Options

const stylusSourcePathRegex = /\.styl$/

const stylusSourcePaths = 
    options['any-file'] 
        ? options._.filter(arg => arg.length > 0 && existsSync(arg))
        : options._.filter(arg => stylusSourcePathRegex.test(arg));

{
    const fileCount = stylusSourcePaths.length;

    debugLog(
        c.ansi256(17)`Compiling ${fileCount} files:` +
        `\n ${c.ansi256(248)`>`} %s`.repeat(fileCount),

        ...stylusSourcePaths.map(file => c.bold.ansi256(4).underline`${file}`)
    )
}

//#endregion Parse Options

if(options.watch)
    watchStylusFile(...stylusSourcePaths);
else
{
    const compilations = stylusSourcePaths.map(path => new StylusSource(path));

    for(const instance of compilations)
    {
        console.log(`Compiling ${c.underline(instance.path)}`)

        const result = instance.compile()
        instance.outputResult(result);
    }
}
