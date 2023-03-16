class Layout {
    public static readonly anglesCount: number = 6;
    protected orientation: Orientation;
    protected items: Map<string, Item> = new Map();
    protected graph: Map<string, Item> = new Map();
    protected canvas: Canvas = new Canvas();
    protected center: Point;
    protected path: Stack<Item> = new Stack();
    protected visited: Set<Item> = new Set();

    protected patterns: Pattern[] = [
        new Pattern([1, 0, 0, 0, 0, 0]),
        new Pattern([1, 1, 0, 0, 0, 0]),
        new Pattern([1, 0, 1, 0, 0, 0]),
        new Pattern([1, 0, 0, 1, 0, 0], false, true),
        new Pattern([1, 1, 1, 0, 0, 0], true, false),
        new Pattern([1, 0, 1, 1, 0, 0], false, true),
        new Pattern([1, 1, 1, 1, 0, 0], false, true),
        new Pattern([1, 1, 1, 1, 1, 0], false, false),
        new Pattern([1, 0, 1, 1, 0, 1], false, false),
        new Pattern([1, 1, 0, 1, 0, 1], false, false),
        new Pattern([1, 1, 1, 1, 1, 1], false, false),
    ];

    protected contreAngles:Dictionary<number> = {
        0 : 3,
        1 : 4,
        2 : 5,
        3 : 0,
        4 : 1,
        5 : 2
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
        this.canvas.canvas.addEventListener('click', onClick, false);

        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);

        this.buildLevels();
        // console.log(this.items);
        this.buildGraph();
        this.draw();
        // this.drawVisited();
        // console.log(this.visited);
    }

    protected drawVisited() {
        this.canvas.context.beginPath();       
        let i = 1;
        for (let item of this.visited) {
            if (i == 1) {
                this.canvas.context.moveTo(item.center.x, item.center.y);
            }
            else {
                this.canvas.context.lineTo(item.center.x, item.center.y);
            }
            i++;
        }
        this.canvas.context.stroke();
    }


    protected buildGraph(): void {
        this.graph = this.items;
        let keys = Array.from(this.items.keys());
        let startItem = this.items.get(keys[this.getRandomValue(keys.length)]) as Item;
        this.path.push(startItem);

        this.buildGraphItems(startItem);
    }

    protected buildGraphItems(item: Item) {
        console.log(item.center);
        this.visited.add(item);
        this.path.push(item);

        let notVisited: number[] = this.getNotVisitedNeigbors(item);
        if (notVisited.length > 0) {
            let randomNeigbor = item.neighbors.get(notVisited[this.getRandomValue(notVisited.length)]) as Item;
            this.canvas.drawCircle(randomNeigbor.center, this.size, false);
            this.canvas.drawLine(item.center, randomNeigbor.center);
            this.buildGraphItems(randomNeigbor);
        }
        else {
            let stackItem = this.path.pop() as Item;
            notVisited = this.getNotVisitedNeigbors(stackItem);
            if (notVisited.length == 0) {
                // todo: we need to refactor the structure, in order remove processed neighbors.
                while (this.path.size() > 0 && notVisited.length == 0) {
                    stackItem = this.path.pop() as Item;
                    notVisited = this.getNotVisitedNeigbors(stackItem);
                }
            }

            if (notVisited.length > 0) {
                let randomNeigbor = stackItem.neighbors.get(notVisited[this.getRandomValue(notVisited.length)]) as Item;
                
                this.canvas.drawCircle(randomNeigbor.center, this.size, false);
                this.canvas.drawLine(stackItem.center, randomNeigbor.center);
                this.buildGraphItems(randomNeigbor);
            }
        }

        return;
    }

    protected getNotVisitedNeigbors(item: Item): number[] {
        let notVisited: number[] = [];
        
        // Collect not visited neighbors.
        for (let [key, neighbor] of item.neighbors.entries()) {
            if (!this.visited.has(neighbor)) {
                notVisited.push(key);
            }
        }
        return notVisited;
    }

    protected draw(): void {
        for (let item of this.items.values()) {
            this.canvas.drawCircle(item.center, this.size, false);
            // this.drawRandomPattern(item);
        }
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

    protected buildLevel(currentItem: Item, currentLevel: number): void {
        currentLevel++;
        if (currentLevel > this.levelCount) {
            return;
        }
        
        for (let x: number = 0; x < Layout.anglesCount; x++) {
            
            let center = this.getPointWithOffset(currentItem.center, x);

            let neighbor: Item = this.addItem(center);

            this.buildLevel(neighbor, currentLevel);
        }
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

    protected drawRandomPattern(item: Item): void {
        let patterns = this.patterns;
        // Item is conner, so we keep patterns for conners.
        if (item.neighbors.size == 3) {
            patterns = patterns.filter(pattern => pattern.allowOnCorners);
        }

        // Item is side, so we keep patterns for sides.
        if (item.neighbors.size == 4) {
            patterns = patterns.filter(pattern => pattern.allowedOnSides);
        }

        let pattern: Pattern =  patterns[this.getRandomValue(patterns.length)];

        for (let i = 0; i < pattern.pattern.length; i++) {
            if (pattern.pattern[i] == 1) {
                let offsetPoint = this.getPointWithOffset(item.center, i, false);
                this.canvas.drawLine(item.center, offsetPoint);
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
            console.log(item.center.json());
            // this.canvas.drawCircle(item.center, this.size, true);
        }
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
    public neighbors : Map<number, Item> = new Map();
    constructor (public center: Point) {}
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

    public drawCircle(point: Point, radius: number, fill: boolean = false): void {
        this.context.beginPath();
        let colors = ['red', 'green', 'blue', 'white', 'black', 'purple', 'yellow'];
        if (this.i == colors.length) {
            this.i = 0;
        }
        else {
            this.i++;
        }
        this.context.fillStyle = colors[this.i];
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        if (fill) {
            this.context.fill();
        }
        this.context.stroke();
    }

    public drawLine(start: Point, end: Point): void {
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
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

    constructor (public orientation: string = Orientation.flat) {
        if (this.isFlat()) {
            this.offsets.set(0, new OffsetValue(-2, 0));
            this.offsets.set(1, new OffsetValue(-1, Math.sqrt(3)));
            this.offsets.set(2, new OffsetValue(1, Math.sqrt(3)));
            this.offsets.set(3, new OffsetValue(2, 0));
            this.offsets.set(4, new OffsetValue(1, -Math.sqrt(3)));
            this.offsets.set(5, new OffsetValue(-1, -Math.sqrt(3)));
        }
        else {           
            this.offsets.set(0, new OffsetValue(0, 2));
            this.offsets.set(1, new OffsetValue(Math.sqrt(3), -1));
            this.offsets.set(2, new OffsetValue(Math.sqrt(3), 1));
            this.offsets.set(3, new OffsetValue(0, -2));
            this.offsets.set(4, new OffsetValue(-Math.sqrt(3), -1));
            this.offsets.set(5, new OffsetValue(-Math.sqrt(3), 1));
        }
    }

    public getOffsetX(angle: number) {
        return  this.offsets.get(angle)?.x || 0;
    }

    public getOffsetY(angle: number) {
        return this.offsets.get(angle)?.y || 0;
    }

    protected isFlat() {
        return this.orientation == Orientation.flat;
    }

}

class OffsetValue {
    constructor(public x: number, public y: number) {}
}

class Stack<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) { }

    push(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    pop(): T | undefined {
        return this.storage.pop();
    }

    peek(): T | undefined {
        return this.storage[this.size() - 1];
    }

    size(): number {
        return this.storage.length;
    }
}

var layout = new Layout(20, 4, Orientation.pointy);