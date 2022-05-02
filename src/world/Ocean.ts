import { vec2, vec3 } from "gl-matrix";
import { alies, gauss } from "../helpers/math";
import { QuadTree } from "../common/QuadTree";
import { Geometry } from "../graphic/Geometry";
import { Application } from "../Application";

const DIST_X: number = 200.0;
const DIST_Z: number = 200.0;

const AMPLITUDE: number = 1.0;
const WIND_SPEED_X: number = 3.0;
const WIND_SPEED_Z: number = 1.0;

export const G: number = 9.81;

export class Ocean {
    public constructor(
        public meshSize: number,
        public lodSize: number
    ) {
        const windDir = vec2.fromValues(1.0, 1.0);

        const l = vec2.dot([WIND_SPEED_X, WIND_SPEED_Z],[WIND_SPEED_X, WIND_SPEED_Z]) / G;
        vec2.normalize(windDir, [WIND_SPEED_X, WIND_SPEED_Z]);

        const size = vec2.fromValues(DIST_X, DIST_Z);

        const mod = vec2.create();
        vec2.div(mod, [2.0 * Math.PI, 2.0 * Math.PI], size);

        this._mod = mod;

        const amplitude = AMPLITUDE * 0.3 / Math.sqrt(DIST_X * DIST_Z);

        this._amplitude = amplitude;

        this._distribution = this.generateDistribution(meshSize, mod, amplitude, windDir, l, 0.02);

        this._geometry = new Geometry([0, 0, 0], [0, 0, 0], [1,1,1]);

        this._quadTree = new QuadTree(lodSize, {x: 0, y: 0}, 16, 4);
        Application.camera.subscribeOnChange(this.updateQuadTree.bind(this));
        Application.camera.subscribeOnChange(this.moveLOD.bind(this));

        this._cameraPosition = vec3.fromValues(
            Application.camera.position[0], 
            Application.camera.position[1], 
            Application.camera.position[2]
        );

        this._geometry.position = [
            this._cameraPosition[0],
            0,
            this._cameraPosition[2]
        ];

        this._scale = Math.max(0.2, Math.abs(Math.floor(Application.camera.position[1])));

        // this._geometry.scale = [
        //     this._scale,
        //     this._scale,
        //     this._scale
        // ];

        this.geometry.update();
    }

    async updateQuadTree() {
        if (!Application.camera.viewVectorChanged) return;

        this.quadTree.cullQuads();
    }

    async moveLOD() {
        if (
            Math.abs(this._cameraPosition[0] - Application.camera.position[0]) < 1 &&
            Math.abs(this._cameraPosition[2] - Application.camera.position[2]) < 1
        ) return;

        this._cameraPosition = vec3.fromValues(
            Application.camera.position[0], 
            Application.camera.position[1], 
            Application.camera.position[2]
        );

        this._geometry.position = [
            Application.camera.position[0],
            0,
            Application.camera.position[2]
        ];

        this._scale = Math.max(0.2, Math.abs(Math.floor(Application.camera.position[1])));

        // this._geometry.scale = [
        //     this._scale, this._scale, this._scale
        // ];

        this.geometry.update();
    }

    public get visibleQuads() {
        return this.quadTree.visibleQuads;
    }

    private philips = (windDir: vec2, k: vec2, l: number, max_l: number): number => {
        let k_len = vec2.len(k);
    
        if (k_len == 0) {
            return 0;
        }
    
        let kL = k_len * l;
        let k_dir = vec2.create();
        vec2.normalize(k_dir, k);
    
        let kw = vec2.dot(k_dir, windDir);
    
        return Math.pow(kw * kw, 1.0) *
            Math.exp(-1.0 * k_len * k_len * max_l * max_l) *
            Math.exp(-1.0 / (kL * kL)) *
            Math.pow(k_len, -4.0);
    }

    private generateDistribution = (meshSize: number, mod: vec2, amplitude: number, windDir: vec2, l: number, max_l: number): Array<number> => {
        let distribution: Array<number> = [];
    
        for(let z = 0; z < meshSize; z++) {
            for(let x = 0; x < meshSize; x++) {
                let v = 4 * (z * meshSize + x);

                let k = vec2.fromValues(alies(x, meshSize), alies(z, meshSize));
                vec2.multiply(k, mod, k);
    
                const p = amplitude * Math.sqrt(0.5 * this.philips(windDir, k, l, max_l));
                let dist = [gauss(), gauss()];
    
                distribution[v] = dist[0] * p;
                distribution[v + 1] = dist[1] * p;
                distribution[v + 2] = 0;
                distribution[v + 3] = 0;
            }
        }
    
        return distribution;
    }

    private downsampleDistribution(distribution: number[], meshSize: number, size: number) {
        const displacement: Array<number> = [];

        for(let z = 0; z < size; z++) {
            for(let x = 0; x < size; x++) {
                const v = 4 * (z * size + x);

                let ax = alies(x, size);
                let az = alies(z, size);

                if (ax < 0) {
                    ax += meshSize;
                }

                if (az < 0) {
                    az += meshSize;
                }

                const i = 4 * (az * meshSize + ax);

                displacement[v] = distribution[i];
                displacement[v + 1] = distribution[i + 1];
                displacement[v + 2] = 0
                displacement[v + 3] = 0;
            }
        }

        return displacement;
    }

    public get distribution() {
        return this._distribution;
    }

    public get amplitude() {
        return this._amplitude;
    }

    public get mod() {
        return this._mod;
    }

    public get quadTree() {
        return this._quadTree;
    }

    public get geometry() {
        return this._geometry;
    }

    public get positions() {
        return this.quadTree.positions;
    }

    public get scale() {
        return this._scale;
    }

    private _amplitude: number;
    private _mod: vec2;
    private _distribution: number[];
    private _scale: number;

    private _quadTree: QuadTree;

    private _geometry: Geometry;

    private _cameraPosition: vec3;
}