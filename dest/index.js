"use strict";
class OffsetValue {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Orientation {
    constructor(orientation = Orientation.flat) {
        this.orientation = orientation;
        this.angles = new Map();
        if (this.isFlat()) {
            this.angles.set(0, new OffsetValue(-2, 0));
            this.angles.set(1, new OffsetValue(-1, Math.sqrt(3)));
            this.angles.set(2, new OffsetValue(1, Math.sqrt(3)));
            this.angles.set(3, new OffsetValue(2, 0));
            this.angles.set(4, new OffsetValue(1, -Math.sqrt(3)));
            this.angles.set(5, new OffsetValue(-1, -Math.sqrt(3)));
        }
        else {
            this.angles.set(0, new OffsetValue(0, 2));
            this.angles.set(1, new OffsetValue(Math.sqrt(3), -1));
            this.angles.set(2, new OffsetValue(Math.sqrt(3), 1));
            this.angles.set(3, new OffsetValue(0, -2));
            this.angles.set(4, new OffsetValue(-Math.sqrt(3), -1));
            this.angles.set(5, new OffsetValue(-Math.sqrt(3), 1));
        }
    }
    getOffsetX(angle) {
        var _a;
        return ((_a = this.angles.get(angle)) === null || _a === void 0 ? void 0 : _a.x) || 0;
    }
    getOffsetY(angle) {
        var _a;
        return ((_a = this.angles.get(angle)) === null || _a === void 0 ? void 0 : _a.y) || 0;
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
        this.items = [];
        this.canvas = new Canvas();
        this.orientation = new Orientation(orientation);
        if (this.levelCount < 1) {
            throw Error("Level count should be bigger than 0.");
        }
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.buildLevels();
        this.draw();
    }
    draw() {
        for (let item of this.items) {
            this.canvas.drawCircle(item.center, this.size);
        }
    }
    buildLevels() {
        let item = new Item(this.center);
        this.items.push(item);
        this.addNeighbours(item, 1);
    }
    addNeighbours(currentItem, currentLevel) {
        currentLevel++;
        if (currentLevel > this.levelCount) {
            return;
        }
        for (let x = 0; x < 6; x++) {
            let center = new Point(currentItem.center.x + this.size * this.orientation.getOffsetX(x), currentItem.center.y + this.size * this.orientation.getOffsetY(x));
            let neighbour = new Item(center);
            this.items.push(neighbour);
            this.addNeighbours(neighbour, currentLevel);
        }
    }
}
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
    drawCircle(point, radius) {
        this.context.beginPath();
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        // this.context.fill();
        this.context.stroke();
    }
}
var layout = new Layout(20, 5, Orientation.pointy);
class Hexagon {
    constructor(size, x, y, orientation) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.orientation = orientation;
    }
    isFlat() {
        return this.orientation == Orientation.FLAT;
    }
    getWidth() {
        return this.isFlat() ? 2 * this.size : Math.sqrt(3) * this.size;
    }
    getHeight() {
        return this.isFlat() ? Math.sqrt(3) * this.size : 2 * this.size;
    }
    draw(context) {
        const halfWidth = this.getWidth();
        const halfHeight = this.getHeight();
        const halfSize = this.size;
        const isFlat = this.isFlat();
        const x1 = isFlat ? this.x - this.size : this.x;
        const x2 = isFlat ? this.x - halfSize : this.x + halfWidth;
        const x3 = isFlat ? this.x + halfSize : x2;
        const x4 = isFlat ? this.x + this.size : x1;
        const x5 = isFlat ? x3 : this.x - halfWidth;
        const x6 = isFlat ? x2 : x5;
        const y1 = isFlat ? this.y : this.y - this.size;
        const y2 = isFlat ? this.y - halfHeight : this.y - halfSize;
        const y3 = isFlat ? y2 : this.y + halfSize;
        const y4 = isFlat ? y1 : this.y + this.size;
        const y5 = isFlat ? this.y + halfHeight : y3;
        const y6 = isFlat ? y5 : y2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.lineTo(x4, y4);
        context.lineTo(x5, y5);
        context.lineTo(x6, y6);
        context.lineTo(x1, y1);
        context.stroke();
    }
}
