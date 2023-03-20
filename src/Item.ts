import { Point } from "./Point";

export class Item {
    public neighbors: Map<number, Item> = new Map();
    public pattern: number[] = [0, 0, 0, 0, 0, 0];
    public randomPattern: number[] = [0, 0, 0, 0, 0, 0];
    constructor(public center: Point, public isMain: boolean = false) { }
}
