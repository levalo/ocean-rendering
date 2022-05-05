import { vec3 } from "gl-matrix";
import REGL from "regl";
import { Application } from "../Application";
import { loadImage } from "../helpers/image";

export class Sky {

    constructor() {
        this._initial = Application.regl.cube(6);

        this.loadCubemap();
    }

    private async loadCubemap() {
        const right = await loadImage('images/right.jpg');
        const left = await loadImage('images/left.jpg');
        const top = await loadImage('images/top.jpg');
        const bottom = await loadImage('images/bottom.jpg');
        const front = await loadImage('images/front.jpg');
        const back = await loadImage('images/back.jpg');

        this._initial(right, left, top, bottom, back, front);
    }

    public update(t: number) {
        const angle = t * 0.01;

        const ct = Math.cos(angle);
        const st = Math.sin(angle);

        this._sunPosition[1] = -1.0 * st; // x * c - y * s
        this._sunPosition[2] = 1.0 * ct; // x * s + y * c
        
        vec3.lerp(this._lightColor, this._sunColor, this._skyColor, Math.abs(this._sunPosition[1] * -0.5));

        this.i += 1;
    }

    public get initialTexture() {
        return this._initial;
    }

    public get sunPosition() {
        return this._sunPosition;
    }

    public get skyColor() {
        return this._skyColor;
    }

    public get sunColor() {
        return this._sunColor;
    }

    public get lightColor() {
        return this._lightColor;
    }

    private i = 0;
    private _skyColor: vec3 = vec3.fromValues(0.52, 0.80, 0.92);
    private _sunColor: vec3 = vec3.fromValues(0.94, 0.85, 0.64);
    private _lightColor: vec3 = vec3.create();

    private _sunPosition: vec3 = vec3.fromValues(0.0, 0.0, 1.0);
    private _initial: REGL.TextureCube;
}