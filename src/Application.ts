import REGL, { Regl } from "regl";
import { Camera } from "./graphic/Camera";


export class Application {

    public static get regl() {
        return Application._regl;
    }

    public static get camera() {
        return Application._camera;
    }

    private static _regl: Regl = REGL({
        extensions: [
            'oes_element_index_uint',
            'OES_texture_float',
            'WEBGL_color_buffer_float',
        ]
    });

    private static _camera = Camera.createDefaultCamera(Application._regl._gl.canvas as HTMLCanvasElement, 0.01, 200, 65);
}