import { mat4, vec3, quat } from "gl-matrix";
import { BasicShader } from "../ts/shaderProgram";
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
    position: vec3 = vec3.zero(vec3.create());
    rotation: quat = quat.create();
    scale: vec3 = vec3.fromValues(1, 1, 1);
    
    isLoaded: boolean = false;

    vertexAttributes: VertexAttributes;
    vertexBuffers: VertexAttributeBuffers;
    shaderProgram: BasicShader;
    
    constructor(
        shader: BasicShader,
        model_name?: string,
    ) {
        this.shaderProgram = shader;
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

    draw(): void {
        if(!this.isLoaded)
            return;
        gl.useProgram(this.shaderProgram.shaderProgram);
        this.setUniform();
        
        // Setup teapot position data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexPositions);
        gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 
                                this.vertexBuffers.vertexPositions.itemSize, 
                                gl.FLOAT, 
                                false, 
                                0, 
                                0);

        // Setup teapot front color data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexFrontcolors);
        gl.vertexAttribPointer(this.shaderProgram.vertexFrontColorAttribute, 
                                this.vertexBuffers.vertexFrontcolors.itemSize, 
                                gl.FLOAT, 
                                false, 
                                0, 
                                0);

        // Setup teapot normal data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexNormals);
        gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, 
                                this.vertexBuffers.vertexNormals.itemSize, 
                                gl.FLOAT, 
                                false, 
                                0, 
                                0);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffers.vertexPositions.numItems);
    }

    setUniform(): void {
        let mat = mat4.create();
        mat4.mul(mat, mat4.fromQuat(mat4.create(), this.rotation), mat4.fromScaling(mat4.create(), this.scale));
        mat4.mul(mat, mat4.fromTranslation(mat4.create(), this.position), mat);
        gl.uniformMatrix4fv(this.shaderProgram.modelMatrixUniform, false, mat);

        mat4.transpose(mat, mat4.invert(mat, mat));
        gl.uniformMatrix4fv(this.shaderProgram.invT_modelMatrixUniform, false, mat);
    }

    setScale(s: number): ModelObject { vec3.scale(this.scale, this.scale, s); return this; }
    setScaleXYZ(x: number, y: number, z: number): ModelObject { this.scale = vec3.fromValues(x, y, z); return this; }

    setPos(x: number, y: number, z: number): ModelObject { this.position = vec3.fromValues(x, y, z); return this; }
    translate(x: number, y: number, z: number): ModelObject { vec3.add(this.position, this.position, vec3.fromValues(x, y, z)); return this; }

    setRot(x: number, y: number, z: number): ModelObject { this.rotation = quat.fromEuler(quat.create(), x, y, z); return this; }
    rotateX(r: number): ModelObject { quat.rotateX(this.rotation, this.rotation, r); return this; }
    rotateY(r: number): ModelObject { quat.rotateY(this.rotation, this.rotation, r); return this; }
    rotateZ(r: number): ModelObject { quat.rotateZ(this.rotation, this.rotation, r); return this; }
    rotateAxis(r: number, axis: vec3) { quat.multiply(this.rotation, this.rotation, quat.setAxisAngle(quat.create(), axis, r)); return this; }
    
}

export {
    ModelObject
};