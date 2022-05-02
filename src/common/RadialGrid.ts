import { vec2 } from "gl-matrix";
import REGL, { Regl } from "regl";
import { Application } from "../Application";

interface Ray {
    direction: vec2,
    visible: boolean,
    buffer: REGL.Elements
}

export class RadialGrid {

    public constructor(
        public radius: number,
        public levels: number,
        public details: number
    ) {

        this._vertices = Application.regl.buffer(this.createVertices(radius, levels, details));
        
        this._rays = this.createRays(levels, details);

        this.cullRays();
    }

    public cullRays() {
        this._visibles = this._rays.filter(x => vec2.angle(x.direction, Application.camera.viewVector) <= Math.PI * 0.5);
    }
    
    private createVertices(radius: number, levels: number, details: number) {
        const data = [];
        
        data.push(0, 0);
    
        for (let i = 1; i <= levels; i++) {
            const c = i / levels;
            const r = radius * ((i * c) / levels);
            const step = (2 * Math.PI) / details;
    
            for (let j = 0; j < 2 * Math.PI; j += step) {
                data.push(Math.cos(j) * r, Math.sin(j) * r)
            }
        }
    
        return data;
    }

    private createRays(levels: number, details: number) {
        const rayIndices: number[][] = Array(details).fill([]);
    
        for (let i = 0; i < levels; i++) {
            if (i === 0) {
                for (let j = 0; j < details; j++) {
                    if (j === 0) rayIndices[j].push(0, details, 1);
                    else rayIndices[j].push(0, j, j + 1);
                }
            }
            else {
                for (let j = 0; j < details; j++) {
                    const l = i * details;
                    const e = (i + 1) * details;
    
                    if (j === 0) rayIndices[j].push(l, e, l + 1, l, l + 1, l - details + 1);
                    else rayIndices[j].push(l - details + j, l + j, l + j + 1, l - details + j, l + j + 1, l - details + j + 1);
                }
            }
        }

        const rays: Ray[] = Array(details).fill(null).map((x, i) => ({ 
            direction: vec2.fromValues(Math.cos(((2 * Math.PI) / details) * i), Math.sin(((2 * Math.PI) / details) * i)),
            visible: false,
            buffer: Application.regl.elements({
                data: rayIndices[i],
                count: rayIndices[i].length / 3
            })
        }));
    
        return rays;
    }

    public get vertices() {
        return this._vertices;
    }

    public get visibles() {
        return this._visibles;
    }
    
    private _rays: Ray[];
    private _visibles: Ray[] = [];
    private _vertices: REGL.Buffer;
}