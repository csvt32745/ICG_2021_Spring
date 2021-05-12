import { mat4, vec3, quat } from 'gl-matrix'
declare let gl: WebGLRenderingContext

class Transform {
    position: vec3 = vec3.zero(vec3.create());
    rotation: quat = quat.create();
    scale: vec3 = vec3.fromValues(1, 1, 1);

    constructor () {}

    setScale (s: number): Transform { vec3.scale(this.scale, this.scale, s); return this }
    setScaleXYZ (x: number, y: number, z: number): Transform { this.scale = vec3.fromValues(x, y, z); return this }

    setPos (x: number, y: number, z: number): Transform { this.position = vec3.fromValues(x, y, z); return this }
    translate (x: number, y: number, z: number): Transform { vec3.add(this.position, this.position, vec3.fromValues(x, y, z)); return this }

    setRot (x: number, y: number, z: number): Transform { this.rotation = quat.fromEuler(quat.create(), x, y, z); return this }
    rotateX (r: number): Transform { quat.rotateX(this.rotation, this.rotation, r); return this }
    rotateY (r: number): Transform { quat.rotateY(this.rotation, this.rotation, r); return this }
    rotateZ (r: number): Transform { quat.rotateZ(this.rotation, this.rotation, r); return this }
    rotateAxis (r: number, axis: vec3): Transform { quat.multiply(this.rotation, this.rotation, quat.setAxisAngle(quat.create(), axis, r)); return this }
}

export function getEuler(out, quat) {
  let x = quat[0],
    y = quat[1],
    z = quat[2],
    w = quat[3],
    x2 = x * x,
    y2 = y * y,
    z2 = z * z,
    w2 = w * w;
  let unit = x2 + y2 + z2 + w2;
  let test = x * w - y * z;
  if (test > 0.499995 * unit) { //TODO: Use glmatrix.EPSILON
    // singularity at the north pole
    out[0] = Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else if (test < -0.499995 * unit) { //TODO: Use glmatrix.EPSILON
    // singularity at the south pole
    out[0] = -Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else {
    out[0] = Math.asin(2 * (x * z - w * y));
    out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
    out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
  }
  // TODO: Return them as degrees and not as radians
  
  out.forEach((val, i) => {
    out[i] = (val/Math.PI*180)
  })
  return out;
}

export {
  Transform
}
