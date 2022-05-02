import { Application } from "../../Application";
import { Cube } from "../resources/Cube";

export const SimulateSky = Application.regl({
    framebuffer: Application.regl.prop('output' as never),
    frag: `
        precision mediump float;

        uniform float time;
        uniform samplerCube skymap;

        varying vec3 vUV;
        varying vec3 vPos;
        varying vec3 vHorizont;

        const vec3 sunPos = vec3(0, 0, -1);

        const vec3 skyColor = vec3(0.52, 0.80, 0.92);
        const vec3 sunColor = vec3(0.94, 0.85, 0.64);
        
        void main() {
            vec3 uv = normalize(vUV);
            vec3 horizont = normalize(vHorizont);
            vec3 pos = normalize(vPos);

            float atmosphere = dot(vec3(0, 1.0, 0), pos);
            float angle = dot(horizont, sunPos);
            float nAngle = -1.0 * min(0.0, angle);
            float pAngle = max(0.0, angle);

            float sunSize = 0.05;

            float distanceToSun = (1.0 / distance(uv, sunPos));
            
            vec3 texColor = textureCube(skymap, uv).rgb;
            vec3 color = ((skyColor * pAngle) + (texColor * nAngle * atmosphere)) + (sunColor * distanceToSun * sunSize);
            vec3 result = mix(vec3(1.0 * pAngle), color, atmosphere + 0.5);

            gl_FragColor = vec4(result, 1.0);
        }
    `,
    vert: `
        precision mediump float;

        attribute vec3 position;
        
        uniform float time;

        uniform mat4 look;
        
        varying vec3 vUV;
        varying vec3 vPos;

        varying vec3 vHorizont;
        
        void main() {
            vec3 rotated = position;
            float t = time * 0.01;

            float ct = cos(t);
            float st = sin(t);

            rotated.y = position.y * ct - position.z * st;
            rotated.z = position.y * st + position.z * ct;

            vHorizont = vec3(0, -1.0 * ct, -1.0 * st);

            vUV = position;
            vPos = rotated;
            gl_Position = look * vec4(rotated, 1);
        }
    `,
    attributes: {
        position: Cube.position
    },
    elements: Cube.elements,
    uniforms: {
        look: Application.regl.prop('look' as never),
        skymap: Application.regl.prop('skymap' as never),
        time: Application.regl.prop('time' as never)
    },
    depth: {
        enable: false
    }
});