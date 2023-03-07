"use strict";
var Orientation;
(function (Orientation) {
    Orientation["FLAT"] = "flat";
    Orientation["POINTY"] = "pointy";
})(Orientation || (Orientation = {}));
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
        const halfWidth = this.getWidth() / 2;
        const halfHeight = this.getHeight() / 2;
        const halfSize = this.size / 2;
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
class Canvas {
    constructor(size, orientation) {
        this.size = size;
        this.orientation = orientation;
        this.canvas = document.getElementById("canvas");
        if (this.canvas == null) {
            throw new Error("Canvas is not found");
        }
        this.context = this.canvas.getContext("2d");
        const dpr = window.devicePixelRatio;
        this.canvas.height = 500;
        this.canvas.width = 1000;
        this.context.scale(dpr, dpr);
        const hex = new Hexagon(size, 50, 50, orientation);
        const hex1 = new Hexagon(size, 150, 50, Orientation.POINTY);
        const hex2 = new Hexagon(size, 250, 50, orientation);
        hex1.draw(this.context);
        hex2.draw(this.context);
        hex.draw(this.context);
        // this.drawVerticalCoordinates();
        // this.drawHorizontalCoordinates();
    }
    getWidth() {
        return this.isFlat() ? 2 * this.size : Math.sqrt(3) * this.size;
    }
    getHeight() {
        return this.isFlat() ? Math.sqrt(3) * this.size : 2 * this.size;
    }
    getCoordinatesHorizontalStep() {
        return this.isFlat() ? 3 * this.getWidth() / 4 : this.getWidth();
    }
    getCoordinatesVerticalStep() {
        return this.isFlat() ? this.getHeight() : 3 * this.getHeight() / 4;
    }
    isFlat() {
        return this.orientation == Orientation.FLAT;
    }
    drawVerticalCoordinates() {
        var _a, _b;
        let y = 0;
        const height = (_a = this.canvas) === null || _a === void 0 ? void 0 : _a.height;
        if (height == undefined) {
            return;
        }
        const width = (_b = this.canvas) === null || _b === void 0 ? void 0 : _b.width;
        if (width == undefined) {
            return;
        }
        const step = this.getCoordinatesVerticalStep();
        while (y < height) {
            this.context.beginPath();
            this.context.setLineDash([1, 2]);
            this.context.moveTo(0, y);
            this.context.lineTo(width, y);
            this.context.stroke();
            y += step;
        }
    }
    drawHorizontalCoordinates() {
        var _a, _b;
        let x = 0;
        const height = (_a = this.canvas) === null || _a === void 0 ? void 0 : _a.height;
        if (height == undefined) {
            return;
        }
        const width = (_b = this.canvas) === null || _b === void 0 ? void 0 : _b.width;
        if (width == undefined) {
            return;
        }
        const step = this.getCoordinatesHorizontalStep();
        while (x < width) {
            this.context.beginPath();
            this.context.setLineDash([1, 2]);
            this.context.moveTo(x, 0);
            this.context.lineTo(x, height);
            this.context.stroke();
            x += step;
        }
    }
}
var canvas = new Canvas(50, Orientation.FLAT);
