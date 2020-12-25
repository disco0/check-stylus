import * as fs from 'fs'
import * as process from 'process'
import * as path from 'path'

import c from 'chalk'
import stylus from 'stylus'
type Stylus = typeof stylus;

const { entries, fromEntries } = Object;

//#region __dirname

//@ts-expect-error
if(!__dirname)
    var __dirname = global.__dirname ?? path.resolve();

//#endregion __dirname

//#region Read Args

const { argv, execArgv } = process;

const stylusSourcePathRegex = /\.styl$/
const stylusSourcePaths = argv.filter(arg => stylusSourcePathRegex.test(arg));
const fileCount = stylusSourcePaths.length;

console.log(
    c.ansi256(17)`Compiling ${fileCount} files:` +
    `\n ${c.ansi256(248)`>`} %s`.repeat(fileCount),

    ...stylusSourcePaths.map(file => c.bold.ansi256(4).underline`${file}`)
)

//#endregion Read Args

//#region    IndentedLog

type RealNumber = Number & {}
/**
 * Validates parameter `obj` is an integer is equal to or greater than zero
 */
function assertRealNumber(obj: any): asserts obj
{
    if(!Number.isInteger(obj) && (obj >= 0))
        throw new Error('Value ' + obj.toString() + ' is not zero or positive integer.')
}

export class IndentedLog
{
    indent: number = 0;
    constructor(initialIndent: number = 0)
    {
        assertRealNumber(initialIndent);
    }
}

//#endregion IndentedLog

//#region Stylus Class

export class StylusSource
{
    path:             string
    compilerInstance: ReturnType<Stylus>

    constructor(sourcePath: string)
    {
        this.path = sourcePath;

        // Create a new compiler instance that can be continued later
        this.compilerInstance = stylus(this.source);
    }

    //#region File Source Content

    #sourceCache: string | undefined;
    loadSource(force?: boolean): string
    {
        /**
         * This is convoluted cos I couldn't get the type checker to correctly
         * infer that #sourceCache was narrowed to string type
         */

        let source: string;

        if(typeof this.#sourceCache === 'undefined' || force === true)
        {
            try
            {
                source = fs.readFileSync(this.path, "utf8");
                this.#sourceCache = source;
                console.debug(`Sucessfully loaded and stored content of source file ${this.path}.`);
            }
            catch(err)
            {
                console.warn(`Error reading source file from path ${c.underline`${this.path}`}.`)
                throw new Error(`Error reading stylus source file ${c.underline`${this.path}`}`)
            }
        }
        else
        {
            source = this.#sourceCache;
        }

        return source;
    }
    get source(): string { return this.loadSource(); }
    
    //#endregion File Source Content

    //#region Compilation

    #cssCache?: string;
    compile(force?: boolean): string | Error
    {
        if(typeof this.#cssCache === 'string' && this.#cssCache.length > 0 && !force)
            return this.#cssCache;

        try
        {
            let result: string | undefined = undefined;
            let errors: Error  | undefined = undefined;

            this.compilerInstance.render((err, css, js) => {
                if(css) result = css;
                if(err) errors = err;
            })

            if(result)
            {
                console.debug(`Sucessfully compiled and cached result.`)
                this.#cssCache = result;
                return result;
            }
            else 
            {
                console.warn(` No css returned during compilation.`)
                if(errors)
                {
                    console.warn(`Errors generated during compillation: %o`, errors)
                    return errors;
                }

                return ''
            }
        }
        catch(err)
        {
            console.warn(`Error during compilation of stylus source ${c.underline`${this.path}`}`)
            return err
        }
    }

    
    //#endregion Compilation
}

//#endregion Stylus Class

const compilations = stylusSourcePaths.map(path => new StylusSource(path))

for(const instance of compilations)
{
    console.log(`Compiling ${c.underline(instance.path)}`)
    let compilation = instance.compile()

    if(compilation instanceof Error)
    {
        let indent: number = 4;
        const message = [
          `Errors during compilation:`,
          `Name: "${compilation.name}"`,
          `Message: "${compilation.message}"`,
          ...compilation.stack ? [`Stack: ${compilation.stack}`] : []
        ].map(line => " ".repeat(indent) + line).join("\n")

        console.log(c.ansi256(124)(message))
    }
    else
    {
        console.log(`${c.underline(instance.path.split(/[\\\/]/).slice(-1)[0].replace(/styl$/,'css')) + ':'}`)
        console.log(compilation)
    }
}