import { Application } from "../../Application";

import { Plane } from "../resources/Plane";

import skyboxVert from "../shaders/skybox.vert";
import skyboxFrag from "../shaders/skybox.frag";
import { Cube } from "../resources/Cube";


export const DrawSkybox = Application.regl({
    frag: skyboxFrag,
    vert: skyboxVert,
    attributes: {
        position: Cube.position
    },
    elements: Cube.elements,
    uniforms: {
        cubemap: Application.regl.prop('cubemap' as never),
        look: () => Application.camera.lookProjection
    },
    depth: {
        func: 'lequal'
    }
});