import { Application } from "../../Application";

export const Plane = {
    position: Application.regl.buffer([
        [-1, -1],
        [ 1, -1],
        [ 1,  1],
        [-1,  1]
    ]),
    elements: Application.regl.elements({
        data: [
            0, 1, 2,
            0, 2, 3
        ],
        count: 6
    })
};