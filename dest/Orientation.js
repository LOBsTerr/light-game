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
export { Orientation };
var OffsetValue = /** @class */ (function () {
    function OffsetValue(x, y) {
        this.x = x;
        this.y = y;
    }
    return OffsetValue;
}());
