class Layout {
    public static readonly left: string = 'left';
    public static readonly right: string = 'right';
    public static readonly anglesCount: number = 6;
    protected orientation: Orientation;
    protected center: Point;
    protected items: Map<string, Item> = new Map();
    protected graph: Map<string, Item> = new Map();
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

        let onClick = (event: MouseEvent) => {
            this.onClick(event)
        }
        onClick.bind(this);

        let onConextMenu = (event: MouseEvent) => {
            event.preventDefault();
            const rect = this.canvas.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // if we found the clicked circle redraw it.
            let item = this.pointBelongCircle(new Point(x, y));
            if (item) {
                switch (event.button) {
                    case 2:
                        this.turnItem(item, 1, Layout.right);
                        break;

                }
            }
        }
        onConextMenu.bind(this);

        this.canvas.canvas.addEventListener('contextmenu', onConextMenu, false);
        this.canvas.canvas.addEventListener('click', onClick, false);

        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);

        this.buildLevels();
        this.buildGraph();
        this.draw();
    }

    protected buildGraph(): void {
        this.graph = this.items;
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

    protected onClick(event: MouseEvent): void {
        // Get canvas coordinates based on clicked point on the screen.
        const rect = this.canvas.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // if we found the clicked circle redraw it.
        let item = this.pointBelongCircle(new Point(x, y));
        if (item) {
            switch (event.button) {
                case 0:
                    this.turnItem(item, 1, Layout.left);
                    break;

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

class Pattern {
    constructor(public pattern: number[], public allowOnCorners: boolean = true, public allowedOnSides = true) {
        if (pattern.length > Layout.anglesCount) {
            throw Error(`Pattern can contain only {Layout.anglesCount} items`);
        }
    }
}

class Item {
    public neighbors: Map<number, Item> = new Map();
    public pattern: number[] = [0, 0, 0, 0, 0, 0];
    public randomPattern: number[] = [0, 0, 0, 0, 0, 0];
    constructor(public center: Point, public isMain: boolean = false) { }
}

interface Dictionary<Type> {
    [key: number]: Type;
}

class Canvas {

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public i: number = 0;

    constructor() {

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (this.canvas == null) {
            throw new Error("Canvas is not found");
        }

        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        const dpr = window.devicePixelRatio;
        this.canvas.height = 500;
        this.canvas.width = 1000;
        this.context.scale(dpr, dpr);
    }

    public drawCircle(point: Point, radius: number, fill: boolean = false, color: string = 'grey'): void {
        this.context.beginPath();
        this.context.fillStyle = color;
        // this.context.strokeStyle = 'green';
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        if (fill) {
            this.context.fill();
        }
        this.context.lineWidth = 0;
        this.context.stroke();
    }

    public drawLine(start: Point, end: Point, color: string = 'black'): void {
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.strokeStyle = color;
        this.context.fillStyle = color;
        this.context.lineWidth = 5;
        this.context.stroke();

        this.context.strokeStyle = 'black';
        this.context.fillStyle = 'black';
        this.context.lineWidth = 1;
    }

    public clear(): void {
        let gradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, "#e8e6df");
        gradient.addColorStop(0.5, "#e6e1d3");
        gradient.addColorStop(1, "#e8e6df");

        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}

class Point {
    constructor(public x: number, public y: number) { }

    public json(): string {
        return JSON.stringify(this);
    }
}

class Orientation {
    static readonly flat = 'flat';
    static readonly pointy = 'pointy';

    protected offsets: Map<number, OffsetValue> = new Map();

    constructor(public orientation: string = Orientation.flat) {
        if (this.isFlat()) {
            this.offsets.set(0, new OffsetValue(-2, 0));
            this.offsets.set(1, new OffsetValue(-1, -Math.sqrt(3)));
            this.offsets.set(2, new OffsetValue(1, -Math.sqrt(3)));
            this.offsets.set(3, new OffsetValue(2, 0));
            this.offsets.set(4, new OffsetValue(1, Math.sqrt(3)));
            this.offsets.set(5, new OffsetValue(-1, Math.sqrt(3)));
        }
        else {
            this.offsets.set(0, new OffsetValue(0, -2));
            this.offsets.set(1, new OffsetValue(Math.sqrt(3), -1));
            this.offsets.set(2, new OffsetValue(Math.sqrt(3), 1));
            this.offsets.set(3, new OffsetValue(0, 2));
            this.offsets.set(4, new OffsetValue(-Math.sqrt(3), 1));
            this.offsets.set(5, new OffsetValue(-Math.sqrt(3), -1));
        }
    }

    public getOffsetX(angle: number) {
        return this.offsets.get(angle)?.x || 0;
    }

    public getOffsetY(angle: number) {
        return this.offsets.get(angle)?.y || 0;
    }

    protected isFlat() {
        return this.orientation == Orientation.flat;
    }

}

class OffsetValue {
    constructor(public x: number, public y: number) { }
}

var layout = new Layout(20, 5, Orientation.pointy);