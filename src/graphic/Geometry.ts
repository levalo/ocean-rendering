import { vec3, mat4, quat, ReadonlyVec3 } from "gl-matrix";

export class Geometry {

    public constructor(
        public position: vec3 | number[] = [0, 0, 0], 
        public rotation: vec3 | number[] = [0, 0, 0], 
        public scale: vec3 | number[] = [1, 1, 1]
    ) {
        this._model = this.computeModel();
    }

    public update(): void {
        this._model = this.computeModel();
    }
    
    public get model(): mat4 {
        return this._model;
    }

    private computeModel(): mat4 {
        const modelViewMatrix   = mat4.create();
        const translate         = this.position;
        const rotationQuat      = quat.create();
        const rotationMatrix    = mat4.create();

        mat4.translate(modelViewMatrix, modelViewMatrix, translate as ReadonlyVec3);
        quat.fromEuler(rotationQuat, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.fromQuat(rotationMatrix, rotationQuat);
        mat4.multiply(modelViewMatrix, modelViewMatrix, rotationMatrix);
        mat4.scale(modelViewMatrix, modelViewMatrix, [this.scale[0], this.scale[1], this.scale[2]]);
        
        return modelViewMatrix;
    }

    private _model : mat4;
}