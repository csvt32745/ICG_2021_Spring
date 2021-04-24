import { Interface } from "node:readline";

declare var gl: WebGLRenderingContext;

interface UniformLocation {

}

class BasicShader{
    shaderProgram: WebGLProgram;
    
    vertexPositionAttribute?: GLint;
    vertexFrontColorAttribute?: GLint;
    vertexNormalAttribute?: GLint;
    
    pMatrixUniform?: WebGLUniformLocation;
    mvMatrixUniform?: WebGLUniformLocation;
    invT_mvMatrixUniform?: WebGLUniformLocation;

    constructor(shader_name: string) {
        this.getShader(shader_name);
        this.initShaders();
    }

    getShader(name: string): void {
        var vert_shader = gl.createShader(gl.VERTEX_SHADER);
        // console.log(require('../v.vert'))
        var shader_src = require(`../${name}.vert`).default;
        gl.shaderSource(vert_shader, shader_src);
        gl.compileShader(vert_shader);
    
        var frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
        shader_src = require(`../${name}.frag`).default;
        gl.shaderSource(frag_shader, shader_src);
        gl.compileShader(frag_shader);
    
        if (!gl.getShaderParameter(vert_shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(vert_shader));
            return null;
        } else if (!gl.getShaderParameter(frag_shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(frag_shader));
            return null;
        }
        
        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vert_shader);
        gl.attachShader(this.shaderProgram, frag_shader);
        gl.linkProgram(this.shaderProgram);
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
    }
    
    initShaders(): void {
        gl.useProgram(this.shaderProgram);
    
        this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        this.vertexFrontColorAttribute = gl.getAttribLocation(this.shaderProgram, "aFrontColor");
        gl.enableVertexAttribArray(this.vertexFrontColorAttribute);
        this.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "aNormal");
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
    
        this.pMatrixUniform  = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        this.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        this.invT_mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uinvTMVMatrix");
    }

    setMatrixUniforms(pMatrix, mvMatrix, invT_mvMatrix): void {
        gl.uniformMatrix4fv(this.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(this.mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix4fv(this.invT_mvMatrixUniform, false, invT_mvMatrix);
    }
}


export {
    BasicShader
};