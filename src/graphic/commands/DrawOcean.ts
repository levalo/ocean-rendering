import { Application } from "../../Application";

export const DrawOcean = Application.regl({
    frag: `
        precision mediump float;
        
        uniform samplerCube skyboxCubemap;

        uniform vec3 cameraPosition;

        uniform sampler2D heightTex;
        uniform vec3 sunPosition;
        uniform vec3 lightColor;

        varying vec4 vWorldPosition;
        varying vec2 vUV;
        varying mat3 vTBN;
        varying vec3 vSunWorldPosition;

        const vec3 color = vec3(0.0, 0.19, 0.27);

        void main() {
            float lightPower = max(0.3, -1.0 * sunPosition.y);
            float reflectionPower = max(0.3, 1.0 - lightPower);

            vec3 normal = normalize(texture2D(heightTex, vUV).rgb);
            normal = normalize(vTBN * normal);

            vec3 foam = mix(vec3(0.0), vec3(1.0), (vWorldPosition.y + normal.r) * 0.3);

            vec3 ambient = lightColor * lightPower;

            vec3 surfaceToLight = normalize(vSunWorldPosition - vWorldPosition.xyz);

            vec3 diff = max(dot(normal, surfaceToLight), 0.0) * lightColor;
            
            vec3 eyeToSurfaceDir = normalize(vWorldPosition.xyz - cameraPosition);
            vec3 direction = reflect(eyeToSurfaceDir, normal);

            vec3 reflection = textureCube(skyboxCubemap, direction).rgb * reflectionPower * lightColor;

            gl_FragColor = vec4((foam + color) * diff + reflection, 1.0);
        }
    `,
    vert: `
        precision mediump float;
        
        attribute vec2 position;
        
        uniform mat4 world;
        uniform mat4 model;

        uniform sampler2D heightTex;
        uniform vec3 sunPosition;

        uniform float scale;

        varying vec4 vWorldPosition;
        varying vec2 vUV;
        varying mat3 vTBN;
        varying vec3 vSunWorldPosition;

        const float wDelta = 1.0 / 128.0;
        const float delta = 1.0 / 8.0;

        float getWave(float x, float y) {
            vec2 h = texture2D(heightTex, vec2(x, y)).rg;

            return h.r + h.g;
        }
        
        void main() {
            vSunWorldPosition = (model * vec4(0.0, 128.0 * sunPosition.y, -128.0 * sunPosition.z, 1)).xyz;

            vWorldPosition = model * vec4(position.x, 0, position.y, 1);

            vUV = vWorldPosition.xz * delta;

            vec2 wUV = vWorldPosition.xz * wDelta;
            
            float wLH = getWave(wUV.x - wDelta, wUV.y);
            float wRH = getWave(wUV.x + wDelta, wUV.y);
            float wFH = getWave(wUV.x, wUV.y + wDelta);
            float wBH = getWave(wUV.x, wUV.y - wDelta);

            float wH = (wLH + wRH + wFH + wBH) / 4.0;

            vec2 wD = vec2(
                (wRH - wH) - (wLH - wH),
                (wFH - wH) - (wBH - wH)
            );

            float nw = -1.0 * getWave(-wUV.x, -wUV.y);
            
            vWorldPosition.y = wH;
            vWorldPosition.xz += wD;

            vec3 tangent = normalize(vec3(2.0, wRH - wLH, 0.0));
            vec3 bitangent = normalize(vec3(0.0, wBH - wFH, 2.0));

            vec3 normal = vec3(2.0 * (wRH - wLH), -4.0, 2.0 * (wBH - wFH));

            vTBN = mat3(tangent, bitangent, normal);

            gl_Position = world * vWorldPosition;
        }
    `,
    attributes: {
        position: Application.regl.prop('positions' as never)
    },
    uniforms: {
        heightTex: Application.regl.prop('heightTex' as never),
        skyboxCubemap: Application.regl.prop('skyboxCubemap' as never),
        sunPosition: Application.regl.prop('sunPosition' as never),
        lightColor: Application.regl.prop('lightColor' as never),
        model: Application.regl.prop('model' as never),
        scale: Application.regl.prop('scale' as never),
        cameraPosition: () => Application.camera.position,
        world: () => Application.camera.viewProjection
    },
    elements: Application.regl.prop('elements' as never),
    cull: {
        enable: true,
        face: 'front'
    },
    frontFace: 'cw'
});