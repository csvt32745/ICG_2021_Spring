import { mat4, vec3, quat } from "gl-matrix";

class Camera {
    position: vec3 = vec3.create();
    rotation: quat = quat.create();

    viewportWidth: number; 
    viewportHeight: number;
    FOV: number = 45;

    mvMatrix: mat4 = mat4.create();
    pMatrix: mat4 = mat4.create();
    invT_mvMatrix: mat4 = mat4.create();

    constructor(viewport: {width: number, height: number}){
        this.viewportWidth = viewport.width;
        this.viewportHeight = viewport.height;
    }

    setMVP(): void {
        // Setup Projection Matrix
        mat4.perspective(this.pMatrix, this.FOV, this.viewportWidth / this.viewportHeight, 0.1, 100.0);

        // Setup Model-View Matrix
        mat4.fromQuat(this.mvMatrix, this.rotation);
        mat4.translate(this.mvMatrix, this.mvMatrix, this.position);
        
        mat4.invert(this.invT_mvMatrix, this.mvMatrix);
        mat4.transpose(this.invT_mvMatrix, this.invT_mvMatrix);
    }

    getMVP() {
        return {
            pMatrix: this.pMatrix,
            mvMatrix: this.mvMatrix,
            invT_mvMatrix: this.invT_mvMatrix
        }
    }
}

export {
    Camera
};