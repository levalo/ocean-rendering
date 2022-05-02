import { mat4 } from "gl-matrix";

export const degreeToRadian = (degree: number): number => degree * Math.PI / 180;

export const isPowerOf2 = (value: number): boolean => (value & (value - 1)) == 0;

export const matMul = (a: mat4, b: mat4) => {
    const res = mat4.create();

    mat4.multiply(res, a, b);

    return res;
}

export const alies = (x: number, N: number): number => {
    if (x > N / 2) {
        x -= N;
    }

    return x;
}

export const gauss = (): number => {
	var u1 = Math.random();
    var u2 = Math.random();

    if (u1 < 1e-6)
    {
        u1 = 1e-6;
    }

    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export const log2OfPow2 = (x: number) => {
	let ret = 0;

	while (x >>= 1)
		++ret;

	return ret;
}