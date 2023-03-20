export class Orientation {
    static readonly flat = 'flat';
    static readonly pointy = 'pointy';

    protected offsets: Map<number, OffsetValue> = new Map();

    constructor(public orientation: string = Orientation.flat) {
        let sqrtOfThree = Math.sqrt(3);
        if (this.isFlat()) {
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

    public getOffsetX(angle: number) {
        return this.offsets.get(angle)?.x || 0;
    }

    public getOffsetY(angle: number) {
        return this.offsets.get(angle)?.y || 0;
    }

    protected isFlat() {
        return this.orientation == Orientation.flat;
    }

}

class OffsetValue {
    constructor(public x: number, public y: number) {}
}