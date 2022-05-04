import { Application } from "../../Application";
import { Cube } from "../resources/Cube";

export const SimulateSky = Application.regl({
    framebuffer: Application.regl.prop('output' as never),
    frag: `
        precision mediump float;

        uniform vec3 sunPosition;
        uniform samplerCube skymap;

        uniform vec3 skyColor;
        uniform vec3 sunColor;

        varying vec3 vUV;
        varying vec3 vPosition;
        
        void main() {
            vec3 uv = normalize(vUV);
            vec3 pos = normalize(vPosition);

            float atmosphere = dot(vec3(0, 1.0, 0), pos);
            float angle = dot(vec3(0, -1.0, 0), sunPosition);
            float nAngle = -1.0 * min(0.0, angle);
            float pAngle = max(0.0, angle);

            float sunSize = 0.05;

            float distanceToSun = (1.0 / distance(pos, -sunPosition));
            
            vec3 texColor = textureCube(skymap, uv).rgb;
            vec3 color = ((skyColor * pAngle) + (texColor * nAngle * atmosphere)) + (sunColor * distanceToSun * sunSize);
            vec3 result = mix(vec3(1.0 * pAngle), color, atmosphere + 0.5);

            gl_FragColor = vec4(result, 1.0);
        }
    `,
    vert: `
        precision mediump float;

        attribute vec3 position;
        
        uniform vec3 sunPosition;

        uniform mat4 look;
        
        varying vec3 vUV;
        varying vec3 vPosition;
        
        void main() {
            vPosition = position;

            vUV = position;

            vUV.y = position.y * sunPosition.z - position.z * sunPosition.y;
            vUV.z = position.y * sunPosition.y + position.z * sunPosition.z;

            gl_Position = look * vec4(position, 1);
        }
    `,
    attributes: {
        position: Cube.position
    },
    elements: Cube.elements,
    uniforms: {
        look: Application.regl.prop('look' as never),
        skymap: Application.regl.prop('skymap' as never),
        sunPosition: Application.regl.prop('sunPosition' as never),
        sunColor: Application.regl.prop('sunColor' as never),
        skyColor: Application.regl.prop('skyColor' as never)
    },
    depth: {
        enable: false
    }
});