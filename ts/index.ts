import { existsSync } from 'fs'

import c from 'chalk'

import { options } from './yargs'
import { debugLog } from './log'
import { StylusSource } from './StylusSource';
import { watchStylusFile } from './watcher'

//#region Parse Options

function stringWithChars(obj: unknown): obj is string
{
    return typeof obj === 'string' && obj.length > 0
}

const stylusSourcePathRegex = /\.styl$/

const stylusSourcePaths = 
    options['any-file'] 
        ? options._.filter(stringWithChars).filter(arg => existsSync(arg))
        : options._.filter(stringWithChars).filter(arg => stylusSourcePathRegex.test(arg));

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
