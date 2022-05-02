precision mediump float;

attribute vec2 position;

varying vec2 vUV;
varying vec2 vPos;

void main() {
    vUV = (position + 1.0) / 2.0;
    vPos = position;

    gl_Position = vec4(position, 0, 1);
}