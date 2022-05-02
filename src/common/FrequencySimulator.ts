import { vec2 } from "gl-matrix";
import REGL from "regl";
import { Application } from "../Application";
import { SimulateFrequency } from "../graphic/commands/SimulateFrequency";

export class FrequencySimulator {
    public constructor(
        private _initialSpectrum: number[],
        private _size: number,
        private _G: number,
        private _mod: vec2
    ) {
        this._initialSpectrumTex = Application.regl.texture({
            width: _size,
            height: _size,
            data: _initialSpectrum,
            type: 'float',
            wrap: 'repeat'
        });

        this._outputFramebuffer = Application.regl.framebuffer({
            width: _size, 
            height: _size,
            colorType: 'float',
        });
    }

    public get output() {
        return this._outputFramebuffer;
    }

    public run(time: number) {
        SimulateFrequency({
            G: this._G,
            mod: this._mod,
            meshSize: this._size,
            distributionTex: this._initialSpectrumTex,
            time: time,
            output: this._outputFramebuffer
        });
    }
    
    private _outputFramebuffer: REGL.Framebuffer;
    private _initialSpectrumTex: REGL.Texture2D;
}