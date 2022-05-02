import { Application } from "../../Application";
import { Plane } from "../resources/Plane";

import planeVert from "../shaders/plane.vert";

export const DrawPicture = Application.regl({
    frag: `
        precision mediump float;

        uniform sampler2D picture;

        varying vec2 vUV;
        
        void main() {
            vec3 color = texture2D(picture, vUV).rgb;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
    vert: planeVert,
    attributes: {
        position: Plane.position
    },
    uniforms: {
        picture: Application.regl.prop('picture' as never)
    },
    elements: Plane.elements
});