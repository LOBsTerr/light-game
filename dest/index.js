"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var Layout = /** @class */ (function () {
    function Layout(size, levelCount, orientation) {
        if (levelCount === void 0) { levelCount = 1; }
        if (orientation === void 0) { orientation = Orientation.flat; }
        var _this = this;
        this.size = size;
        this.levelCount = levelCount;
        this.items = new Map();
        this.graph = new Map();
        this.canvas = new Canvas();
        this.path = new Stack();
        this.visited = new Set();
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
        var onClick = function (event) {
            _this.onClick(event);
        };
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
    Layout.prototype.drawVisited = function () {
        var e_1, _a;
        this.canvas.context.beginPath();
        var i = 1;
        try {
            for (var _b = __values(this.visited), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                if (i == 1) {
                    this.canvas.context.moveTo(item.center.x, item.center.y);
                }
                else {
                    this.canvas.context.lineTo(item.center.x, item.center.y);
                }
                i++;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.canvas.context.stroke();
    };
    Layout.prototype.buildGraph = function () {
        this.graph = this.items;
        var keys = Array.from(this.items.keys());
        var startItem = this.items.get(keys[this.getRandomValue(keys.length)]);
        this.path.push(startItem);
        this.buildGraphItems(startItem);
    };
    Layout.prototype.buildGraphItems = function (item) {
        console.log(item.center);
        this.visited.add(item);
        this.path.push(item);
        var notVisited = this.getNotVisitedNeigbors(item);
        if (notVisited.length > 0) {
            var randomNeigbor = item.neighbors.get(notVisited[this.getRandomValue(notVisited.length)]);
            this.canvas.drawCircle(randomNeigbor.center, this.size, false);
            this.canvas.drawLine(item.center, randomNeigbor.center);
            this.buildGraphItems(randomNeigbor);
        }
        else {
            var stackItem = this.path.pop();
            notVisited = this.getNotVisitedNeigbors(stackItem);
            if (notVisited.length == 0) {
                // todo: we need to refactor the structure, in order remove processed neighbors.
                while (this.path.size() > 0 && notVisited.length == 0) {
                    stackItem = this.path.pop();
                    notVisited = this.getNotVisitedNeigbors(stackItem);
                }
            }
            if (notVisited.length > 0) {
                var randomNeigbor = stackItem.neighbors.get(notVisited[this.getRandomValue(notVisited.length)]);
                this.canvas.drawCircle(randomNeigbor.center, this.size, false);
                this.canvas.drawLine(stackItem.center, randomNeigbor.center);
                this.buildGraphItems(randomNeigbor);
            }
        }
        return;
    };
    Layout.prototype.getNotVisitedNeigbors = function (item) {
        var e_2, _a;
        var notVisited = [];
        try {
            // Collect not visited neighbors.
            for (var _b = __values(item.neighbors.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], neighbor = _d[1];
                if (!this.visited.has(neighbor)) {
                    notVisited.push(key);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return notVisited;
    };
    Layout.prototype.draw = function () {
        var e_3, _a;
        try {
            for (var _b = __values(this.items.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                this.canvas.drawCircle(item.center, this.size, false);
                // this.drawRandomPattern(item);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    Layout.prototype.getRandomValue = function (length) {
        return Math.floor(Math.random() * length);
    };
    Layout.prototype.buildLevels = function () {
        var item = new Item(this.center);
        this.items.set(item.center.json(), item);
        this.buildLevel(item, 1);
        this.addNeighbors();
    };
    Layout.prototype.pointBelongCircle = function (point) {
        var e_4, _a;
        try {
            for (var _b = __values(this.items.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                // (x – a)^2 + (y – b)^2 ≤ r^2, (a,b) center of circle, r - radius
                if (Math.pow(point.x - item.center.x, 2) + Math.pow(point.y - item.center.y, 2) <= Math.pow(this.size, 2)) {
                    return item;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return null;
    };
    Layout.prototype.addItem = function (point) {
        var item;
        var json = point.json();
        if (!this.items.has(json)) {
            item = new Item(point);
            this.items.set(json, item);
        }
        else {
            item = this.items.get(json);
        }
        return item;
    };
    Layout.prototype.buildLevel = function (currentItem, currentLevel) {
        currentLevel++;
        if (currentLevel > this.levelCount) {
            return;
        }
        for (var x = 0; x < Layout.anglesCount; x++) {
            var center = this.getPointWithOffset(currentItem.center, x);
            var neighbor = this.addItem(center);
            this.buildLevel(neighbor, currentLevel);
        }
    };
    Layout.prototype.getPointWithOffset = function (point, angle, isCenter) {
        if (isCenter === void 0) { isCenter = true; }
        // We keep only 2 decimal number precision.
        var devider = isCenter ? 1 : 2;
        return new Point(+((point.x + this.size * this.orientation.getOffsetX(angle) / devider).toFixed(2)), +((point.y + this.size * this.orientation.getOffsetY(angle) / devider).toFixed(2)));
    };
    Layout.prototype.addNeighbors = function () {
        var e_5, _a;
        try {
            for (var _b = __values(this.items.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                for (var x = 0; x < Layout.anglesCount; x++) {
                    var center = this.getPointWithOffset(item.center, x);
                    if (this.items.has(center.json())) {
                        item.neighbors.set(x, this.items.get(center.json()));
                    }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    Layout.prototype.drawRandomPattern = function (item) {
        var patterns = this.patterns;
        // Item is conner, so we keep patterns for conners.
        if (item.neighbors.size == 3) {
            patterns = patterns.filter(function (pattern) { return pattern.allowOnCorners; });
        }
        // Item is side, so we keep patterns for sides.
        if (item.neighbors.size == 4) {
            patterns = patterns.filter(function (pattern) { return pattern.allowedOnSides; });
        }
        var pattern = patterns[this.getRandomValue(patterns.length)];
        for (var i = 0; i < pattern.pattern.length; i++) {
            if (pattern.pattern[i] == 1) {
                var offsetPoint = this.getPointWithOffset(item.center, i, false);
                this.canvas.drawLine(item.center, offsetPoint);
            }
        }
    };
    Layout.prototype.onClick = function (event) {
        // Get canvas coordinates based on clicked point on the screen.
        var rect = this.canvas.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        // if we found the clicked circle redraw it.
        var item = this.pointBelongCircle(new Point(x, y));
        if (item) {
            console.log(item.center.json());
            // this.canvas.drawCircle(item.center, this.size, true);
        }
    };
    Layout.anglesCount = 6;
    return Layout;
}());
var Pattern = /** @class */ (function () {
    function Pattern(pattern, allowOnCorners, allowedOnSides) {
        if (allowOnCorners === void 0) { allowOnCorners = true; }
        if (allowedOnSides === void 0) { allowedOnSides = true; }
        this.pattern = pattern;
        this.allowOnCorners = allowOnCorners;
        this.allowedOnSides = allowedOnSides;
        if (pattern.length > Layout.anglesCount) {
            throw Error("Pattern can contain only {Layout.anglesCount} items");
        }
    }
    return Pattern;
}());
var Item = /** @class */ (function () {
    function Item(center) {
        this.center = center;
        this.neighbors = new Map();
    }
    return Item;
}());
var Canvas = /** @class */ (function () {
    function Canvas() {
        this.i = 0;
        this.canvas = document.getElementById("canvas");
        if (this.canvas == null) {
            throw new Error("Canvas is not found");
        }
        this.context = this.canvas.getContext("2d");
        var dpr = window.devicePixelRatio;
        this.canvas.height = 500;
        this.canvas.width = 1000;
        this.context.scale(dpr, dpr);
    }
    Canvas.prototype.drawCircle = function (point, radius, fill) {
        if (fill === void 0) { fill = false; }
        this.context.beginPath();
        var colors = ['red', 'green', 'blue', 'white', 'black', 'purple', 'yellow'];
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
    };
    Canvas.prototype.drawLine = function (start, end) {
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
    };
    return Canvas;
}());
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.json = function () {
        return JSON.stringify(this);
    };
    return Point;
}());
var Orientation = /** @class */ (function () {
    function Orientation(orientation) {
        if (orientation === void 0) { orientation = Orientation.flat; }
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
    Orientation.prototype.getOffsetX = function (angle) {
        var _a;
        return ((_a = this.offsets.get(angle)) === null || _a === void 0 ? void 0 : _a.x) || 0;
    };
    Orientation.prototype.getOffsetY = function (angle) {
        var _a;
        return ((_a = this.offsets.get(angle)) === null || _a === void 0 ? void 0 : _a.y) || 0;
    };
    Orientation.prototype.isFlat = function () {
        return this.orientation == Orientation.flat;
    };
    Orientation.flat = 'flat';
    Orientation.pointy = 'pointy';
    return Orientation;
}());
var OffsetValue = /** @class */ (function () {
    function OffsetValue(x, y) {
        this.x = x;
        this.y = y;
    }
    return OffsetValue;
}());
var Stack = /** @class */ (function () {
    function Stack(capacity) {
        if (capacity === void 0) { capacity = Infinity; }
        this.capacity = capacity;
        this.storage = [];
    }
    Stack.prototype.push = function (item) {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    };
    Stack.prototype.pop = function () {
        return this.storage.pop();
    };
    Stack.prototype.peek = function () {
        return this.storage[this.size() - 1];
    };
    Stack.prototype.size = function () {
        return this.storage.length;
    };
    return Stack;
}());
var layout = new Layout(20, 4, Orientation.pointy);
