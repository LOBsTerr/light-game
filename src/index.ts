class OffsetValue {
    constructor(public x: number, public y: number) {}
}

class Pattern {
    constructor(public pattern: number[], public allowOnCorners: boolean = true, public allowedOnSides = true) {
        if (pattern.length > Layout.anglesCount) {
            throw Error(`Pattern can contain only {Layout.anglesCount} items`);
        }
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

class Point {
    constructor(public x: number, public y: number) { }

    public json(): string {
        return JSON.stringify(this);
    }
}

class Item {
    public neighbours : Map<number, Item> = new Map();
    constructor (public center: Point) {}
}

 interface Dictionary<Type> {
    [key: number]: Type;
 }

class Layout {
    public static readonly anglesCount: number = 6;
    protected orientation: Orientation;
    protected items: Map<string, Item> = new Map();
    protected canvas: Canvas = new Canvas();
    protected center: Point;

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

        let map : Map<Point, Point> = new Map();
        let p = new Point(1, 2);
        map.set(p, new Point(3, 4));
        console.log(JSON.stringify(new Point(1, 2)));
        console.log(JSON.stringify(p));

        let onClick = (event: MouseEvent) => {
            this.onClick(event)
        }
        onClick.bind(this);
        this.canvas.canvas.addEventListener('click', onClick, false);

        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);

        this.buildLevels();
        this.draw();
    }

    protected onClick(event: MouseEvent): void {
        // Get canvas coordinates based on clicked point on the screen.
        const rect = this.canvas.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // if we found the clicked circle redraw it.
        let item = this.pointBelongCircle(new Point(x, y));
        if (item) {
            this.canvas.drawCircle(item.center, this.size, true);
        }
    }

    protected draw(): void {
        for (let item of this.items.values()) {
            this.canvas.drawCircle(item.center, this.size);
            this.drawRandomPattern(item);
        }
    }

    protected drawRandomPattern(item: Item): void {
        let patterns = this.patterns;
        // Item is conner, so we keep patterns for conners.
        if (item.neighbours.size == 3) {
            patterns = patterns.filter(pattern => pattern.allowOnCorners);
        }

        // Item is side, so we keep patterns for sides.
        if (item.neighbours.size == 4) {
            patterns = patterns.filter(pattern => pattern.allowedOnSides);
        }

        let pattern: Pattern =  patterns[Math.floor(Math.random() * patterns.length)];

        for (let i = 0; i < pattern.pattern.length; i++) {
            if (pattern.pattern[i] == 1) {
                let offsetPoint = this.getPointWithOffset(item.center, i, false);
                this.canvas.drawLine(item.center, offsetPoint);
            }
        }
    }

    protected buildLevels(): void {

        let item: Item = new Item(this.center);
        this.items.set(item.center.json(), item);

        this.buildLevel(item, 1);  
        
        this.addNeighbours();
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
        if (!this.items.has(point.json())) {
            item = new Item(point);
            this.items.set(point.json(), item);
        }
        else {
            item = this.items.get(point.json()) as Item;
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

            let neighbour: Item = this.addItem(center);

            this.buildLevel(neighbour, currentLevel);
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
        
    protected addNeighbours(): void {
        for (let item of this.items.values()) {
            for (let x: number = 0; x < Layout.anglesCount; x++) {
            
                let center = this.getPointWithOffset(item.center, x);

                if (this.items.has(center.json())) {
                    item.neighbours.set(x, this.items.get(center.json()) as Item);
                }
            }
        }
    }

}

class Canvas {

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

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

var layout = new Layout(20, 3, Orientation.pointy);