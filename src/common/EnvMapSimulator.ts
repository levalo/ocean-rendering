import { mat4, vec2, vec3 } from "gl-matrix";
import REGL from "regl";
import { Application } from "../Application";
import { SimulateFrequency } from "../graphic/commands/SimulateFrequency";

export class EnvMapSimulator {
    public constructor(
        private _command: REGL.DrawCommand<REGL.DefaultContext, {}>,
        private _size: number
    ) {
        this._output = Application.regl.framebufferCube({
            radius: 6,
            width: _size,
            height: _size,
            colorType: 'float',
        });

        this._projection = mat4.create();
    
        mat4.perspective(this._projection, Math.PI / 2, 1, 0.01, 200);

        this._faces = [
            { center: vec3.fromValues(1, 0, 0), up: vec3.fromValues(0, -1, 0), look: mat4.create() },
            { center: vec3.fromValues(-1, 0, 0), up: vec3.fromValues(0, -1, 0), look: mat4.create() },
            { center: vec3.fromValues(0, 1, 0), up: vec3.fromValues(0, 0, 1), look: mat4.create() },
            { center: vec3.fromValues(0, -1, 0), up: vec3.fromValues(0, 0, -1), look: mat4.create() },
            { center: vec3.fromValues(0, 0, 1), up: vec3.fromValues(0, -1, 0), look: mat4.create() },
            { center: vec3.fromValues(0, 0, -1), up: vec3.fromValues(0, -1, 0), look: mat4.create() },
        ];

        for(let i = 0; i < this._faces.length; i++) {
            this._faces[i].look = this.computePVM(this._faces[i].center, this._faces[i].up);
        }
    }

    public get output() {
        return this._output;
    }

    public run(props: {}) {
        for(let i = 0; i < this._faces.length; i++) {
            this._command({ output: this._output.faces[i], look: this._faces[i].look, ...props });
        }
    }

    private computePVM(center: vec3, up: vec3) {
        const look = mat4.create();
        const plm = mat4.create();

        mat4.lookAt(look, [0, 0, 0], center, up);

        mat4.multiply(plm, this._projection, look);

        return plm;
    }
    
    private _projection: mat4;
    private _faces: Array<{ center: vec3, up: vec3, look: mat4 }>;
    private _output: REGL.FramebufferCube;
}