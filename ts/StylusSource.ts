//#region Import

// Node
import * as fs from 'fs'

// npm
import c = require('chalk')
import stylus = require('stylus')
type Stylus = typeof stylus;
import stylusStylus = require('stylus-stylus')

import { escapeRegex } from './regex'
import * as styles from './chalks'
import { debugLog } from './log'
import { displayCompileError } from './error'
import { options } from './yargs'

//#endregion Import

//#region Compilation Paths

// TODO: Add directory of each file being watched to paths

const renderPaths = [ ];

if(options.paths) renderPaths.push(...options.paths);

//#endregion Compilation Paths

//#region Errors

export import StylusRenderErrorOptions = Stylus.errors.RenderErrorOptions
export import StylusRenderError = Stylus.errors.RenderError
export import StylusError = Stylus.errors.StylusError

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
    
    constructor(error: Error)
    {
        const stylusError = error as StylusRenderError;

        // TypeScript typechecker can't handle Object.assign working smh
        this.source      = stylusError as StylusRenderError;
        this.stack       = stylusError.stack
        this.message     = stylusError.message
        this.lineno      = stylusError.lineno
        this.column      = stylusError.column
        this.filename    = stylusError.filename
        this.stylusStack = stylusError.stylusStack
        // this.fromStylus  = stylusError.fromStylus

        let context = StylusSourceError.extractRawContextFromStack(this.stack, this.message)

        if(context && this.stack.length > context.length)
            this.context = context.replace(/^[\t ]+/gm, '');
    }

    //#region Util

    private static extractRawContextFromStack(stack: string, message: string): string | false
    {
        return stack.replace(RegExp('^Error: +[\\s\\n]*' + escapeRegex(message) + '\\n*', 'gm'), '');
    }
    
    //#endregion Util
}

//#endregion Errors

const stylusRendererOptions: RenderOptions = 
{
    paths: renderPaths
};

if(Object.keys(stylusRendererOptions).length > 0)
    debugLog(styles.debug`Stylus Render Options:\n${
                                        JSON.stringify(stylusRendererOptions, null, 4)}`)

//#region Stylus Class

export class StylusSource
{
    static readonly noEmitCSSInitial: boolean = options['nocss'] ?? false;

    path:             string;
    compilerInstance: ReturnType<Stylus>;

    constructor(sourcePath: string, public noEmitCSS: boolean = StylusSource.noEmitCSSInitial)
    {
        // Idiot check
        // TODO: Consider throwing error here, as this is kind of important and 
        //       in theory a file watcher should not fuck this up
        if(!(fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile()))
        {
            const errorString = `StylusSource Constructor: Source path passed in constructor does not exist or is not a file: ${sourcePath}`
            debugLog(styles.warn(errorString));
        }
        this.path = sourcePath;

        // Create a new compiler instance that can be continued later
        // this.compilerInstance = newStylusRendererInstance(this.source);
        this.compilerInstance = StylusSource.CreateRenderer(this.source);
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
            debugLog(`Returning cached compilation.`)
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
            // If --nocss passed, don't print css and heading
            if(this.noEmitCSS)
            {
                // TODO: Keep something like this, or just output nothing for --nocss?
                console.log(styles.debug(`Compiled: ${c.underline.ansi256(21).dim(this.filename)}`))
                return
            }
            console.log(`${c.underline(this.filename.replace(/styl$/,'css')) + ':'}`);
            console.log(result);
        }
    }
    
    //#endregion Compilation

    //#region Util

    #filenameCache: Partial<Record<'path' | 'value', string>> = {}

    get filename(): string
    {
        //#region Cache

        if(
            this.#filenameCache.path === this.path 
            && typeof this.#filenameCache.value === 'string'
            && this.#filenameCache.value.length > 0          )
            return this.#filenameCache.value;

        //#endregion Cache
        
        const value = this.path.split(/[\/]|(?<!([\\]{2})*[\\])[\\]/).slice(-1)[0]

        // Cache value and the path its resolved from
        Object.assign(this.#filenameCache, {value, path: this.path});

        return value
    }
    
    //#endregion Util

    //#region Static Methods

    static CreateRenderer(stylusSource: string | undefined = ''): Stylus.Renderer
    {
        // Create
        const instance = stylus(stylusSource, stylusRendererOptions)

        // Load plugins
        instance.use(stylusStylus());

        return instance;
    }

    // TODO: Decide on where to put this, either here just the object
    static get RendererOptions()
    {
        return stylusRendererOptions   
    }

    static get RendererPaths()
    {
        return stylusRendererOptions.paths || [ ];
    }
    
    //#endregion Static Methods
}

//#endregion Stylus Class

//#region Declarations

declare namespace Stylus
{
    export type Renderer = ReturnType<typeof stylus>
    export type RenderOptions = Parameters<typeof stylus>[1]

    export namespace Renderer
    {
        export type RenderCallback = 
            (err: StylusRenderError | null, css: string, js: string) => void;
        export function render(callback: RenderCallback): void
    }

    export namespace errors
    {
        export type RenderError = StylusRenderErrorOptions

        export interface RenderErrorOptions extends Error
        {
            stack: string
            message: string
            // fromStylus: boolean
            lineno: number
            column: number
            filename: string
            stylusStack: string
        }

        export interface StylusError extends Error
        {
            message: string
            filename?: string
            lineno?:  number
            columns?:  number
        }
    }
}

import RenderOptions = Stylus.RenderOptions

//#endregion Declarations