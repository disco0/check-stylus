import { DEBUG } from './constants'

const loggingMethod = console.debug.bind(console);

interface DebugLogger
{
    /**
     * Write debug log message to console if debug logging enabled.
     * 
     * @param fmtString
     *  Logging format string
     * @param rest
     *  Objects inserted in `fmtString` parameter
     */
    (fmtString: string, ...rest: any[]): void;
    /**
     * Write debug log message to console if debug logging enabled.
     * 
     * @param message
     *   Message to output to console
     */
    (message: string): void;

    (...msg: any[]): void
}

const debugLogFn: DebugLogger = (msg: string, ...rest: any[]) =>
{
    loggingMethod(msg, ...rest)
}

const disabledDebugLog: DebugLogger = ((...args: any[]) => { /* sike */ }) as DebugLogger

export const debugLog: DebugLogger = DEBUG ? debugLogFn : disabledDebugLog;
