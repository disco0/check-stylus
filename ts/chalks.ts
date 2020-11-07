import { bind } from 'helpful-decorators'
import chalk from 'chalk'

class Styles
{
    static c = chalk;
    #chalk = Styles.c;
    private bindInner(styles: { [k: string]: (...msg: any[]) => void; }): { [k: string]: (...msg: any[]) => void }
    {
        return Object.fromEntries(
            Object.entries(styles)
              .map(([prop, fn]) => {
                  return [prop, fn.bind(Styles.c)]
              })
        )
    }

    @bind
    debug(...msg: any[]): string
    { 
        return this.#chalk.ansi256(250)(...msg)
    }

    @bind
    warn(...msg: any[]): string
    { 
        return this.#chalk.ansi256(208)(...msg, '\n')
    }

    @bind
    error(...msg: any[]): string
    { 
        return this.#chalk.ansi256(208)(...msg)
    }

    @bind
    path(...msg: any[]): string
    {
        return this.#chalk.ansi256(21).underline(...msg);
    }
}

export function debug(...msg: any)
{ 
    return chalk.ansi256(250)(...msg)
}

export function warn(...msg: any)
{ 
    return chalk.ansi256(208)(...msg, '\n')
}

export function error(...msg: any)
{ 
    return chalk.ansi256(208)(...msg)
}

export const invert = 
{
        
    debug(...msg: any)
    { 
        return chalk.inverse.ansi256(250)(...msg)
    },

    warn(...msg: any)
    { 
        return chalk.inverse.ansi256(208)(...msg)
    },

    error(...msg: any)
    { 
        return chalk.inverse.ansi256(208)(...msg)
    }
}
