import { mat4, vec3, quat } from 'gl-matrix'
import { BasicShader } from '../ts/shaderProgram'
import { Transform } from './transform'
declare let gl: WebGLRenderingContext

interface iPhongLight {
    position: vec3;
    la: vec3;
    ld: vec3;
    ls: vec3;
}

class PhongLight extends Transform implements iPhongLight {
    la: vec3 = vec3.fromValues(0.5, 0.5, 0.5);
    ld: vec3 = vec3.fromValues(0.5, 0.5, 0.5);
    ls: vec3 = vec3.fromValues(0.9, 0.9, 0.9);

    constructor () { super() }

    setAmbient (x: number, y: number, z: number): PhongLight { this.la = vec3.fromValues(x, y, z); return this }
    setDiffuse (x: number, y: number, z: number): PhongLight { this.ld = vec3.fromValues(x, y, z); return this }
    setSpecular (x: number, y: number, z: number): PhongLight { this.ls = vec3.fromValues(x, y, z); return this }
}

export {
  iPhongLight,
  PhongLight
}
