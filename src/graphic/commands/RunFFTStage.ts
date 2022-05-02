import { Application } from "../../Application";
import { Plane } from "../resources/Plane";

import planeVert from "../shaders/plane.vert";
import fftFrag from "../shaders/fft.frag";

export const RunFFTStage = Application.regl({
    framebuffer: Application.regl.prop('output' as never),
    frag: fftFrag,
    vert: planeVert,
    attributes: {
        position: Plane.position
    },
    elements: Plane.elements,
    uniforms: {
        fftTex: Application.regl.prop('input' as never),
        butterflyTex: Application.regl.prop('butterflyTex' as never),
        horizontal: Application.regl.prop('horizontal' as never)
    },
    depth: {
        enable: false
    }
});