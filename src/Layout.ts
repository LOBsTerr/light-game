import { Point } from './Point';
import { Canvas } from './Canvas';
import { Item } from './Item';
import { Orientation } from './Orientation';

export class Layout {
    public static readonly left: string = 'left';
    public static readonly right: string = 'right';
    public static readonly anglesCount: number = 6;
    
    protected orientation: Orientation;
    protected center: Point;
    protected items: Map<string, Item> = new Map();
    protected canvas: Canvas = new Canvas();
    protected visited: Set<Item> = new Set();
    protected startItem: Item;

    protected contreAngles: Dictionary<number> = {
        0: 3,
        1: 4,
        2: 5,
        3: 0,
        4: 1,
        5: 2
    };

    constructor(
        protected size: number,
        protected levelCount: number = 1,
        orientation: string = Orientation.flat,
    ) {
        this.orientation = new Orientation(orientation);
        if (this.levelCount < 1) {
            throw Error("Level count should be bigger than 0.");
        }

        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.startItem = new Item(this.center);

        this.defineMouseListeners();

        this.buildLevels();
        this.buildGraph();
        this.draw();
    }

    protected defineMouseListeners() {

        let onLeftClick = (event: MouseEvent) => {
            this.onLeftClick(event)
        }
        onLeftClick.bind(this);

        this.canvas.canvas.addEventListener('click', onLeftClick, false);

        let onRightClick = (event: MouseEvent) => {
            this.onRightClick(event);
        }
        onRightClick.bind(this);

        this.canvas.canvas.addEventListener('contextmenu', onRightClick, false);
    }

    protected buildGraph(): void {
        let keys = Array.from(this.items.keys());
        this.startItem = this.items.get(keys[this.getRandomValue(keys.length)]) as Item;
        this.startItem.isMain = true;
        this.buildGraphItems(this.startItem);

        this.randomlyTurnItems();
    }

    protected randomlyTurnItems(): void {
        for (let item of Array.from(this.items.values())) {
            item.randomPattern = [...item.pattern];
            let randomValue = this.getRandomValue(5);
            this.turnItem(item, randomValue, Layout.left);
        }
    }

    protected buildGraphItems(item: Item) {
        if (this.visited.has(item)) {
            return;
        }

        this.visited.add(item);

        this.visited.add(item);
        let neighborsKeys = this.shuffle(Array.from(item.neighbors.keys()));

        for (let key of neighborsKeys) {
            let neighbor: Item = item.neighbors.get(key) as Item;
            if (!this.visited.has(neighbor)) {
                item.pattern[key] = 1;
                neighbor.pattern[this.contreAngles[key]] = 1;
                this.buildGraphItems(neighbor);
            }
        }
    }

    protected getActivePath(item: Item): void {
        if (this.visited.has(item)) {
            return;
        }

        this.visited.add(item);

        for (let [key, neighbor] of item.neighbors.entries()) {
            if (this.hasConnectedItem(item, neighbor, key)) {
                this.drawItem(item, true);
                this.getActivePath(neighbor);
            }
        }
    }

    protected hasConnectedItem(item: Item, neighbor: Item, angle: number): boolean {
        if (
            item.randomPattern[angle] &&
            item.randomPattern[angle] == 1 &&
            neighbor.randomPattern[this.contreAngles[angle]] &&
            neighbor.randomPattern[this.contreAngles[angle]] == 1
        ) {
            return true;
        }

        return false;
    }

    protected draw(): void {
        
        this.canvas.clear();

        for (let item of this.items.values()) {
            this.drawItem(item);
        }

        this.visited.clear();
        this.getActivePath(this.startItem);
    }

    protected drawItem(item: Item, highlightItem: boolean = false): void {

        for (let key in item.randomPattern) {
            // this.canvas.drawCircle(item.center, this.size, false);
            if (item.randomPattern[key] == 1) {
                let offsetPoint = this.getPointWithOffset(item.center, Number(key), false);
                let color = highlightItem || item.isMain ? 'red' : 'black';
                this.canvas.drawLine(item.center, offsetPoint, color);
            }
        }

        this.canvas.drawCircle(item.center, 3, true);
    }

