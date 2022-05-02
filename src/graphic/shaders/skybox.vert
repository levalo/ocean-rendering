precision mediump float;

attribute vec3 position;

uniform mat4 look;

varying vec3 vUV;

void main() {
    vUV = position;

    gl_Position = look * vec4(position * 64.0, 1);
}