"use strict";
class OffsetValue {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Pattern {
    constructor(pattern, allowOnCorners = true, allowedOnSides = true) {
        this.pattern = pattern;
        this.allowOnCorners = allowOnCorners;
        this.allowedOnSides = allowedOnSides;
        if (pattern.length > Layout.anglesCount) {
            throw Error(`Pattern can contain only {Layout.anglesCount} items`);
        }
    }
}
class Orientation {
    constructor(orientation = Orientation.flat) {
        this.orientation = orientation;
        this.offsets = new Map();
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
    getOffsetX(angle) {
        var _a;
        return ((_a = this.offsets.get(angle)) === null || _a === void 0 ? void 0 : _a.x) || 0;
    }
    getOffsetY(angle) {
        var _a;
        return ((_a = this.offsets.get(angle)) === null || _a === void 0 ? void 0 : _a.y) || 0;
    }
    isFlat() {
        return this.orientation == Orientation.flat;
    }
}
Orientation.flat = 'flat';
Orientation.pointy = 'pointy';
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    json() {
        return JSON.stringify(this);
    }
}
class Item {
    constructor(center) {
        this.center = center;
        this.neighbours = new Map();
    }
}
class Layout {
    constructor(size, levelCount = 1, orientation = Orientation.flat) {
        this.size = size;
        this.levelCount = levelCount;
        this.items = new Map();
        this.canvas = new Canvas();
        this.patterns = [
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
        this.contreAngles = {
            0: 3,
            1: 4,
            2: 5,
            3: 0,
            4: 1,
            5: 2
        };
        this.orientation = new Orientation(orientation);
        if (this.levelCount < 1) {
            throw Error("Level count should be bigger than 0.");
        }
        let map = new Map();
        let p = new Point(1, 2);
        map.set(p, new Point(3, 4));
        console.log(JSON.stringify(new Point(1, 2)));
        console.log(JSON.stringify(p));
        let onClick = (event) => {
            this.onClick(event);
        };
        onClick.bind(this);
        this.canvas.canvas.addEventListener('click', onClick, false);
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.buildLevels();
        this.draw();
    }
    onClick(event) {
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
    draw() {
        for (let item of this.items.values()) {
            this.canvas.drawCircle(item.center, this.size);
            this.drawRandomPattern(item);
        }
    }
    drawRandomPattern(item) {
        let patterns = this.patterns;
        // Item is conner, so we keep patterns for conners.
        if (item.neighbours.size == 3) {
            patterns = patterns.filter(pattern => pattern.allowOnCorners);
        }
        // Item is side, so we keep patterns for sides.
        if (item.neighbours.size == 4) {
            patterns = patterns.filter(pattern => pattern.allowedOnSides);
        }
        let pattern = patterns[Math.floor(Math.random() * patterns.length)];
        for (let i = 0; i < pattern.pattern.length; i++) {
            if (pattern.pattern[i] == 1) {
                let offsetPoint = this.getPointWithOffset(item.center, i, false);
                this.canvas.drawLine(item.center, offsetPoint);
            }
        }
    }
    buildLevels() {
        let item = new Item(this.center);
        this.items.set(item.center.json(), item);
        this.buildLevel(item, 1);
        this.addNeighbours();
    }
    pointBelongCircle(point) {
        for (let item of this.items.values()) {
            // (x – a)^2 + (y – b)^2 ≤ r^2, (a,b) center of circle, r - radius
            if (Math.pow(point.x - item.center.x, 2) + Math.pow(point.y - item.center.y, 2) <= Math.pow(this.size, 2)) {
                return item;
            }
        }
        return null;
    }
    addItem(point) {
        let item;
        if (!this.items.has(point.json())) {
            item = new Item(point);
            this.items.set(point.json(), item);
        }
        else {
            item = this.items.get(point.json());
        }
        return item;
    }
    buildLevel(currentItem, currentLevel) {
        currentLevel++;
        if (currentLevel > this.levelCount) {
            return;
        }
        for (let x = 0; x < Layout.anglesCount; x++) {
            let center = this.getPointWithOffset(currentItem.center, x);
            let neighbour = this.addItem(center);
            this.buildLevel(neighbour, currentLevel);
        }
    }
    getPointWithOffset(point, angle, isCenter = true) {
        // We keep only 2 decimal number precision.
        let devider = isCenter ? 1 : 2;
        return new Point(+((point.x + this.size * this.orientation.getOffsetX(angle) / devider).toFixed(2)), +((point.y + this.size * this.orientation.getOffsetY(angle) / devider).toFixed(2)));
    }
    addNeighbours() {
        for (let item of this.items.values()) {
            for (let x = 0; x < Layout.anglesCount; x++) {
                let center = this.getPointWithOffset(item.center, x);
                if (this.items.has(center.json())) {
                    item.neighbours.set(x, this.items.get(center.json()));
                }
            }
        }
    }
}
Layout.anglesCount = 6;
class Canvas {
    constructor() {
        this.canvas = document.getElementById("canvas");
        if (this.canvas == null) {
            throw new Error("Canvas is not found");
        }
        this.context = this.canvas.getContext("2d");
        const dpr = window.devicePixelRatio;
        this.canvas.height = 500;
        this.canvas.width = 1000;
        this.context.scale(dpr, dpr);
    }
    drawCircle(point, radius, fill = false) {
        this.context.beginPath();
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        if (fill) {
            this.context.fill();
        }
        this.context.stroke();
    }
    drawLine(start, end) {
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
    }
}
var layout = new Layout(20, 3, Orientation.pointy);
