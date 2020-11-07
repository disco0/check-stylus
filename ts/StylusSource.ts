//#region Import
import * as fs from 'fs'

import stylus = require('stylus')
type Stylus = typeof stylus;
import stylusStylus = require('stylus-stylus')

import c = require('chalk')

import { escapeRegex } from './regex'
import * as styles from './chalks'
import { displayCompileError } from './error'

//#endregion Import

//#region Errors

export interface StylusRenderErrorOptions extends Error
{
    stack: string
    message: string
    // fromStylus: boolean
    lineno: number
    column: number
    filename: string
    stylusStack: string
}

export type StylusRenderError = StylusRenderErrorOptions

export class StylusCallbackParameters
{
    css?:   string
    js?:    string
    error?: Error
}

export interface StylusError extends Error
{
    message: string
    filename?: string
    lineno?:  number
    columns?:  number
}

export class StylusSourceError implements Error
{
    name!: string;
    stack: string
    message: string
    lineno: number
    column: number
    filename: string
    stylusStack: string | '';
    source: StylusRenderError;
    context?: string;

    // fromStylus: boolean
    constructor(error: Error)
    {
        const stylusError = error as StylusRenderError;
        // Why isn't Object.assign working smh
        this.source      = stylusError as StylusRenderError;
        this.stack       = stylusError.stack
        this.message     = stylusError.message
        this.lineno      = stylusError.lineno
        this.column      = stylusError.column
        this.filename    = stylusError.filename
        this.stylusStack = stylusError.stylusStack
        // this.fromStylus  = error.fromStylus
        let context = StylusSourceError.extractRawContextFromStack(this.stack, this.message)
        if(context && this.stack.length > context.length)
        {
            this.context = context.replace(/^[\t ]+/gm, '');
        }

    }

    //#region Util

    private static extractRawContextFromStack(stack: string, message: string): string | false
    {
        return stack.replace(RegExp('^Error: +[\\s\\n]*' + escapeRegex(message) + '\\n*', 'gm'), '');
    }
    
    //#endregion Util
}

//#endregion Errors

//#region Stylus Class

export class StylusSource
{
    path:             string
    compilerInstance: ReturnType<Stylus>

    constructor(sourcePath: string)
    {
        this.path = sourcePath;

        // Create a new compiler instance that can be continued later
        this.compilerInstance = stylus(this.source).use(stylusStylus())
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
                console.debug(styles.debug`Sucessfully loaded and stored content of source file ${this.path}.`);
            }
            catch(err)
            {
                console.warn(styles.error`Error reading source file from path ${c.underline`${this.path}`}.`)
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
            let errors: StylusSourceError | undefined = undefined;

            this.compilerInstance.render((error: Error | null, css: string | undefined, js: string | undefined) => 
            {
                if(null !== error) 
                    errors = new StylusSourceError(error);

                this.#lastCompilationResult = ({error: (error as StylusSourceError), css, js});

                if(css)   result = css;
                if(error) errors = error as StylusSourceError;
            })

            if(result)
            {
                console.debug(styles.debug`Sucessfully compiled and cached result.`)
                this.#cssCache = result;
                return result;
            }
            else 
            { 
                console.warn(styles.warn`No css returned during compilation.`)
                if(errors)
                {
                    console.warn(styles.warn`Errors generated during compilation.`)// %o`, errors)
                    return errors;
                }

                return ''
            }
        }
        catch(err)
        {
            console.warn(styles.invert.warn`Error during compilation of stylus source ${c.underline`${this.path}`}`)
            return err
        }
    }

    #lastCompilationResult?:
    {
        css?:  string;
        js?:   string;
        error: StylusSourceError | null
    };

    outputResult(result: ReturnType<StylusSource['compile']>): void
    {
        if(typeof result !== 'string')
        {
            displayCompileError(result as StylusSourceError);
        }
        else
        {
            console.log(`${c.underline(this.path.split(/[\\\/]/).slice(-1)[0].replace(/styl$/,'css')) + ':'}`);
            console.log(result);
        }
    }
    
    //#endregion Compilation
}

//#endregion Stylus Class

//#region Declarations

declare namespace Stylus.Renderer
{
    export type RenderCallback = (err: StylusRenderError | null, css: string, js: string) => void;
    export function render(callback: RenderCallback): void
}

//#endregion Declarations