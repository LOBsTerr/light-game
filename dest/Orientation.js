/**
 * Class handles offset coordinates based on orientation.
 */
var Orientation = /** @class */ (function () {
    function Orientation(orientation) {
        if (orientation === void 0) { orientation = Orientation.flat; }
        this.orientation = orientation;
        this.offsets = new Map();
        var sqrtOfThree = Math.sqrt(3);
        if (this.orientation == Orientation.flat) {
            this.offsets.set(0, new OffsetValue(-2, 0));
            this.offsets.set(1, new OffsetValue(-1, -sqrtOfThree));
            this.offsets.set(2, new OffsetValue(1, -sqrtOfThree));
            this.offsets.set(3, new OffsetValue(2, 0));
            this.offsets.set(4, new OffsetValue(1, sqrtOfThree));
            this.offsets.set(5, new OffsetValue(-1, sqrtOfThree));
        }
        else {
            this.offsets.set(0, new OffsetValue(0, -2));
            this.offsets.set(1, new OffsetValue(sqrtOfThree, -1));
            this.offsets.set(2, new OffsetValue(sqrtOfThree, 1));
            this.offsets.set(3, new OffsetValue(0, 2));
            this.offsets.set(4, new OffsetValue(-sqrtOfThree, 1));
            this.offsets.set(5, new OffsetValue(-sqrtOfThree, -1));
        }
    }
    /**
     * Get x offset for the given angle.
     *
     * @param angle
     *   Given angle.
     *
     * @returns
     *   Return x coordinate.
     */
    Orientation.prototype.getOffsetX = function (angle) {
        var _a;
        return ((_a = this.offsets.get(angle)) === null || _a === void 0 ? void 0 : _a.x) || 0;
    };
    /**
     * Get y offset for the given angle.
     *
     * @param angle
     *   Given angle.
     *
     * @returns
     *   Return y coordinate.
     */
    Orientation.prototype.getOffsetY = function (angle) {
        var _a;
        return ((_a = this.offsets.get(angle)) === null || _a === void 0 ? void 0 : _a.y) || 0;
    };
    Orientation.flat = 'flat';
    Orientation.pointy = 'pointy';
    return Orientation;
}());
export { Orientation };
/**
 * Offset class keeps x and y offset.
 */
var OffsetValue = /** @class */ (function () {
    function OffsetValue(x, y) {
        this.x = x;
        this.y = y;
    }
    return OffsetValue;
}());
