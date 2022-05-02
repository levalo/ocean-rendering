import { Application } from "../../Application";
import { Plane } from "../resources/Plane";

import planeVert from "../shaders/plane.vert";
import heightmapFrag from "../shaders/heightmap.frag";

export const SimulateFrequency = Application.regl({
    framebuffer: Application.regl.prop('output' as never),
    frag: heightmapFrag,
    vert: planeVert,
    attributes: {
        position: Plane.position
    },
    elements: Plane.elements,
    uniforms: {
        G: Application.regl.prop('G' as never),
        distributionTex: Application.regl.prop('distributionTex' as never),
        meshSize: Application.regl.prop('meshSize' as never),
        mod: Application.regl.prop('mod' as never),
        time: Application.regl.prop('time' as never)
    },
    depth: {
        enable: false
    }
});