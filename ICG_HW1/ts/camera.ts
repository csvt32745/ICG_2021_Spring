import { mat4, vec3, quat } from "gl-matrix";
import { Transform } from "./transform"

class Camera extends Transform {
    viewportWidth: number; 
    viewportHeight: number;
    FOV: number = 45;

    mvMatrix: mat4 = mat4.create();
    pMatrix: mat4 = mat4.create();
    invT_mvMatrix: mat4 = mat4.create();

    constructor(viewport: {width: number, height: number}){
        super();
        this.viewportWidth = viewport.width;
        this.viewportHeight = viewport.height;
    }

    setMVP() {
        // Setup Projection Matrix
        mat4.perspective(this.pMatrix, this.FOV, this.viewportWidth / this.viewportHeight, 0.1, 300.0);

        // Setup Model-View Matrix
        mat4.fromRotationTranslation(this.mvMatrix, this.rotation, this.position);
        mat4.invert(this.mvMatrix, this.mvMatrix);
        
        mat4.invert(this.invT_mvMatrix, this.mvMatrix);
        mat4.transpose(this.invT_mvMatrix, this.invT_mvMatrix);
        return this.getMVP()
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