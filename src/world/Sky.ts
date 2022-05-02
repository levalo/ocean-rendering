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

    public get initialTexture() {
        return this._initial;
    }

    public get lightDirection() {
        return this._lightDirection;
    }

    private _lightDirection: vec3 = vec3.fromValues(0.0, 1.0, 1.0);
    private _initial: REGL.TextureCube;
}