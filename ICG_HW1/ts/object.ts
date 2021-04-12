// / <reference path="../main.ts" />
import { mat4, vec3, quat } from "../js/glMatrix";
// var gl: WebGLRenderingContext = global.gl;
declare var gl: WebGLRenderingContext;

class CustomWebGLBuffer extends WebGLBuffer {
    itemSize: number;
    numItems: number;
}

interface VertexAttributeBuffers {
    vertexPositions?: CustomWebGLBuffer,
    vertexNormals?: CustomWebGLBuffer,
    vertexFrontcolors?: CustomWebGLBuffer,
    vertexBackcolors?: CustomWebGLBuffer,
    vertexTextureCoords?: CustomWebGLBuffer
}

interface VertexAttributes {
    vertexPositions?: Float32Array,
    vertexNormals?: Float32Array,
    vertexFrontcolors?: Float32Array,
    vertexBackcolors?: Float32Array,
    vertexTextureCoords?: Float32Array,
}

class ModelObject {
    position: typeof vec3 = vec3.create();
    rotation: typeof quat = quat.create();
    
    isLoaded: boolean = false;

    vertexAttributes: VertexAttributes;
    vertexBuffers: VertexAttributeBuffers;
    shaderProgram: WebGLProgram;
    
    constructor(
        position: typeof vec3,
        model_name?: string
    ) {
        this.position = position;
        if(model_name !== undefined)
            this.loadModel(model_name);
    }

    loadModel(name: string): void {
        var request = new XMLHttpRequest();
        request.open("GET", `./model/${name}.json`);
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                this.vertexAttributes = JSON.parse(request.responseText) as VertexAttributes;
                console.log(this.vertexAttributes);
                this.handleModelData();
            }
        }
        request.send();
    }
    
    handleModelData(): void {

        // console.log(this.vertexAttributes.vertexPositions);
        this.vertexBuffers = {}
        for(let key in this.vertexAttributes){
            if(key !== undefined && key !== 'vertexTextureCoords'){
                // let gl = global.gl;
                var buf = gl.createBuffer() as CustomWebGLBuffer;
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(<Float32Array> this.vertexAttributes[key]), gl.STATIC_DRAW);
                buf.itemSize = 3;
                buf.numItems = this.vertexAttributes[key].length / 3;
                console.log(buf);
                this.vertexBuffers[key] = buf;
            }
        }
        this.isLoaded = true;
    }

    draw(shaderProgram: any): void {
            // Setup teapot position data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexPositions);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                            this.vertexBuffers.vertexPositions.itemSize, 
                            gl.FLOAT, 
                            false, 
                            0, 
                            0);

    // Setup teapot front color data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexFrontcolors);
    gl.vertexAttribPointer(shaderProgram.vertexFrontColorAttribute, 
                            this.vertexBuffers.vertexFrontcolors.itemSize, 
                            gl.FLOAT, 
                            false, 
                            0, 
                            0);

    // Setup teapot normal data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexNormals);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                            this.vertexBuffers.vertexNormals.itemSize, 
                            gl.FLOAT, 
                            false, 
                            0, 
                            0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffers.vertexPositions.numItems);
    }

}

export {
    ModelObject
};