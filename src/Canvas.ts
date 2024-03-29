import { Point } from "./Point";

/**
 * Canvas class handles operation with HTML canvas.
 */
export class Canvas {

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public i: number = 0;

    constructor() {

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (this.canvas == null) {
            throw new Error("Canvas is not found");
        }

        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        const dpr = window.devicePixelRatio;
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
    public circle(point: Point, radius: number, fill: boolean = false, color: string = 'grey'): void {
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        if (fill) {
            this.context.fill();
        }
        this.context.lineWidth = 0;
        this.context.stroke();
    }

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
    public line(start: Point, end: Point, color: string = 'black'): void {
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
    }

    /**
     * Clean the canvas and redraw background.
     */
    public clear(): void {
        const gradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, "#e8e6df");
        gradient.addColorStop(0.5, "#e6e1d3");
        gradient.addColorStop(1, "#e8e6df");

        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

}