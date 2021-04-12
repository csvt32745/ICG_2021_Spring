/* https://github.com/toji/gl-matrix */
/*  */
// import { mat4 } from "./js/glMatrix";
import { mat4 } from "gl-matrix";
import { vec3 } from "./js/glMatrix.js";
import "./js/webgl-utils.js";

/* Custom Module */
import { ModelObject } from "./ts/object";

declare global {
    interface Window {
        // from webgl-utils
        requestAnimFrame: Function;
    }
    var gl: WebGLRenderingContext;
}

window.onload = () => webGLStart();

// common variables
declare var gl: WebGLRenderingContext;
var shaderProgram;
var mvMatrix: mat4 = mat4.create();
var pMatrix: mat4 = mat4.create();
var invT_mvMatrix: mat4 = mat4.create();
var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer;
var teapotVertexFrontColorBuffer;

var teapotAngle = 20;
var lastTime    = 0;

var m: ModelObject;

class Camera {
    viewportWidth: number; 
    viewportHeight: number;
    
    constructor(viewport: {width: number, height: number}){
        this.viewportWidth = viewport.width;
        this.viewportHeight = viewport.height;
    }
}
var camera: Camera;

function initGL(canvas: HTMLCanvasElement) {
    try {
        global.gl = <WebGLRenderingContext> canvas.getContext("webgl") || <WebGLRenderingContext> canvas.getContext("experimental-webgl");
        camera = new Camera({width: canvas.width, height: canvas.height});
    } 
    catch (e) {
    }

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, name: string) {
    var vert_shader = gl.createShader(gl.VERTEX_SHADER);
    var shader_src = require(`${name}.vert`).default;
    gl.shaderSource(vert_shader, shader_src);
    gl.compileShader(vert_shader);

    var frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
    shader_src = require(`${name}.frag`).default;
    gl.shaderSource(frag_shader, shader_src);
    gl.compileShader(frag_shader);


    if (!gl.getShaderParameter(vert_shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vert_shader));
        return null;
    } else if (!gl.getShaderParameter(frag_shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(frag_shader));
        return null;
    }

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vert_shader);
    gl.attachShader(shaderProgram, frag_shader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
    return shaderProgram;
}

function initShaders() {
    
    var shaderProgram = getShader(gl, './v');
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexFrontColorAttribute = gl.getAttribLocation(shaderProgram, "aFrontColor");
    gl.enableVertexAttribArray(shaderProgram.vertexFrontColorAttribute);
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.pMatrixUniform  = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.invT_mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uinvTMVMatrix");
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.invT_mvMatrixUniform, false, invT_mvMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function handleLoadedTeapot(modelData) {
    
    teapotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), gl.STATIC_DRAW);
    teapotVertexPositionBuffer.itemSize = 3;
    teapotVertexPositionBuffer.numItems = modelData.vertexPositions.length / 3;

    teapotVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexNormals), gl.STATIC_DRAW);
    teapotVertexNormalBuffer.itemSize = 3;
    teapotVertexNormalBuffer.numItems = modelData.vertexNormals.length / 3;

    teapotVertexFrontColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexFrontColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexFrontcolors), gl.STATIC_DRAW);
    teapotVertexFrontColorBuffer.itemSize = 3;
    teapotVertexFrontColorBuffer.numItems = modelData.vertexFrontcolors.length / 3;
}

function loadModel(name: string) {
    var request = new XMLHttpRequest();
    request.open("GET", `./model/${name}.json`);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            handleLoadedTeapot(JSON.parse(request.responseText));
        }
    }
    request.send();
}

/*
    TODO HERE:
    add two or more objects showing on the canvas
    (it needs at least three objects showing at the same time)
*/
function drawScene() {
    gl.viewport(0, 0, camera.viewportWidth, camera.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // if (teapotVertexPositionBuffer   == null || 
    //     teapotVertexNormalBuffer     == null || 
    //     teapotVertexFrontColorBuffer == null) {
        
    //     return;
    // }
    if(!m.isLoaded) return;

    // Setup Projection Matrix
    mat4.perspective(pMatrix, 45, camera.viewportWidth / camera.viewportHeight, 0.1, 100.0);

    // Setup Model-View Matrix
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, -50]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(teapotAngle), [0, 1, 0]);

    //invT_mvMatrix = Object.assign({}, mvMatrix)
    mat4.invert(invT_mvMatrix, mvMatrix);
    mat4.transpose(invT_mvMatrix, invT_mvMatrix);

    setMatrixUniforms();
    m.draw(shaderProgram);
}


/* WebGL Util */

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        teapotAngle += 0.1 * elapsed;
    }
    
    lastTime = timeNow;
}

function tick() {
    // window.requestAnimationFrame(tick);
    window.requestAnimFrame(tick);
    drawScene();
    animate();
}

function webGLStart() {
    // var canvas = <HTMLCanvasElement> document.getElementById("ICG-canvas");
    var canvas = <HTMLCanvasElement> document.createElement("canvas")
    canvas.id = "ICG-canvas"
    canvas.style.backgroundColor = "#0078D4"
    canvas.width  = 640;
    canvas.height = 360;
    // canvas.style.position = "fixed"
    // canvas.style.bottom = "10px"
    // canvas.style.right = "20px"
    // canvas.style.width = "1920"
    // canvas.style.height = "1080"

    initGL(canvas);
    initShaders();
    // loadModel('Teapot');
    m = new ModelObject(vec3.fromValues(0, 0, 0), 'Teapot');


    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.body.appendChild(canvas)
    tick();
}

