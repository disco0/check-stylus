export type NaturalNumber = Number & { '$$brand'?: '' }

export function isInt(obj: unknown): obj is number
{
    return Number.isInteger(obj)
}

function unnaturalThrow(obj: any): never 
{
    ((obj) => 
    {
        throw new Error(`Value ${obj} is not zero or positive integer (ℕ₀).`)
    })(
        typeof obj === 'undefined'  ? 
            '[undefined]' : 
        'toString' in obj && typeof obj['toString'] === 'function' 
            ? obj.toString() :
            obj
    )
}

/**
 * Validates parameter `obj` is an integer is equal to or greater than zero
 */
export function assertNaturalNumber(obj: unknown): asserts obj is NaturalNumber
{
    if(isInt(obj) && (obj >= 0)) return

    unnaturalThrow(obj)
}

/**
 * Validates parameter `obj` is an integer is equal to or greater than zero
 */
export function checkNaturalNumber(obj: unknown): NaturalNumber
{
    if(isInt(obj) && (obj >= 0)) 
        return (obj as NaturalNumber);
    
    else unnaturalThrow(obj);
}
