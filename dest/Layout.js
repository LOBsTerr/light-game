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
import { Point } from './Point';
import { Canvas } from './Canvas';
import { Item } from './Item';
import { Orientation } from './Orientation';
/**
 * Class builds and handles game layout
 */
var Layout = /** @class */ (function () {
    function Layout(size, levelCount, orientation) {
        if (levelCount === void 0) { levelCount = 1; }
        if (orientation === void 0) { orientation = Orientation.flat; }
        this.size = size;
        this.levelCount = levelCount;
        this.items = new Map();
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
    Layout.prototype.defineMouseListeners = function () {
        var _this = this;
        var onLeftClick = function (event) {
            _this.onLeftClick(event);
        };
        onLeftClick.bind(this);
        this.canvas.canvas.addEventListener('click', onLeftClick, false);
        var onRightClick = function (event) {
            _this.onRightClick(event);
        };
        onRightClick.bind(this);
        this.canvas.canvas.addEventListener('contextmenu', onRightClick, false);
    };
    /**
     * Build spanning tree randomly perform DFS.
     */
    Layout.prototype.buildTree = function () {
        // Randomly set the starting point.
        var keys = Array.from(this.items.keys());
        this.startItem = this.items.get(keys[this.getRandomValue(keys.length)]);
        this.startItem.isMain = true;
        // Recursive call to build tree for each neighbor.
        this.buildGraphItems(this.startItem);
        // After the correct tree is build, we can randomly mixed items.
        this.randomlyTurnItems();
    };
    /**
     * Randomly turn the current item.
     */
    Layout.prototype.randomlyTurnItems = function () {
        var e_1, _a;
        try {
            // Shift randomly pattern, based on this pattern an item will be turn on the specific angle.
            // One step shift give turn on 30%.
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
    /**
     * We recursivly check every item's neighbor and randomly build the tree for them.
     *
     * @param item
     *   Item to be processed.
     */
    Layout.prototype.buildGraphItems = function (item) {
        var e_2, _a;
        // We visited the item, skip it.
        if (this.visited.has(item)) {
            return;
        }
        this.visited.add(item);
        // We randoly shuffle neighbors.
        var neighborsKeys = this.shuffle(Array.from(item.neighbors.keys()));
        try {
            for (var neighborsKeys_1 = __values(neighborsKeys), neighborsKeys_1_1 = neighborsKeys_1.next(); !neighborsKeys_1_1.done; neighborsKeys_1_1 = neighborsKeys_1.next()) {
                var key = neighborsKeys_1_1.value;
                var neighbor = item.neighbors.get(key);
                if (!this.visited.has(neighbor)) {
                    // Set the pattern for the item based, on the neighbors we visited.
                    item.pattern[key] = 1;
                    // Set back pattern to neighbor based on connection between item and neighbor.
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
    /**
     * Recursively build active path from starting item.
     *
     * @param item
     *   Item to be processed.
     */
    Layout.prototype.buildActivePath = function (item) {
        var e_3, _a;
        // We visited the item, skip it.
        if (this.visited.has(item)) {
            return;
        }
        this.visited.add(item);
        try {
            for (var _b = __values(item.neighbors.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], neighbor = _d[1];
                // Check the connection between the current item and neighbor based on patter.
                if (this.hasConnectedItem(item, neighbor, key)) {
                    // Highlight item if it part of the active path.
                    this.renderItem(item, true);
                    this.buildActivePath(neighbor);
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
    Layout.prototype.hasConnectedItem = function (item, neighbor, angle) {
        if (item.randomPattern[angle] &&
            item.randomPattern[angle] == 1 &&
            neighbor.randomPattern[this.contreAngles[angle]] &&
            neighbor.randomPattern[this.contreAngles[angle]] == 1) {
            return true;
        }
        return false;
    };
    /**
     * Render the current state of the game.
     */
    Layout.prototype.render = function () {
        var e_4, _a;
        // Clear canvas before rerendering everything.
        this.canvas.clear();
        try {
            // Render every state of the item.
            for (var _b = __values(this.items.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                this.renderItem(item);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        // Rebuild active path.
        this.visited.clear();
        this.buildActivePath(this.startItem);
    };
    /**
     * Render the given item.
     *
     * @param item
     *   Item to be rendered.
     * @param highlightItem
     *   Is item highlighted.
     */
    Layout.prototype.renderItem = function (item, highlightItem) {
        if (highlightItem === void 0) { highlightItem = false; }
        for (var key in item.randomPattern) {
            // this.canvas.circle(item.center, this.size, false);
            if (item.randomPattern[key] == 1) {
                var offsetPoint = this.getPointWithOffset(item.center, Number(key), false);
                var color = highlightItem || item.isMain ? 'red' : 'black';
                this.canvas.line(item.center, offsetPoint, color);
            }
        }
        // Add small dot in the center of the item.
        this.canvas.circle(item.center, 3, true);
    };
    /**
     * Get random value between 0 and max.
     *
     * @param max
     *   Max value.
     *
     * @returns
     *   Random value.
     */
    Layout.prototype.getRandomValue = function (max) {
        return Math.floor(Math.random() * max);
    };
    /**
     * Build game leves.
     */
    Layout.prototype.buildLevels = function () {
        var item = new Item(this.center);
        this.items.set(item.center.json(), item);
        this.buildLevel(item, 1);
        this.addNeighbors();
    };
    /**
     * Get the item based on the coordinated on Canvas.
     *
     * @param point
     *   Point on the canvase.
     *
     * @returns
     *   Item or null.
     */
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
    /**
     * Add item for given point.
     *
     * @param point
     *   The center of the item.
     *
     * @returns
     *   Item.
     */
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
    Layout.prototype.turnItem = function (item, shift, direction) {
        item.randomPattern = this.shift(item.randomPattern, shift, direction);
        // After the turn we need rerender everything.
        this.render();
    };
    /**
     * Build recurssively the connection between items based on the level numbers.
     *
     * @param currentItem
     *   Item.
     * @param currentLevel
     *   Level.
     */
    Layout.prototype.buildLevel = function (currentItem, currentLevel) {
        currentLevel++;
        // We reached the given level, we can stop recurssion.
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
    Layout.prototype.getPointWithOffset = function (point, angle, isCenter) {
        if (isCenter === void 0) { isCenter = true; }
        // We keep only 2 decimal number precision.
        var devider = isCenter ? 1 : 2;
        return new Point(+((point.x + this.size * this.orientation.getOffsetX(angle) / devider).toFixed(2)), +((point.y + this.size * this.orientation.getOffsetY(angle) / devider).toFixed(2)));
    };
    /**
     * We need to set all possible connection between items to build a tree later.
     */
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
    /**
     * On left mouse button click handler.
     *
     * @param event
     *  Event.
     */
    Layout.prototype.onLeftClick = function (event) {
        var item = this.pointBelongCircle(this.getCanvasClickedPoint(event));
        if (item) {
            if (event.button == 0) {
                this.turnItem(item, 1, Layout.left);
            }
        }
    };
    /**
     * Get canvas coordinates based on clicked point on the screen.
     *
     * @param MouseEvent event
     *   Moust event.
     *
     * @returns
     *   Point on canvas where user clicked.
     */
    Layout.prototype.getCanvasClickedPoint = function (event) {
        var rect = this.canvas.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        return new Point(x, y);
    };
    /**
     * On right mouse button click handler.
     *
     * @param event
     *  Event.
     */
    Layout.prototype.onRightClick = function (event) {
        event.preventDefault();
        var item = this.pointBelongCircle(this.getCanvasClickedPoint(event));
        if (item) {
            if (event.button == 2) {
                this.turnItem(item, 1, Layout.right);
            }
        }
    };
    /**
     * Shuffle array items.
     *
     * @param array
     *   Given array.
     *
     * @returns
     *   Shufftled array.
     */
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
export { Layout };
