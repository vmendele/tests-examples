export function divide(x: number, y: number): number {
    if (x === 0 || y === 0)
        throw new Error("Cannot divide by 0")

    return x / y
}