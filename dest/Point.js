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
export { Point };
