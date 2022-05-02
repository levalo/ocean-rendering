precision mediump float;

varying vec3 vUV;

uniform samplerCube cubemap;

void main() {
    vec3 col = textureCube(cubemap, vUV).rgb;

    gl_FragColor = vec4(col, 1.0);
}