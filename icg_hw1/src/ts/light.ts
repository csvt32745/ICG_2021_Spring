import { mat4, mat3, vec3, quat } from 'gl-matrix'
import { BasicShader } from '../ts/shaderProgram'
import { Transform } from './transform'
import { Camera } from './camera'
declare let gl: WebGLRenderingContext

interface iPhongLight {
    position: vec3;
    la: vec3;
    ld: vec3;
    ls: vec3;
    attenuation: number;
}

class PhongLight extends Transform implements iPhongLight {
    la: vec3 = vec3.fromValues(0.5, 0.5, 0.5);
    ld: vec3 = vec3.fromValues(0.5, 0.5, 0.5);
    ls: vec3 = vec3.fromValues(0.9, 0.9, 0.9);
    attenuation: number = 100;

    constructor () { super() }

    setAmbient (x: number, y: number, z: number): PhongLight { this.la = vec3.fromValues(x, y, z); return this }
    setDiffuse (x: number, y: number, z: number): PhongLight { this.ld = vec3.fromValues(x, y, z); return this }
    setSpecular (x: number, y: number, z: number): PhongLight { this.ls = vec3.fromValues(x, y, z); return this }
    setAttenuation(attenuation: number): PhongLight { this.attenuation = attenuation; return this; }
}

class Shadow {

  light: PhongLight;
  view: Camera;
  depthTexture: WebGLTexture;
  depthTextureSize: number = 2048;
  depthFramebuffer: WebGLFramebuffer;

  unusedTexture: WebGLTexture;

  constructor(light: PhongLight) {
    this.light = light;
    this.view = new Camera({width: this.depthTextureSize, height: this.depthTextureSize}, 120)
    this.createDepthBuffer()
  }

  setFrameBuffer(): void
  {
    // this.createDepthBuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.setPosRot()
    // gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    // gl.framebufferTexture2D(
    //     gl.FRAMEBUFFER,       // target
    //     gl.DEPTH_ATTACHMENT,  // attachment point
    //     gl.TEXTURE_2D,        // texture target
    //     this.depthTexture,         // texture
    //     0);                   // mip level 

    // // attach it to the framebuffer
    // gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
    // gl.framebufferTexture2D(
    //   gl.FRAMEBUFFER,        // target
    //   gl.COLOR_ATTACHMENT0,  // attachment point
    //   gl.TEXTURE_2D,         // texture target
    //   this.unusedTexture,         // texture
    //   0);                    // mip level
    // let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    // if (status !== gl.FRAMEBUFFER_COMPLETE) {
    //   console.log("The created frame buffer is invalid: " + status.toString());
    // }
  }
  
  setPosRot(): void{
    this.view.position = this.light.position;
    let mat = mat3.fromMat4(mat3.create(), mat4.targetTo(mat4.create(), this.light.position, vec3.zero(vec3.create()), vec3.fromValues(0, 1, 0)))
    this.view.rotation = quat.fromMat3(this.view.rotation, mat);
  }

  getMatrix(): mat4
  {// Assume the MVP is calculated
    let mvp = this.view.getMVP()
    var mat = mat4.create();
    mat = mat4.mul(mat, mvp.pMatrix, mvp.mvMatrix);
    return mat;
  }

  createDepthBuffer(): void
  {
    this.depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.DEPTH_COMPONENT, // internal format
        this.depthTextureSize,   // width
        this.depthTextureSize,   // height
        0,                  // border
        gl.DEPTH_COMPONENT, // format
        gl.UNSIGNED_INT,    // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
     
          // mip level
      
    // create a color texture of the same size as the depth texture
    this.unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this.depthTextureSize,
        this.depthTextureSize,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      

    // attach it to the framebuffer
    this.depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.DEPTH_ATTACHMENT,  // attachment point
        gl.TEXTURE_2D,        // texture target
        this.depthTexture,         // texture
        0);         

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,        // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,         // texture target
        this.unusedTexture,         // texture
        0);                    // mip level
  }
}

export {
  iPhongLight,
  PhongLight,
  Shadow
}
