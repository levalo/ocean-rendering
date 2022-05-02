import { vec2 } from "gl-matrix";
import REGL from "regl";
import { Application } from "../Application";
import { log2OfPow2 } from "../helpers/math";

interface Boundary {
    default: REGL.Elements,
    top: REGL.Elements,
    left: REGL.Elements,
    right: REGL.Elements,
    bot: REGL.Elements
}

export interface QuadBlock {
    level: number;
    levelSize: number;
    top: number;
    left: number;
    bot: number;
    right: number;
    boundary: Boundary;
    active: REGL.Elements;
    center: { x: number, y: number };
    distance: number;
}

function createBoundary(N: number, size: number, top: number, left: number, wireframe: boolean) {
    const a0 = ((top * size) * (N + 1)) + (left * size);
    const a1 = a0 + size;
    const a2 = a0 + (size * (N + 1));
    const a3 = a2 + size;

    const elements: number[] = wireframe ? [
        a0, a1, a1, a2, a2, a0, a3, a2, a2, a1, a1, a3
    ] : [
        a0, a1, a2, a3, a2, a1
    ];

    return Application.regl.elements({
        data: new Uint32Array(elements),
        count: elements.length,
        primitive: wireframe ? 'lines' : 'triangles'
    });
}

function createLeftBoundary(N: number, size: number, top: number, left: number, wireframe: boolean) {
    const a0 = ((top * size) * (N + 1)) + (left * size);
    const a1 = a0 + size;
    const a2 = a0 + ((size / 2) * (N + 1));
    const a3 = a0 + (size * (N + 1));
    const a4 = a3 + size;

    const elements: number[] = wireframe ? [
        a0, a1, a1, a2, a2, a0, a2, a1, a1, a3, a3, a2, a4, a3, a3, a1, a1, a4
    ] : [
        a0, a1, a2, a2, a1, a3, a4, a3, a1
    ];

    return Application.regl.elements({
        data: new Uint32Array(elements),
        count: elements.length,
        primitive: wireframe ? 'lines' : 'triangles'
    });
}

function createTopBoundary(N: number, size: number, top: number, left: number, wireframe: boolean) {
    const a0 = ((top * size) * (N + 1)) + (left * size);
    const a1 = a0 + size / 2;
    const a2 = a0 + size;
    const a3 = a0 + (size * (N + 1));
    const a4 = a3 + size;

    const elements: number[] = wireframe ? [
        a0, a1, a1, a3, a3, a0, a1, a2, a2, a3, a3, a1, a3, a2, a2, a4, a4, a3
    ] : [
        a0, a1, a3, a1, a2, a3, a3, a2, a4
    ];

    return Application.regl.elements({
        data: new Uint32Array(elements),
        count: elements.length,
        primitive: wireframe ? 'lines' : 'triangles'
    });
}

function createBotBoundary(N: number, size: number, top: number, left: number, wireframe: boolean) {
    const a0 = ((top * size) * (N + 1)) + (left * size);
    const a1 = a0 + size;
    const a2 = a0 + (size * (N + 1));
    const a3 = a2 + (size / 2);
    const a4 = a2 + size;

    const elements: number[] = wireframe ? [
        a0, a1, a1, a2, a2, a0, a2, a1, a1, a3, a3, a2, a3, a1, a1, a4, a4, a3
    ] : [
        a0, a1, a2, a2, a1, a3, a3, a1, a4
    ];

    return Application.regl.elements({
        data: new Uint32Array(elements),
        count: elements.length,
        primitive: wireframe ? 'lines' : 'triangles'
    });
}

function createRightBoundary(N: number, size: number, top: number, left: number, wireframe: boolean) {
    const a0 = ((top * size) * (N + 1)) + (left * size);
    const a1 = a0 + size;
    const a2 = a0 + ((size / 2) * (N + 1));
    const a3 = a0 + (size * (N + 1));
    const a4 = a3 + size;
    const a5 = a2 + size;

    const elements: number[] = wireframe ? [
        a0, a1, a1, a3, a3, a0, a3, a1, a1, a5, a5, a3, a3, a5, a5, a4, a4, a3
    ] : [
        a0, a1, a3, a3, a1, a5, a3, a5, a4
    ];

    return Application.regl.elements({
        data: new Uint32Array(elements),
        count: elements.length,
        primitive: wireframe ? 'lines' : 'triangles'
    });
}

export class QuadTree {

    public constructor(
        public N: number,
        public position: { x: number, y: number },
        public addition: number,
        public levels: number,
    ) {
        this.numLODs = log2OfPow2(N);
        this.minLOD = Math.max(this.numLODs - levels, 0);
        this.wireframe = false;

        this._vertices = this.createVertices();

        this._positions = Application.regl.buffer(this._vertices);

        this.initTree();

        this.refresh();
    }

    private createVertices() {
        let vData = [];
        
        for (let x = -1 * (this.N / 2); x <= this.N / 2; x++) {
            for (let y = -1 * (this.N / 2); y <= this.N / 2; y++) {
                vData.push([x, y]);
            }
        }

        return vData;
    }

    public refresh() {
        this._activeQuads = [];
        this._visibleQuads = [];

        this.walkTree();
        this.cullQuads();
    }

