import { Application } from "./Application";
import { EnvMapSimulator } from "./common/EnvMapSimulator";
import { FFT } from "./common/FFT";
import { FrequencySimulator } from "./common/FrequencySimulator";
import { DrawAxes } from "./graphic/commands/DrawAxes";
import { DrawOcean } from "./graphic/commands/DrawOcean";
import { DrawPicture } from "./graphic/commands/DrawPicture";
import { DrawSkybox } from "./graphic/commands/DrawSkybox";
import { SimulateSky } from "./graphic/commands/SimulateSky";
import { G, Ocean } from "./world/Ocean";
import { Sky } from "./world/Sky";

const sky = new Sky();
const ocean = new Ocean(256, 128);
const heightSimulator = new FrequencySimulator(ocean.distribution, ocean.meshSize, G, ocean.mod);
const heightFFT = new FFT(heightSimulator.output, ocean.meshSize);

const skySimulator = new EnvMapSimulator(SimulateSky, 1024);

const loop = Application.regl.frame(({ time }) => {
    try {

        Application.regl.clear({
            color: [0, 0, 0, 1],
            depth: 1
        });

        //DrawAxes();

        skySimulator.run({
            skymap: sky.initialTexture,
            time: time
        });

        DrawSkybox({ cubemap: skySimulator.output });

        heightSimulator.run(time);
        heightFFT.run();

        // DrawPicture({
        //     picture: heightFFT.output
        // });

        ocean.visibleQuads.forEach(x =>
            DrawOcean({
                positions: ocean.positions,
                elements: x.active,
                model: ocean.geometry.model,  
                skyboxCubemap: skySimulator.output,
                lightDirection: sky.lightDirection,
                heightTex: heightFFT.output,
                scale: ocean.scale
            })
        );
    }
    catch(e) {
      loop.cancel();
    }
});