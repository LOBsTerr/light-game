/**
 * Class handles offset coordinates based on orientation.
 */
export class Orientation {
    static readonly flat = 'flat';
    static readonly pointy = 'pointy';

    protected offsets: Map<number, OffsetValue> = new Map();

    constructor(public orientation: string = Orientation.flat) {
        let sqrtOfThree = Math.sqrt(3);
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
    public getOffsetX(angle: number) {
        return this.offsets.get(angle)?.x || 0;
    }

    /**
     * Get y offset for the given angle.
     *
     * @param angle
     *   Given angle.
     *
     * @returns 
     *   Return y coordinate.
     */
    public getOffsetY(angle: number) {
        return this.offsets.get(angle)?.y || 0;
    }

}

/**
 * Offset class keeps x and y offset.
 */
class OffsetValue {
    constructor(public x: number, public y: number) {}
}