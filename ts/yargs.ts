import yargs = require('yargs');
import { cwd } from './util'

//#region Parse args

export const options = yargs
    .option('any-file', {
        alias: [ 'a', 'any'],
        type: "boolean",
        describe: "Don't check file extensions when reading files from arguments.",
        conflicts: [ 'stdin' ]
    })
    .option('clip', {
        alias: [ 'c' ],
        type: "boolean",
        describe: "Read source from clipboard (TODO: Not implemented - Need to support WSL passthrough)",
        conflicts: [ 'any-file' ]
    })
    .option('paths', {
        alias: [ 'p' ],
        array: true,
        string: true,
        describe: "Add additional stylus compilation paths",
        normalize: true
    })
    .option('watch', {
        alias: [ 'w' ],
        type: "boolean",
        describe: "Watch input file",
        conflicts: [ 'stdin', 'clip' ]
    })
    .option('nocss', {
        // -p as in "Only output from `p(msg)` calls"
        alias: [ 'no-css', 'nc' ],
        type: "boolean",
        describe: "Don't write compiled css to stdout",
        conflicts: [ ]
    })
    .option('clear',{
        alias: [ 'clear-on-reload' ],
        type: "boolean",
        describe: "Clear terminal before displaying any output css from compilation when watching files",
        implies: ['watch'],
        default: false
    })
    .option('debug', {
        alias: [ 'v', 'verbose' ],
        type: "boolean",
        describe: "Enable verbose logging"
    })
    .option('stdin', {
        alias: [ '-' ],
        type: "boolean",
        describe: "Read file from stdin (TODO: Not implemented.)",
        conflicts: [ 'any-file' ]
    })
    .option('arg-info',{
        alias: ['?'],
        type: "boolean",
        describe: "Print parsed object from command line arguments (except this argument)."
    })
    .normalize(cwd)
    // Adding with defaults for now
    .parserConfiguration({
        "greedy-arrays": true
    })
    .argv;

if(options['arg-info'])
{
    // For stderr
    console.error(`Yargs Parse:\n${JSON.stringify(options, null, 4)}`)
    process.exit(0)
}

//#endregion Parse args

export default yargs;
