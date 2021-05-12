import { Mode } from 'fs';
import { mat4, vec3, quat } from 'gl-matrix'
import { BasicShader } from './shaderProgram'
import { Transform } from './transform'
declare let gl: WebGLRenderingContext

class CustomWebGLBuffer extends WebGLBuffer {
    itemSize: number;
    numItems: number;
}

interface ObjectAttribute {
  name: string,
  object: ModelObject
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

interface WebGLTexture {
  name: string,
  texture: HTMLImageElement,
  buffer: WebGLBuffer,
}

class ModelObject extends Transform {
    position: vec3 = vec3.zero(vec3.create());
    rotation: quat = quat.create();
    scale: vec3 = vec3.fromValues(1, 1, 1);
    shear: vec3 = vec3.zero(vec3.create());

    gloss: number = 16;

    textures: WebGLTexture;
    
    isLoaded = false;

    vertexAttributes: VertexAttributes;
    vertexBuffers: VertexAttributeBuffers;
    shaderProgram: BasicShader;

    constructor (
      shader: BasicShader,
      model_name?: string,
      texture_name?: string
    ) {
      super()
      this.shaderProgram = shader
      if (model_name !== undefined) { this.loadModel(model_name) }
      if (texture_name !== undefined) { this.loadTexture(texture_name) }
    }

    loadModel (name: string): void {
      // const request = new XMLHttpRequest()
      // console.log(require(`../assets/model/${name}.json`))
      // // request.open('GET', `./src/assets/model/${name}.json`)
      // // console.log(`./src/assets/model/${name}.json`)
      // request.onreadystatechange = () => {
      //   if (request.readyState === 4) {
      //     console.log(request.responseText);
      //     this.vertexAttributes = JSON.parse(request.responseText) as VertexAttributes
      //     // console.log(this.vertexAttributes);
      //     this.handleModelData()
      //   }
      // }
      // request.send()
      // console.log(require(`../assets/model/${name}.json`))
      this.vertexAttributes = require(`../assets/model/${name}.json`) as VertexAttributes;
      this.handleModelData();
    }

    loadTexture(name: string): void{
      var image = new Image();
      image.onload = () => {
        this.textures.texture = image;
        console.log('Image loaded!');
      }
      image.src = `${require(`../assets/texture/${name}`)}`;
      this.textures = {
        name: name,
        texture: undefined,
        buffer: gl.createTexture()
      }
    }

    handleModelData (): void {
      // console.log(this.vertexAttributes.vertexPositions);
      this.vertexBuffers = {}
      for (const key in this.vertexAttributes) {
        if (key !== undefined && key != 'vertexTextureCoords') {
          let buf = gl.createBuffer() as CustomWebGLBuffer
          gl.bindBuffer(gl.ARRAY_BUFFER, buf)
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(<Float32Array> this.vertexAttributes[key]), gl.STATIC_DRAW)
          buf.itemSize = 3
          buf.numItems = this.vertexAttributes[key].length / 3
          this.vertexBuffers[key] = buf
        }else if(key == 'vertexTextureCoords'){
          let buf = gl.createBuffer() as CustomWebGLBuffer
          gl.bindBuffer(gl.ARRAY_BUFFER, buf)
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(<Float32Array> this.vertexAttributes[key]), gl.STATIC_DRAW)
          buf.itemSize = 2
          buf.numItems = this.vertexAttributes[key].length / 2
          this.vertexBuffers[key] = buf
        }
      }
      this.isLoaded = true
    }

    draw (): void {
      if (!this.isLoaded && !this.shaderProgram.is_loaded) { console.log('Model not loaded, skip drawing'); return; }
      gl.useProgram(this.shaderProgram.shaderProgram)
      this.setUniform()

      // Setup teapot position data
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexPositions)
      gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
        this.vertexBuffers.vertexPositions.itemSize,
        gl.FLOAT,
        false,
        0,
        0)

      // Setup teapot front color data
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexFrontcolors)
      gl.vertexAttribPointer(this.shaderProgram.vertexFrontColorAttribute,
        this.vertexBuffers.vertexFrontcolors.itemSize,
        gl.FLOAT,
        false,
        0,
        0)

      // Setup teapot normal data
      if(this.shaderProgram.vertexNormalAttribute >= 0){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexNormals)
        gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute,
          this.vertexBuffers.vertexNormals.itemSize,
          gl.FLOAT,
          false,
          0,
          0)
      }
      if(this.shaderProgram.vertexUVAttribute >= 0 && this.vertexBuffers.vertexTextureCoords !== undefined){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers.vertexTextureCoords)
        gl.vertexAttribPointer(this.shaderProgram.vertexUVAttribute,
          this.vertexBuffers.vertexTextureCoords.itemSize,
          gl.FLOAT,
          false,
          0,
          0)
      }
      gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffers.vertexPositions.numItems)
    }

    setUniform (): void {
      let mat = mat4.create()
      mat4.scale(mat, mat, this.scale)
      
      let shear_mat = mat4.fromValues(
        1, this.shear[2], 0, 0,
        this.shear[0], 1, 0, 0,
        this.shear[1], 0, 1, 0,
        0, 0, 0, 1
      )

      mat4.mul(mat, mat4.fromQuat(mat4.create(), this.rotation), mat)
      mat4.mul(mat, shear_mat, mat)
      mat4.mul(mat, mat4.fromTranslation(mat4.create(), this.position), mat)
      
      gl.uniformMatrix4fv(this.shaderProgram.modelMatrixUniform, false, mat)

      mat4.transpose(mat, mat4.invert(mat, mat))
      gl.uniformMatrix4fv(this.shaderProgram.invT_modelMatrixUniform, false, mat)

      gl.uniform1f(this.shaderProgram.glossUniform, this.gloss);


      if(this.shaderProgram.vertexUVAttribute >= 0) {
        if(this.textures !== undefined){
          gl.enableVertexAttribArray(this.shaderProgram.vertexUVAttribute)
          gl.uniform1i(this.shaderProgram.textureUniform.enabled, 1);
          gl.uniform1i(this.shaderProgram.textureUniform.texture, 0);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this.textures.buffer);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
          if(this.textures.texture !== undefined)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textures.texture);
          else
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        }
        else{
          gl.disableVertexAttribArray(this.shaderProgram.vertexUVAttribute)
          gl.uniform1i(this.shaderProgram.textureUniform.enabled, 0);
        }
      } 
    }

    setScale (s: number):ModelObject { super.setScale(s); return this }
    setScaleXYZ (x: number, y: number, z: number):ModelObject { super.setScaleXYZ(x, y, z); return this }

    setPos (x: number, y: number, z: number): ModelObject { super.setPos(x, y, z); return this }
    translate (x: number, y: number, z: number): ModelObject { super.translate(x, y, z); return this }

    setRot (x: number, y: number, z: number): ModelObject { super.setRot(x, y, z); return this }
    rotateX (r: number): ModelObject { super.rotateX(r); return this }
    rotateY (r: number): ModelObject { super.rotateY(r); return this }
    rotateZ (r: number): ModelObject { super.rotateZ(r); return this }
    rotateAxis (r: number, axis: vec3): ModelObject { super.rotateAxis(r, axis); return this }

    setGloss(gloss: number): ModelObject { this.gloss = gloss; return this; }
}

export {
  ModelObject,
  ObjectAttribute
}
