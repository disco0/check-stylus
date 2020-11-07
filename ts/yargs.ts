import * as yargs from 'yargs';

//#region Parse args

export const options = yargs
    .option('any-file', {
        alias: [ 'a', 'any'],
        type: "boolean",
        describe: "Don't check file extensions when reading files from arguments.",
        conflicts: [ 'stdin' ]
    })
    .option('stdin', {
        alias: [ '-' ],
        type: "boolean",
        describe: "Read file from stdin (TODO: Not implemented.)",
        conflicts: [ 'any-file' ]
    })
    .option('clip', {
        alias: [ 'c' ],
        type: "boolean",
        describe: "Read source from clipboard (TODO: Not implemented - Need to support WSL passthrough)",
        conflicts: [ 'any-file' ]
    })
    .option('watch', {
        alias: [ 'w' ],
        type: "boolean",
        describe: "Watch input file",
        conflicts: [ 'stdin', 'clip' ]
    })
    .option('debug', {
        alias: [ 'v', 'verbose' ],
        type: "boolean",
        describe: "Enable verbose logging"
    })
    .argv;

//#endregion Parse args

export default yargs;
