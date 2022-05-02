precision mediump float;

uniform sampler2D distributionTex;

uniform float meshSize;
uniform float time;
uniform float G;
uniform vec2 mod;

varying vec2 vUV;
varying vec2 vPos;

float alias(float x, float N) {
    if (x > N / 2.0) {
        x -= N;
    }

    return x;
}

vec2 multiplyComplex(vec2 a, vec2 b) {
    return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);
}

void main() {
    vec2 eq = vec2(equal(vUV, vec2(0.0)));
    vec2 wi = mix(1.0 - vUV, vec2(0.0), eq);
    
    vec2 a = texture2D(distributionTex, vUV).rg;
    vec2 b = texture2D(distributionTex, wi).rg;

    vec2 k = mod * vec2(alias(vUV.x * meshSize, meshSize), alias(vUV.y * meshSize, meshSize)) * 0.1;
    float k_len = length(k);

    float w = sqrt(G * k_len) * time;

    a = multiplyComplex(a, vec2(cos(w), sin(w)));
    b = multiplyComplex(vec2(b.x -b.y), vec2(cos(-w), sin(-w)));

    vec2 res = a + b;
    
    gl_FragColor = vec4(res.rg, 1.0, 1.0);
}