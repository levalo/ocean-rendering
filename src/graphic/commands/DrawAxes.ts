import { Application } from "../../Application";
import { matMul } from "../../helpers/math";
import { Geometry } from "../Geometry";

const geometry = new Geometry();

export const DrawAxes = Application.regl({
    frag: `
        precision mediump float;

        varying vec4 vColor;
        
        void main() {
            gl_FragColor = vColor;
        }
    `,
    vert: `
        precision mediump float;

        attribute vec4 position;
        attribute vec3 color;
        
        uniform mat4 world;
        
        varying highp vec4 vColor;
        
        void main() {
            vColor = vec4(color.rgb, 1);
        
            gl_Position = world * position;
        }
    `,
    attributes: {
        position: Application.regl.buffer([
            [0,0,0,1,  1,  0,  0, 0],
            [0,0,0,1,  0,  1,  0, 0],
            [0,0,0,1,  0,  0,  1, 0],
            [0,0,0,1, -1,  0,  0, 0],
            [0,0,0,1,  0, -1,  0, 0],
            [0,0,0,1,  0,  0, -1, 0],
        ]),
        color: Application.regl.buffer([
            [1.0,0.0,0.0, 1.0,0.0,0.0], //x+ red
            [0.0,0.0,1.0, 0.0,0.0,1.0], //y+ blue
            [0.0,1.0,0.0, 0.0,1.0,0.0], //z+ green
            [0.5,0.2,0.2, 0.5,0.2,0.2], //x- darkred
            [0.2,0.2,0.5, 0.2,0.2,0.5], //y- darkblue
            [0.2,0.5,0.2, 0.2,0.5,0.2], //z- darkgreen
        ])
    },
    uniforms: {
        world: () => matMul(Application.camera.viewProjection, geometry.model)
    },
    count: 12,
    primitive: 'lines'
});