    public cullQuads() {
        this._visibleQuads = this._activeQuads.filter(x => this.isVisible(x));
    }

    public walkTree(root: QuadBlock = this._blocks[this._blocks.length - 1]) {
        if (this.contain(root, this.position) || this.isNeighbor(root, this.position) || root.level < this.minLOD) {
            const childs = this.children(root);
    
            if (childs.length) {
                childs.forEach((x) => this.walkTree(x));

                return;
            }
        }
    
        const side = this.getSideBoundary(root, this.position);
    
        root.active = root.boundary[side as keyof Boundary];
    
        this._activeQuads.push(root);
    }

    public isVisible(block: QuadBlock) {
        return vec2.angle([ block.center.x, block.center.y ], Application.camera.viewVector) <= Math.PI * 0.5;
    }

    public isSideBoundary(block: QuadBlock, p: { x: number, y: number }) {
        const parentLevelSize = (block.levelSize << 1) + (this.addition * (this.numLODs - block.level));
        const pos = this.getPositionAtLevel(block.levelSize, p);
    
        return (Math.abs(block.top - pos.y) <= parentLevelSize && Math.abs(block.left - pos.x) <= parentLevelSize);
    }

    public getSideBoundary(block: QuadBlock, p: { x: number, y: number }) {
        const pos = this.getPositionAtLevel(block.levelSize, p);
        const dLeft = block.left - pos.x;
        const dTop = block.top - pos.y;
    
        let result = 'default';
    
        if (!this.isSideBoundary(block, p)) {
            return result;
        }
    
        if (block.top == pos.y) {
            result = dLeft > 0 ? 'top' : 'bot';
        }
        else if (block.left == pos.x) {
            result = dTop > 0 ? 'left' : 'right';
        }
        else if (Math.abs(dTop) > Math.abs(dLeft)) {
            result = dTop > 0 ? 'left' : 'right';
        }
        else if (Math.abs(dTop) < Math.abs(dLeft)) {
            result = dLeft > 0 ? 'top' : 'bot';
        }
    
        return result;
    }

    public getPositionAtLevel(levelSize: number, p: { x: number, y: number }) {
        return { y: Math.floor(p.y / levelSize) * levelSize, x: Math.floor(p.x / levelSize) * levelSize };
    }

    public isNeighbor(block: QuadBlock, p: { x: number, y: number }) {
        const pos = this.getPositionAtLevel(block.levelSize, p);
        const levelSize = block.levelSize + (this.addition * (this.numLODs - block.level));
        
        return (Math.abs(block.top - pos.y) <= levelSize && 
            Math.abs(block.left - pos.x) <= levelSize);
    }

    public contain(block: QuadBlock, p: { x: number, y: number }) {
        return block.top <= (p.y + this.addition) && block.left <= (p.x + this.addition) && block.bot > (p.y - this.addition) && block.right > (p.x - this.addition);
    }

    public children(block: QuadBlock) {
        return this._blocks.filter(x => x.level === (block.level + 1) &&
            x.top >= block.top && x.left >= block.left && x.bot <= block.bot && x.right <= block.right);
    }

    private initTree() {
        for (let i = this.numLODs; i >= 0; --i) {
            const levelSize = this.N >> i;
            const n = this.N / levelSize;
        
            for(let x = 0; x < n; x++) {
                for(let y = 0; y < n; y++) {
                    const defaultMesh = createBoundary(this.N, levelSize, y, x, this.wireframe);
    
                    const iY = y * levelSize;
                    const iX = x * levelSize;
    
                    const vX = this._vertices[iY * (this.N + 1) + iX][0];
                    const vY = this._vertices[iY * (this.N + 1) + iX][1];
    
                    const quad: QuadBlock = {
                        top: vY,
                        left: vX,
                        bot: vY + levelSize,
                        right: vX + levelSize,
                        level: i,
                        levelSize: levelSize,
                        active: defaultMesh,
                        boundary: { 
                            default: defaultMesh,
                            left: defaultMesh,
                            top: defaultMesh,
                            bot: defaultMesh,
                            right: defaultMesh 
                        },
                        center: { x: vX + (levelSize / 2), y: vY + (levelSize / 2) },
                        distance: 0,
                    };

                    quad.distance = Math.sqrt(Math.pow(quad.center.x - this.position.x, 2) + Math.pow(quad.center.y - this.position.y, 2));
    
                    if (i < this.numLODs && i > 0) {
                        quad.boundary.left = createLeftBoundary(this.N, levelSize, y, x, this.wireframe);

                        quad.boundary.top = createTopBoundary(this.N, levelSize, y, x, this.wireframe);

                        quad.boundary.bot = createBotBoundary(this.N, levelSize, y, x, this.wireframe);

                        quad.boundary.right = createRightBoundary(this.N, levelSize, y, x, this.wireframe);
                    }
        
                    this._blocks.push(quad);
                }
            }
        }
    }

    public get visibleQuads() {
        return this._visibleQuads;
    }

    public get positions() {
        return this._positions;
    }

    public numLODs: number;
    public minLOD: number;
    public wireframe: boolean;

    private _blocks: QuadBlock[] = [];
    private _activeQuads: QuadBlock[] = [];
    private _visibleQuads: QuadBlock[] = [];

    private _vertices: number[][];

    private _positions: REGL.Buffer;
}