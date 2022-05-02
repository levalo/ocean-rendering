import REGL from "regl";
import { Application } from "../Application";
import { RunFFTStage } from "../graphic/commands/RunFFTStage";

export class FFT {
    public constructor(
        public _input: REGL.Framebuffer,
        private _size: number
    ) {
        this._butterflyStagesData = this.initButterflyStagesData(_size).map(x => Application.regl.texture({
            width: _size,
            height: _size,
            data: x,
        }));

        this._frameBuffers = [0, 1].map(x => Application.regl.framebuffer({
            width: _size,
            height: _size,
            colorType: 'float',
        }));

        this._outputTex = Application.regl.texture({
            width: _size,
            height: _size,
            min: 'linear',
            mag: 'linear',
            wrap: 'repeat',
        });
        
        this._outputFrameBuffer = Application.regl.framebuffer({
            width: _size,
            height: _size,
            color: this._outputTex
        });

        this._stages = this.initStages();
    }

    public get output() {
        return this._outputFrameBuffer;
    }

    public get outputTex() {
        return this._outputTex;
    }

    public run() {
        this._stages.forEach(x => RunFFTStage(x));
    }

    private initStages() {
        const stages = [];

        for(let i = 0; i < this._butterflyStagesData.length * 2; i++) {
            if (i == 0) {
                stages.push({
                    inputFB: -1,
                    outputFB: 1,
                    input: this._input,
                    output: this._frameBuffers[1],
                    butterflyTex: this._butterflyStagesData[0],
                    horizontal: true
                });
            }
            else if (i === (this._butterflyStagesData.length * 2) - 1) {
                stages.push({
                    inputFB: 1,
                    outputFB: 2,
                    input: this._frameBuffers[1],
                    output: this._outputFrameBuffer,
                    butterflyTex: this._butterflyStagesData[i % this._butterflyStagesData.length],
                    horizontal: false
                });
            }
            else {
                stages.push({
                    inputFB: i % 2,
                    outputFB: (i + 1) % 2,
                    input: this._frameBuffers[i % 2],
                    output: this._frameBuffers[(i + 1) % 2],
                    butterflyTex: this._butterflyStagesData[i % this._butterflyStagesData.length],
                    horizontal: i < this._butterflyStagesData.length
                });
            }
        }

        return stages;
    }

    private bitReverse(x: number, numFFTStages: number) {
        x = (((x & 0xaaaaaaaa) >> 1) | ((x & 0x55555555) << 1));
        x = (((x & 0xcccccccc) >> 2) | ((x & 0x33333333) << 2));
        x = (((x & 0xf0f0f0f0) >> 4) | ((x & 0x0f0f0f0f) << 4));
        x = (((x & 0xff00ff00) >> 8) | ((x & 0x00ff00ff) << 8));
        x = ((x >> 16) | (x << 16));
        x >>>= 32 - numFFTStages;
        return x;
    }

    private initButterflyStagesData(meshSize: number) {
        // initialize butterfly indices and weights for every stage
        const numFFTStages = Math.log(meshSize)/Math.LN2;
        const delta = 1.0 / meshSize;

        const butterflyTextures = new Array(numFFTStages);
        
        for(let n = 0; n < butterflyTextures.length; ++n)
        {
            const butterflyArray = new Float32Array(meshSize * meshSize * 4);

            let k = 0, k0 = 0;

            const exp = Math.pow(2, numFFTStages - n - 1);
            const stepNext = Math.pow(2, n+1);
            const stepThis = 0.5 * stepNext;

            // compute for the first row		
            for(let m = 0; m < stepThis; ++m) // loop through butterflies with different weights
            {
                k = m*4;
                for(let l = m; l < meshSize; l += stepNext, k += stepNext*4) // loop through butterflies with same weights
                {
                    if(n != 0)
                    {
                        // indices for upper operand of butterfly
                        butterflyArray[k]   = (l + 0.5)*delta ;   		  // index (stored as texture coordinates) of Source1
                        butterflyArray[k+1] = (l + stepThis + 0.5)*delta;   // index (stored as texture coordinates) of Source2	
                        // indices for lower operand of butterfly
                        butterflyArray[k+stepThis*4]   = (l + 0.5)*delta ;   		  // index (stored as texture coordinates) of Source1
                        butterflyArray[k+stepThis*4+1] = (l + stepThis + 0.5)*delta;   // index (stored as texture coordinates) of Source2	
                    }
                    else // scramble the index order for the first stage based on bit reversal
                    {
                        // indices for upper operand of butterfly
                        butterflyArray[k]   = (this.bitReverse(l, numFFTStages)+ 0.5)*delta ;   		  // index (stored as texture coordinates) of Source1
                        butterflyArray[k+1] = (this.bitReverse(l + stepThis, numFFTStages) + 0.5)*delta;   // index (stored as texture coordinates) of Source2			
                        // indices for lower operand of butterfly
                        butterflyArray[k+stepThis*4]   = (this.bitReverse(l, numFFTStages) + 0.5)*delta ;   		  // index (stored as texture coordinates) of Source1
                        butterflyArray[k+stepThis*4+1] = (this.bitReverse(l + stepThis, numFFTStages) + 0.5)*delta;   // index (stored as texture coordinates) of Source2
                    }						
                }
            }
            
            k = 2;
            for(let i = 0; i < meshSize; i++, k += 2) 
            {
                
                /*
                *   Source1 ----------				- += Output1
                * 			 			-		-	
                * 			 				- 	
                *  		    		-		-
                *   Source2 * weight--				- += Output2
                *   
                * 	 For Source1, weight is stored as it is
                * 	 For Source2, weight is stored as -weight
                * 
                */
                let r = (i * exp) % meshSize;		
                butterflyArray[k++] =  Math.cos(2*Math.PI*r/meshSize);   // real part of weight
                butterflyArray[k++] =  Math.sin(2*Math.PI*r/meshSize);   // imaginary part of weight
            }
            // copy the first row to every row
            k = 4*meshSize;
            for(let j = 1; j < meshSize; j++)
            {
                k0 = 0;
                for(let i = 0; i < meshSize; i++) 
                {
                    butterflyArray[k++] = butterflyArray[k0++];   // index (stored as texture coordinates) of Source1
                    butterflyArray[k++] = butterflyArray[k0++];   // index (stored as texture coordinates) of Source2
                    butterflyArray[k++] = butterflyArray[k0++];   // real part of weight
                    butterflyArray[k++] = butterflyArray[k0++];   // imaginary part of weight
                }
            }

            butterflyTextures[n] = butterflyArray;
        }

        return butterflyTextures;
    }

    private _outputTex: REGL.Texture2D;
    private _outputFrameBuffer: REGL.Framebuffer;
    private _stages: Array<{}> = [];
    private _butterflyStagesData: REGL.Texture2D[];
    private _frameBuffers: REGL.Framebuffer[];
}