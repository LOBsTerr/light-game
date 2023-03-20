import { Point } from './Point';
import { Canvas } from './Canvas';
import { Item } from './Item';
import { Orientation } from './Orientation';

/**
 * Class builds and handles game layout
 */
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

        // To make game possible we need at least 2 levels.
        if (this.levelCount < 1) {
            throw Error("Level count should be bigger than 0.");
        }

        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.startItem = new Item(this.center);

        this.defineMouseListeners();

        this.buildLevels();
        this.buildTree();
        this.render();
    }

    /**
     * Setup mouse click hanlders.
     */
    protected defineMouseListeners() {

        const onLeftClick = (event: MouseEvent) => {
            this.onLeftClick(event)
        }
        onLeftClick.bind(this);

        this.canvas.canvas.addEventListener('click', onLeftClick, false);

        const onRightClick = (event: MouseEvent) => {
            this.onRightClick(event);
        }
        onRightClick.bind(this);

        this.canvas.canvas.addEventListener('contextmenu', onRightClick, false);
    }

    /**
     * Build spanning tree randomly perform DFS.
     */
    protected buildTree(): void {
        // Randomly set the starting point.
        const keys = Array.from(this.items.keys());
        this.startItem = this.items.get(keys[this.getRandomValue(keys.length)]) as Item;
        this.startItem.isMain = true;

        // Recursive call to build tree for each neighbor.
        this.buildGraphItems(this.startItem);

        // After the correct tree is build, we can randomly mixed items.
        this.randomlyTurnItems();
    }

    /**
     * Randomly turn the current item.
     */
    protected randomlyTurnItems(): void {
        // Shift randomly pattern, based on this pattern an item will be turn on the specific angle.
        // One step shift give turn on 30%.
        for (const item of Array.from(this.items.values())) {
            item.randomPattern = [...item.pattern];
            const randomValue = this.getRandomValue(5);
            this.turnItem(item, randomValue, Layout.left);
        }
    }

    /**
     * We recursivly check every item's neighbor and randomly build the tree for them.
     *
     * @param item
     *   Item to be processed.
     */
    protected buildGraphItems(item: Item): void {
        // We visited the item, skip it.
        if (this.visited.has(item)) {
            return;
        }

        this.visited.add(item);

        // We randoly shuffle neighbors.
        const neighborsKeys = this.shuffle(Array.from(item.neighbors.keys()));

        for (const key of neighborsKeys) {
            const neighbor: Item = item.neighbors.get(key) as Item;
            if (!this.visited.has(neighbor)) {
                // Set the pattern for the item based, on the neighbors we visited.
                item.pattern[key] = 1;
                // Set back pattern to neighbor based on connection between item and neighbor.
                neighbor.pattern[this.contreAngles[key]] = 1;

                this.buildGraphItems(neighbor);
            }
        }
    }

    /**
     * Recursively build active path from starting item.
     *
     * @param item
     *   Item to be processed.
     */
    protected buildActivePath(item: Item): void {
        // We visited the item, skip it.
        if (this.visited.has(item)) {
            return;
        }

        this.visited.add(item);

        for (const [key, neighbor] of item.neighbors.entries()) {
            // Check the connection between the current item and neighbor based on patter.
            if (this.hasConnectedItem(item, neighbor, key)) {
                // Highlight item if it part of the active path.
                this.renderItem(item, true);
                this.buildActivePath(neighbor);
            }
        }
    }

    /**
     * Check that item as connected based on their patterns.
     *
     * @param item
     *   Current item.
     * @param neighbor 
     *   Neighbor.
     * @param angle
     *   Andgle where neighbor is located.
     *
     * @returns 
     *   Are items connected.
     */
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

    /**
     * Render the current state of the game.
     */
    protected render(): void {
        // Clear canvas before rerendering everything.
        this.canvas.clear();

        // Render every state of the item.
        for (const item of this.items.values()) {
            this.renderItem(item);
        }

        // Rebuild active path.
        this.visited.clear();
        this.buildActivePath(this.startItem);
    }

    /**
     * Render the given item.
     *
     * @param item
     *   Item to be rendered.
     * @param highlightItem
     *   Is item highlighted.
     */
    protected renderItem(item: Item, highlightItem: boolean = false): void {

        for (const key in item.randomPattern) {
            // this.canvas.circle(item.center, this.size, false);
            if (item.randomPattern[key] == 1) {
                const offsetPoint = this.getPointWithOffset(item.center, Number(key), false);
                const color = highlightItem || item.isMain ? 'red' : 'black';
                this.canvas.line(item.center, offsetPoint, color);
            }
        }

        // Add small dot in the center of the item.
        this.canvas.circle(item.center, 3, true);
    }

    /**
     * Get random value between 0 and max.
     *
     * @param max
     *   Max value.
     *
     * @returns
     *   Random value. 
     */
    protected getRandomValue(max: number): number {
        return Math.floor(Math.random() * max);
    }

    /**
     * Build game leves.
     */
    protected buildLevels(): void {
        const item: Item = new Item(this.center);
        this.items.set(item.center.json(), item);

        this.buildLevel(item, 1);
        this.addNeighbors();
    }

    /**
     * Get the item based on the coordinated on Canvas.
     *
     * @param point
     *   Point on the canvase.
     *
     * @returns
     *   Item or null.
     */
    protected pointBelongCircle(point: Point): Item | null {
        for (const item of this.items.values()) {
            // (x – a)^2 + (y – b)^2 ≤ r^2, (a,b) center of circle, r - radius
            if (Math.pow(point.x - item.center.x, 2) + Math.pow(point.y - item.center.y, 2) <= Math.pow(this.size, 2)) {
                return item;
            }
        }

        return null;
    }

    /**
     * Add item for given point.
     *
     * @param point
     *   The center of the item.
     *
     * @returns
     *   Item.
     */
    protected addItem(point: Point): Item {
        let item: Item;
        const json = point.json();

        if (!this.items.has(json)) {
            item = new Item(point);
            this.items.set(json, item);
        } else {
            item = this.items.get(json) as Item;
        }

        return item;
    }

    /**
     * Turn item on clockwise (right) and counterclockwise (left).
     *
     * @param item
     *    Item to be turned.
     * @param shift
     *    Shift in the pattern, one shift give 30 degree turn.
     * @param direction 
     *    Direction it could be left or right.
     */
    protected turnItem(item: Item, shift: number, direction: string): void {
        item.randomPattern = this.shift(item.randomPattern, shift, direction);
        // After the turn we need rerender everything.
        this.render();
    }

    /**
     * Build recurssively the connection between items based on the level numbers.
     *
     * @param currentItem
     *   Item.
     * @param currentLevel
     *   Level.
     */
    protected buildLevel(currentItem: Item, currentLevel: number): void {
        currentLevel++;

        // We reached the given level, we can stop recurssion.
        if (currentLevel > this.levelCount) {
            return;
        }

        // Run through all angles to build neighbors.
        for (let x: number = 0; x < Layout.anglesCount; x++) {
            const center = this.getPointWithOffset(currentItem.center, x);
            const neighbor: Item = this.addItem(center);
            this.buildLevel(neighbor, currentLevel);
        }
    }

    /**
     * Shift pattern on the left or on the right.
     *
     * @param list
     *   Array of items.
     * @param shift
     *   Shift which we want to apply.
     * @param direction
     *   We shift list on the left or on the right.
     *
     * @returns
     *   New array with the shift.
     */
    protected shift(list: number[], shift: number, direction: string): number[] {
        for (let i = 0; i < shift; i++) {
            if (direction == Layout.left) {
                const item = list.pop() as number;
                list.unshift(item);
            } else {
                const item = list.shift() as number;
                list.push(item);
            }
        }
        return list;
    }

    /**
     * Get offset for x and y coordinates from the given point based on Orientation.
     *
     * @param point
     *   The given point.
     * @param angle
     *   Angle to which we want to get offset.
     * @param isCenter
     *   Is this the center of new item or the point on the circle.
     *
     * @returns 
     *   Gets a point with offset.
     */
    protected getPointWithOffset(point: Point, angle: number, isCenter: boolean = true): Point {
        // We keep only 2 decimal number precision.
        const devider = isCenter ? 1 : 2;
        return new Point(
            +((point.x + this.size * this.orientation.getOffsetX(angle) / devider).toFixed(2)),
            +((point.y + this.size * this.orientation.getOffsetY(angle) / devider).toFixed(2))
        );
    }

    /**
     * We need to set all possible connection between items to build a tree later.
     */
    protected addNeighbors(): void {
        for (const item of this.items.values()) {
            for (let x: number = 0; x < Layout.anglesCount; x++) {

                const center = this.getPointWithOffset(item.center, x);

                if (this.items.has(center.json())) {
                    item.neighbors.set(x, this.items.get(center.json()) as Item);
                }
            }
        }
    }

    /**
     * On left mouse button click handler.
     *
     * @param event
     *  Event. 
     */
    protected onLeftClick(event: MouseEvent): void {
        const item = this.pointBelongCircle(this.getCanvasClickedPoint(event));
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

    /**
     * On right mouse button click handler.
     *
     * @param event
     *  Event. 
     */
    protected onRightClick(event: MouseEvent): void {
        event.preventDefault();

        const item = this.pointBelongCircle(this.getCanvasClickedPoint(event));
        if (item) {
            if (event.button == 2) {
                this.turnItem(item, 1, Layout.right);
            }
        }
    }

    /**
     * Shuffle array items.
     *
     * @param array
     *   Given array.
     *
     * @returns
     *   Shufftled array.
     */
    protected shuffle(array: number[]): number[] {
        const copy = [];
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

/**
 * Dictionary interface.
 */
interface Dictionary<Type> {
    [key: number]: Type;
}