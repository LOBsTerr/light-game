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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
        this.visited = new Set();
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
        var onConextMenu = function (event) {
            event.preventDefault();
            var rect = _this.canvas.canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            // if we found the clicked circle redraw it.
            var item = _this.pointBelongCircle(new Point(x, y));
            if (item) {
                switch (event.button) {
                    case 2:
                        _this.turnItem(item, 1, Layout.right);
                        break;
                }
            }
        };
        onConextMenu.bind(this);
        this.canvas.canvas.addEventListener('contextmenu', onConextMenu, false);
        this.canvas.canvas.addEventListener('click', onClick, false);
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.center = new Point(this.canvas.canvas.width / 2, this.canvas.canvas.height / 2);
        this.buildLevels();
        this.buildGraph();
        this.draw();
    }
    Layout.prototype.buildGraph = function () {
        this.graph = this.items;
        var keys = Array.from(this.items.keys());
        this.startItem = this.items.get(keys[this.getRandomValue(keys.length)]);
        this.startItem.isMain = true;
        this.buildGraphItems(this.startItem);
        this.randomlyTurnItems();
    };
    Layout.prototype.randomlyTurnItems = function () {
        var e_1, _a;
        try {
            for (var _b = __values(Array.from(this.items.values())), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                item.randomPattern = __spreadArray([], __read(item.pattern), false);
                var randomValue = this.getRandomValue(5);
                this.turnItem(item, randomValue, Layout.left);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Layout.prototype.buildGraphItems = function (item) {
        var e_2, _a;
        if (this.visited.has(item)) {
            return;
        }
        this.visited.add(item);
        this.visited.add(item);
        var neighborsKeys = this.shuffle(Array.from(item.neighbors.keys()));
        try {
            for (var neighborsKeys_1 = __values(neighborsKeys), neighborsKeys_1_1 = neighborsKeys_1.next(); !neighborsKeys_1_1.done; neighborsKeys_1_1 = neighborsKeys_1.next()) {
                var key = neighborsKeys_1_1.value;
                var neighbor = item.neighbors.get(key);
                if (!this.visited.has(neighbor)) {
                    item.pattern[key] = 1;
                    neighbor.pattern[this.contreAngles[key]] = 1;
                    this.buildGraphItems(neighbor);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (neighborsKeys_1_1 && !neighborsKeys_1_1.done && (_a = neighborsKeys_1.return)) _a.call(neighborsKeys_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Layout.prototype.getActivePath = function (item) {
        var e_3, _a;
        if (this.visited.has(item)) {
            return;
        }
        this.visited.add(item);
        try {
            for (var _b = __values(item.neighbors.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], neighbor = _d[1];
                if (this.hasConnectedItem(item, neighbor, key)) {
                    this.drawItem(item, true);
                    this.getActivePath(neighbor);
                }
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
    Layout.prototype.hasConnectedItem = function (item, neighbor, angle) {
        if (item.randomPattern[angle] &&
            item.randomPattern[angle] == 1 &&
            neighbor.randomPattern[this.contreAngles[angle]] &&
            neighbor.randomPattern[this.contreAngles[angle]] == 1) {
            return true;
        }
        return false;
    };
    Layout.prototype.draw = function () {
        var e_4, _a;
        this.canvas.clear();
        try {
            for (var _b = __values(this.items.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                this.drawItem(item);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.visited.clear();
        this.getActivePath(this.startItem);
    };
    Layout.prototype.drawItem = function (item, highlightItem) {
        if (highlightItem === void 0) { highlightItem = false; }
        for (var key in item.randomPattern) {
            // this.canvas.drawCircle(item.center, this.size, false);
            if (item.randomPattern[key] == 1) {
                var offsetPoint = this.getPointWithOffset(item.center, Number(key), false);
                var color = highlightItem || item.isMain ? 'red' : 'black';
                this.canvas.drawLine(item.center, offsetPoint, color);
            }
        }
        this.canvas.drawCircle(item.center, 3, true);
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
        var e_5, _a;
        try {
            for (var _b = __values(this.items.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                // (x – a)^2 + (y – b)^2 ≤ r^2, (a,b) center of circle, r - radius
                if (Math.pow(point.x - item.center.x, 2) + Math.pow(point.y - item.center.y, 2) <= Math.pow(this.size, 2)) {
                    return item;
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
    Layout.prototype.turnItem = function (item, shift, direction) {
        item.randomPattern = this.shift(item.randomPattern, shift, direction);
        this.draw();
    };
    Layout.prototype.buildLevel = function (currentItem, currentLevel) {
        currentLevel++;
        if (currentLevel > this.levelCount) {
            return;
        }
        // Run through all angles to build neighbors.
        for (var x = 0; x < Layout.anglesCount; x++) {
            var center = this.getPointWithOffset(currentItem.center, x);
            var neighbor = this.addItem(center);
            this.buildLevel(neighbor, currentLevel);
        }
    };
    Layout.prototype.shift = function (list, shift, direction) {
        for (var i = 0; i < shift; i++) {
            if (direction == Layout.left) {
                var item = list.pop();
                list.unshift(item);
            }
            else {
                var item = list.shift();
                list.push(item);
            }
        }
        return list;
    };
    Layout.prototype.getPointWithOffset = function (point, angle, isCenter) {
        if (isCenter === void 0) { isCenter = true; }
        // We keep only 2 decimal number precision.
        var devider = isCenter ? 1 : 2;
        return new Point(+((point.x + this.size * this.orientation.getOffsetX(angle) / devider).toFixed(2)), +((point.y + this.size * this.orientation.getOffsetY(angle) / devider).toFixed(2)));
    };
    Layout.prototype.addNeighbors = function () {
        var e_6, _a;
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
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
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
            switch (event.button) {
                case 0:
                    this.turnItem(item, 1, Layout.left);
                    break;
            }
        }
    };
    Layout.prototype.shuffle = function (array) {
        var copy = [];
        var n = array.length, i;
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
    };
    Layout.left = 'left';
    Layout.right = 'right';
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
    function Item(center, isMain) {
        if (isMain === void 0) { isMain = false; }
        this.center = center;
        this.isMain = isMain;
        this.neighbors = new Map();
        this.pattern = [0, 0, 0, 0, 0, 0];
        this.randomPattern = [0, 0, 0, 0, 0, 0];
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
    Canvas.prototype.drawCircle = function (point, radius, fill, color) {
        if (fill === void 0) { fill = false; }
        if (color === void 0) { color = 'grey'; }
        this.context.beginPath();
        this.context.fillStyle = color;
        // this.context.strokeStyle = 'green';
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        if (fill) {
            this.context.fill();
        }
        this.context.lineWidth = 0;
        this.context.stroke();
    };
    Canvas.prototype.drawLine = function (start, end, color) {
        if (color === void 0) { color = 'black'; }
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
    };
    Canvas.prototype.clear = function () {
        var gradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, "#e8e6df");
        gradient.addColorStop(0.5, "#e6e1d3");
        gradient.addColorStop(1, "#e8e6df");
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
var layout = new Layout(20, 5, Orientation.pointy);
