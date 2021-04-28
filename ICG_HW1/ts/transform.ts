import { mat4, vec3, quat } from "gl-matrix";
declare var gl: WebGLRenderingContext;


class Transform {
    position: vec3 = vec3.zero(vec3.create());
    rotation: quat = quat.create();
    scale: vec3 = vec3.fromValues(1, 1, 1);
    
    constructor() {}

    setScale(s: number): Transform { vec3.scale(this.scale, this.scale, s); return this; }
    setScaleXYZ(x: number, y: number, z: number): Transform { this.scale = vec3.fromValues(x, y, z); return this; }

    setPos(x: number, y: number, z: number): Transform { this.position = vec3.fromValues(x, y, z); return this; }
    translate(x: number, y: number, z: number): Transform { vec3.add(this.position, this.position, vec3.fromValues(x, y, z)); return this; }

    setRot(x: number, y: number, z: number): Transform { this.rotation = quat.fromEuler(quat.create(), x, y, z); return this; }
    rotateX(r: number): Transform { quat.rotateX(this.rotation, this.rotation, r); return this; }
    rotateY(r: number): Transform { quat.rotateY(this.rotation, this.rotation, r); return this; }
    rotateZ(r: number): Transform { quat.rotateZ(this.rotation, this.rotation, r); return this; }
    rotateAxis(r: number, axis: vec3): Transform { quat.multiply(this.rotation, this.rotation, quat.setAxisAngle(quat.create(), axis, r)); return this; }
}

export {
    Transform
};