class PoseData {
    num: number;
    time: number;
    markerId: string;
    r1: number;
    r2: number;
    r3: number;
    x: number;
    y: number;
    z: number;

    constructor(num: number, time: number, markerId: string, r1: number, r2: number, r3: number, x: number, y: number, z: number) {
        this.num = num;
        this.time = time;
        this.markerId = markerId;
        this.r1 = r1;
        this.r2 = r2;
        this.r3 = r3;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}