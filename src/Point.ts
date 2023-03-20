/**
 * Class get x and y coordinates of the point.
 */
export class Point {
    constructor(public x: number, public y: number) { }

    /**
     * Get json for the given point.
     *
     * @returns 
     */
    public json(): string {
        return JSON.stringify(this);
    }
}
