import { vec3, mat4, vec2, ReadonlyVec3 } from "gl-matrix";
import { degreeToRadian } from "../helpers/math";

export class Camera {
    public target: vec3 | number[] = vec3.create();
    public distance: number = 0;
    public height: number = 0;
    public angleX: number = 0;
    public angleY: number = 0;

    public constructor(
        public canvas: HTMLCanvasElement,
        private zNear: number = 0,
        private zFar: number = 0,
        private fov: number = 0
    ) {
        this.update();
    }

    public static createDefaultCamera(canvas: HTMLCanvasElement, zNear: number, zFar: number, fov: number) {
        const cam = new Camera(canvas, zNear, zFar, fov);
        
        cam.target = [0, 1, 0];
        cam.distance = -1;
        cam.height = 0;
        cam.angleX = 0;
        cam.angleY = 0;

        document.onmousedown = (event: MouseEvent): void => {
            document.onmousemove = (event: MouseEvent): void => {
                const angleX = cam.angleX - event.movementY;
                const angleY = cam.angleY - event.movementX;
        
                if (angleX < 0) {
                    cam.angleX = Math.max(angleX, -80);
                }
                else {
                    cam.angleX = Math.min(angleX, 80);
                }
        
                cam.angleY = angleY < 360 ? angleY : 0;

                cam.update();
            }
        }
        
        document.onmouseup = (event: MouseEvent): void => {
            document.onmousemove = null;
        }
        
        document.onwheel = (event: WheelEvent): void => {
            cam.distance += event.deltaY * 0.01;
        
            cam.update();
        }
        
        document.onkeydown = (event: KeyboardEvent): void => {
            if (event.code === 'ArrowUp') {
                cam.target[2] += 0.05;
            }
            else if (event.code === 'ArrowDown') {
                cam.target[2] -= 0.05;
            }
            else if (event.code === 'ArrowLeft') {
                cam.target[0] += 0.05;
            }
            else if (event.code === 'ArrowRight') {
                cam.target[0] -= 0.05;
            }
        
            cam.update();
        }

        document.onresize = (event: UIEvent): void => {
            cam.update();
        }

        cam.update();

        return cam;
    }

    public get projection(): mat4 {
        return this._projection;
    }

    public get view(): mat4 {
        return this._view;
    }

    public get viewProjection(): mat4 {
        return this._viewProjection;
    }

    public get lookProjection(): mat4 {
        return this._lookProjection;
    }

    public get iLookProjection(): mat4 {
        return this._iLookProjection;
    }

    public get look(): mat4 {
        return this._look;
    }

    public get viewVector(): vec2 {
        return this._viewVector;
    }

    public get position(): vec3 {
        return this._position;
    }

    public update(): void {
        // compute aspect
        this._aspect = this.canvas.width / this.canvas.height;

        // compute projection
        this._projection = this.computeProjection();
        // compute view
        this._view = this.computeView();

        // compute projection * view
        mat4.multiply(this._viewProjection, this._projection, this._view);

        // get look matrix from view
        const l = mat4.clone(this._view);
        l[12] = 0;
        l[13] = 0;
        l[14] = 0;
        l[15] = 1;

        this._look = l;

        // compute projection * look
        mat4.multiply(this._lookProjection, this._projection, this._look);

        // compute inverted lookProjection
        mat4.invert(this._iLookProjection, this._lookProjection);

        // get look direction
        const viewVector = vec2.create();
        vec2.rotate(viewVector, vec2.fromValues(0, -1), vec2.fromValues(0, 0), -1 * degreeToRadian(this.angleY));
        // check if camera wos rotated
        if (!vec2.equals(viewVector, this._viewVector)) {
            this.viewVectorChanged = true;

            this._viewVector = viewVector;
        }
        else {
            this.viewVectorChanged = false;
        }
        
        // notify listeners
        this._changeListeners.forEach(x => x());
    }

    public subscribeOnChange(listener: () => void): number {
        return this._changeListeners.push(listener) - 1;
    }

    private computeView(): mat4 {
        const viewMatrix = mat4.create();
        const target = this.target as ReadonlyVec3;

        
        vec3.subtract(this._position, target, [ 0, this.height, this.distance]);
        vec3.rotateX(this._position, this._position, target, degreeToRadian(this.angleX));
        vec3.rotateY(this._position, this._position, target, degreeToRadian(this.angleY));
        
        mat4.lookAt(viewMatrix, this._position, target, [0, 1, 0]);

        return viewMatrix;
    }

    private computeProjection(): mat4 {
        const res = mat4.create();
    
        mat4.perspective(res, degreeToRadian(this.fov), this._aspect, this.zNear, this.zFar);
    
        return res;
    }

    private _aspect: number = 0;

    private _iLookProjection: mat4 = mat4.create();
    private _viewProjection: mat4 = mat4.create();
    private _lookProjection: mat4 = mat4.create();
    private _changeListeners: Array<() => void> = [];
    private _look: mat4 = mat4.create();
    private _view: mat4 = mat4.create();
    private _projection: mat4 = mat4.create();
    private _position: vec3 = vec3.create();
    private _viewVector: vec2 = vec2.create();

    public viewVectorChanged: boolean = false;
}