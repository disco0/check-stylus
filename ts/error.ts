//#region Import

import c = require('chalk')

import { assertNaturalNumber } from './naturalNumber'
import { StylusSourceError } from './StylusSource';
import * as styles from './chalks';

const { entries } = Object;

//#endregion Import

export let defaultIndent = 0;

export function displayCompileError(error: StylusSourceError, indent: number = defaultIndent): void
{
    assertNaturalNumber(indent);
    
    const errMsg = [
        styles.error`Errors during compilation:`,
        ...[
            // `Name: ` + c.bold.underline`"${error.name}"`,
            c.red.bold`Message:\n${c.dim.red(error.message)}`,
            ...error.context ? [ c.red.bold`Context:\n${c.dim.red(error.context)}` ] : []
        ].map(line => " ".repeat(indent) + line)
    ].join("\n")

    // console.dir(error)
    console.log(errMsg)

    // Test
    let { stack, message, name } = error;
    if(!(stack && message))
    {
        console.info(c.dim.red`Missing ${ [
            ...error.stack   ? [] : ['stack'], 
            ...error.message ? [] : ['message'], 
        ].join(', ') }`)

        return
    }

    return;

    let nameIdx = 21;
    let valIdx  = 18;
    let printNameAndValue = <K extends string | number, V extends string>(o: Record<K, V>) => 
    {
        let [k,v] = entries(o)[0];
        if(!(k && typeof k ==='string' || !(k.match('error')))) 
        {
            return;
        }
        console.log(c.ansi256(nameIdx)(k))
        console.log(c.ansi256(valIdx)(v))
    }
}
