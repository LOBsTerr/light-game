/**
 * Canvas class handles operation with HTML canvas.
 */
var Canvas = /** @class */ (function () {
    function Canvas() {
        this.i = 0;
        this.canvas = document.getElementById("canvas");
        if (this.canvas == null) {
            throw new Error("Canvas is not found");
        }
        this.context = this.canvas.getContext("2d");
        var dpr = window.devicePixelRatio;
        this.canvas.width = 1000;
        this.canvas.height = 700;
        this.context.scale(dpr, dpr);
    }
    /**
     * Draw the circle in a specific point.
     *
     * @param point
     *   Center of the circle.
     * @param radius
     *   Radius of the circle.
     * @param fill
     *   Fill the circle with color.
     * @param color
     *   Color.
     */
    Canvas.prototype.circle = function (point, radius, fill, color) {
        if (fill === void 0) { fill = false; }
        if (color === void 0) { color = 'grey'; }
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        if (fill) {
            this.context.fill();
        }
        this.context.lineWidth = 0;
        this.context.stroke();
    };
    /**
     * Draw line from point to point.
     *
     * @param start
     *   Starting point.
     * @param end
     *   Ending point.
     * @param color
     *   Color.
     */
    Canvas.prototype.line = function (start, end, color) {
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
    /**
     * Clean the canvas and redraw background.
     */
    Canvas.prototype.clear = function () {
        var gradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, "#e8e6df");
        gradient.addColorStop(0.5, "#e6e1d3");
        gradient.addColorStop(1, "#e8e6df");
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return Canvas;
}());
export { Canvas };
