import { Interface } from "node:readline";
import { mat4, vec3, quat } from "gl-matrix";

declare var gl: WebGLRenderingContext;

class BasicShader {
    shaderProgram: WebGLProgram;
    
    vertexPositionAttribute?: GLint;
    vertexFrontColorAttribute?: GLint;
    vertexNormalAttribute?: GLint;
    
    modelMatrixUniform?: WebGLUniformLocation;
    invT_modelMatrixUniform?: WebGLUniformLocation;
    mvMatrixUniform?: WebGLUniformLocation;
    invT_mvMatrixUniform?: WebGLUniformLocation;
    pMatrixUniform?: WebGLUniformLocation;

    constructor(shader_name: string) {
        this.getShader(shader_name);
        this.initShaders();
    }

    getShader(name: string): void {
        var vert_shader = gl.createShader(gl.VERTEX_SHADER);
        // console.log(require('../goraud.vert'))
        var shader_src = require(`../shaders/${name}.vert`).default;
        gl.shaderSource(vert_shader, shader_src);
        gl.compileShader(vert_shader);
    
        var frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
        shader_src = require(`../shaders/${name}.frag`).default;
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
        this.modelMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uModelMatrix");
        this.invT_modelMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uinvTModelMatrix");
    }

    setWorldMatrixUniforms(mvp: {pMatrix: mat4, mvMatrix: mat4, invT_mvMatrix: mat4}): void {
        gl.useProgram(this.shaderProgram);
        gl.uniformMatrix4fv(this.pMatrixUniform, false, mvp.pMatrix);
        gl.uniformMatrix4fv(this.mvMatrixUniform, false, mvp.mvMatrix);
        gl.uniformMatrix4fv(this.invT_mvMatrixUniform, false, mvp.invT_mvMatrix);
    }
}


export {
    BasicShader
};