    protected getRandomValue(length: number): number {
        return Math.floor(Math.random() * length);
    }

    protected buildLevels(): void {
        let item: Item = new Item(this.center);
        this.items.set(item.center.json(), item);

        this.buildLevel(item, 1);
        this.addNeighbors();
    }

    protected pointBelongCircle(point: Point): Item | null {
        for (let item of this.items.values()) {
            // (x – a)^2 + (y – b)^2 ≤ r^2, (a,b) center of circle, r - radius
            if (Math.pow(point.x - item.center.x, 2) + Math.pow(point.y - item.center.y, 2) <= Math.pow(this.size, 2)) {
                return item;
            }
        }

        return null;
    }

    protected addItem(point: Point): Item {
        let item: Item;
        let json = point.json();

        if (!this.items.has(json)) {
            item = new Item(point);
            this.items.set(json, item);
        }
        else {
            item = this.items.get(json) as Item;
        }

        return item;
    }

    protected turnItem(item: Item, shift: number, direction: string): void {
        item.randomPattern = this.shift(item.randomPattern, shift, direction);
        this.draw();
    }

    protected buildLevel(currentItem: Item, currentLevel: number): void {
        currentLevel++;

        if (currentLevel > this.levelCount) {
            return;
        }

        // Run through all angles to build neighbors.
        for (let x: number = 0; x < Layout.anglesCount; x++) {
            let center = this.getPointWithOffset(currentItem.center, x);
            let neighbor: Item = this.addItem(center);
            this.buildLevel(neighbor, currentLevel);
        }
    }

    protected shift(list: number[], shift: number, direction: string): number[] {
        for (let i = 0; i < shift; i++) {
            if (direction == Layout.left) {
                let item = list.pop() as number;
                list.unshift(item);
            }
            else {
                let item = list.shift() as number;
                list.push(item);
            }
        }
        return list;
    }

    protected getPointWithOffset(point: Point, angle: number, isCenter: boolean = true): Point {
        // We keep only 2 decimal number precision.
        let devider = isCenter ? 1 : 2;
        return new Point(
            +((point.x + this.size * this.orientation.getOffsetX(angle) / devider).toFixed(2)),
            +((point.y + this.size * this.orientation.getOffsetY(angle) / devider).toFixed(2))
        );
    }

    protected addNeighbors(): void {
        for (let item of this.items.values()) {
            for (let x: number = 0; x < Layout.anglesCount; x++) {

                let center = this.getPointWithOffset(item.center, x);

                if (this.items.has(center.json())) {
                    item.neighbors.set(x, this.items.get(center.json()) as Item);
                }
            }
        }
    }

    protected onLeftClick(event: MouseEvent): void {
        let item = this.pointBelongCircle(this.getCanvasClickedPoint(event));
        if (item) {
            if (event.button == 0) {
                this.turnItem(item, 1, Layout.left);
            }
        }
    }

    /**
     * Get canvas coordinates based on clicked point on the screen.
     *
     * @param MouseEvent event
     *   Moust event.
     *
     * @returns
     *   Point on canvas where user clicked.
     */
    protected getCanvasClickedPoint(event: MouseEvent): Point {
        const rect = this.canvas.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return new Point(x, y);
    }

    protected onRightClick(event: MouseEvent): void {
        event.preventDefault();

        let item = this.pointBelongCircle(this.getCanvasClickedPoint(event));
        if (item) {
            if (event.button == 2) {
                this.turnItem(item, 1, Layout.right);
            }
        }
    }

    protected shuffle(array: number[]): number[] {
        let copy = [];
        let n = array.length, i;

        // While there remain elements to shuffle.
        while (n) {

            // Pick a remaining element.
            i = Math.floor(Math.random() * array.length);

            // If not already shuffled, move it to the new array.
            if (i in array) {
                copy.push(array[i]);
                delete array[i];
                n--;
            }
        }

        return copy;
    }

}

interface Dictionary<Type> {
    [key: number]: Type;
}