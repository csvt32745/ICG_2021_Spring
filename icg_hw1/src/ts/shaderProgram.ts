import { mat4, vec3, quat } from 'gl-matrix'
import { iPhongLight, PhongLight } from './light'
declare let gl: WebGLRenderingContext

class LightUniforms {
    enabled: WebGLUniformLocation;
    position: WebGLUniformLocation;
    la: WebGLUniformLocation;
    ld: WebGLUniformLocation;
    ls: WebGLUniformLocation;
    attenuation: WebGLUniformLocation;

    constructor (idx: number, shaderProgram: WebGLProgram) {
      this.enabled = gl.getUniformLocation(shaderProgram, `lights[${idx}].enabled`)
      this.position = gl.getUniformLocation(shaderProgram, `lights[${idx}].position`)
      this.la = gl.getUniformLocation(shaderProgram, `lights[${idx}].la`)
      this.ld = gl.getUniformLocation(shaderProgram, `lights[${idx}].ld`)
      this.ls = gl.getUniformLocation(shaderProgram, `lights[${idx}].ls`)
      this.attenuation = gl.getUniformLocation(shaderProgram, `lights[${idx}].attenuation`)
    }
}

class TextureUniforms {
  enabled: WebGLUniformLocation;
  texture: WebGLUniformLocation

  constructor (name: string, shaderProgram: WebGLProgram) {
    this.enabled = gl.getUniformLocation(shaderProgram, `${name}_enabled`);
    this.texture = gl.getUniformLocation(shaderProgram, name);
  }
}

class BasicShader {
    name: string;
    shaderProgram: WebGLProgram;

    vertexPositionAttribute: GLint;
    vertexFrontColorAttribute: GLint;
    vertexNormalAttribute?: GLint;
    vertexUVAttribute? : GLint;

    modelMatrixUniform?: WebGLUniformLocation;
    invT_modelMatrixUniform?: WebGLUniformLocation;
    mvMatrixUniform?: WebGLUniformLocation;
    invT_mvMatrixUniform?: WebGLUniformLocation;
    pMatrixUniform?: WebGLUniformLocation;

    lightUniforms?: LightUniforms[] = [];
    glossUniform?: WebGLUniformLocation;
    camPosUniform?: WebGLUniformLocation;
    textureUniform?: TextureUniforms;
    
    depthTexUniform?: WebGLUniformLocation;
    depthMatrix?: WebGLUniformLocation;

    is_loaded: boolean = false;

    constructor (shader_name: string) {
      this.name = shader_name;
      this.getShader(shader_name)
      this.initShaders()
    }

    getShader (name: string): void {
      const vert_shader = gl.createShader(gl.VERTEX_SHADER)
      // console.log(require('../goraud.vert'))
      let shader_src = require(`../shaders/${name}.vert`).default
      gl.shaderSource(vert_shader, shader_src)
      gl.compileShader(vert_shader)

      const frag_shader = gl.createShader(gl.FRAGMENT_SHADER)
      shader_src = require(`../shaders/${name}.frag`).default
      gl.shaderSource(frag_shader, shader_src)
      gl.compileShader(frag_shader)

      if (!gl.getShaderParameter(vert_shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vert_shader))
        return null
      } else if (!gl.getShaderParameter(frag_shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(frag_shader))
        return null
      }

      this.shaderProgram = gl.createProgram()
      gl.attachShader(this.shaderProgram, vert_shader)
      gl.attachShader(this.shaderProgram, frag_shader)
      gl.linkProgram(this.shaderProgram)
      if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
        alert('Could not initialise shaders')
      }
    }

    initShaders (): void {
      gl.useProgram(this.shaderProgram)

      this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition')
      gl.enableVertexAttribArray(this.vertexPositionAttribute)
      this.vertexFrontColorAttribute = gl.getAttribLocation(this.shaderProgram, 'aFrontColor')
      gl.enableVertexAttribArray(this.vertexFrontColorAttribute)

      this.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, 'aNormal')
      if(this.vertexNormalAttribute >= 0)
        gl.enableVertexAttribArray(this.vertexNormalAttribute)
      
      this.vertexUVAttribute = gl.getAttribLocation(this.shaderProgram, 'aUV')
      if(this.vertexUVAttribute >= 0){
        // enable attribute in modelObject class
        this.textureUniform = new TextureUniforms('tex', this.shaderProgram);
      }

      this.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, 'uPMatrix')
      this.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, 'uMVMatrix')
      this.invT_mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, 'uinvTMVMatrix')
      this.modelMatrixUniform = gl.getUniformLocation(this.shaderProgram, 'uModelMatrix')
      this.invT_modelMatrixUniform = gl.getUniformLocation(this.shaderProgram, 'uinvTModelMatrix')

      for (let i = 0; i < 4; i++) { this.lightUniforms.push(new LightUniforms(i, this.shaderProgram)) }
      this.glossUniform = gl.getUniformLocation(this.shaderProgram, 'gloss')
      this.camPosUniform = gl.getUniformLocation(this.shaderProgram, 'uCamPos')
      
      this.depthTexUniform = gl.getUniformLocation(this.shaderProgram, 'depth_tex');
      this.depthMatrix = gl.getUniformLocation(this.shaderProgram, 'uDepthMatrix');

      this.is_loaded = true;
    }

    setCamPosUniform (camPos: vec3): void {
      gl.useProgram(this.shaderProgram)
      gl.uniform3fv(this.camPosUniform, camPos)
    }

    setWorldMatrixUniforms (mvp: {pMatrix: mat4, mvMatrix: mat4, invT_mvMatrix: mat4}): void {
      gl.useProgram(this.shaderProgram)
      gl.uniformMatrix4fv(this.pMatrixUniform, false, mvp.pMatrix)
      gl.uniformMatrix4fv(this.mvMatrixUniform, false, mvp.mvMatrix)
      gl.uniformMatrix4fv(this.invT_mvMatrixUniform, false, mvp.invT_mvMatrix)
    }

    setDepthMatrixUniforms(depthTextureSize:number, depthMatrix: mat4, texture_buffer:WebGLTexture, idx=0){
      gl.useProgram(this.shaderProgram);
      // gl.uniform1i(this.shaderProgram.textureUniform.enabled, 1);
      gl.uniform1i(this.depthTexUniform, 1+idx);
      gl.activeTexture(gl.TEXTURE1+idx);
      gl.bindTexture(gl.TEXTURE_2D, texture_buffer);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
      gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.DEPTH_COMPONENT, // internal format
        depthTextureSize,   // width
        depthTextureSize,   // height
        0,                  // border
        gl.DEPTH_COMPONENT, // format
        gl.UNSIGNED_INT,    // type
        null);              // data
      gl.uniformMatrix4fv(this.depthMatrix, false, depthMatrix);
      // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, );
    }

    setLightUniforms (lights: iPhongLight[]): void {
      gl.useProgram(this.shaderProgram)
      lights.forEach((light, idx) => {
        gl.uniform1i(this.lightUniforms[idx].enabled, 1)
        gl.uniform3fv(this.lightUniforms[idx].la, light.la)
        gl.uniform3fv(this.lightUniforms[idx].ld, light.ld)
        gl.uniform3fv(this.lightUniforms[idx].ls, light.ls)
        gl.uniform1f(this.lightUniforms[idx].attenuation, light.attenuation)
        gl.uniform3fv(this.lightUniforms[idx].position, light.position)
      })
    }
}

export {
  BasicShader
}
