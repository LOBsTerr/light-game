export class Point {
    constructor(public x: number, public y: number) { }

    public json(): string {
        return JSON.stringify(this);
    }
}