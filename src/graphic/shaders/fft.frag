precision mediump float;

uniform sampler2D fftTex;
uniform sampler2D butterflyTex;
uniform bool horizontal;

varying vec2 vUV;

vec2 complexAdd(vec2 a, vec2 b)
{
    return vec2(a.x + b.x, a.y + b.y);
}


vec2 complexMult(vec2 a, vec2 b)
{
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

void main() {
    vec2 src1, src2, weight;
    vec4 indicesAndWeight;

    if (horizontal) {
        indicesAndWeight = texture2D(butterflyTex, vUV);
    }
    else {
        indicesAndWeight = texture2D(butterflyTex, vUV.yx);
    }

    if (horizontal) {
        src1 = texture2D(fftTex, vec2(indicesAndWeight.r, vUV.y)).rg;
        src2 = texture2D(fftTex, vec2(indicesAndWeight.g, vUV.y)).rg;
    }
    else {
        src1 = texture2D(fftTex, vec2(vUV.x, indicesAndWeight.r)).rg;
        src2 = texture2D(fftTex, vec2(vUV.x, indicesAndWeight.g)).rg;
    }
    
    weight = indicesAndWeight.ba;

    vec2 res = complexAdd(src1, complexMult(src2, weight));

    gl_FragColor = vec4(res.x, res.y, 1.0, 1);
}