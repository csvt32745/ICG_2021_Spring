/* https://github.com/toji/gl-matrix */
import "./js/glMatrix";
import { mat4 } from "./js/glMatrix";
import "./js/webgl-utils.js";

window.onload = () => webGLStart();


// common variables
var gl;
var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix  = mat4.create();
var invT_mvMatrix = mat4.create();
var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer;
var teapotVertexFrontColorBuffer;

var teapotAngle = 20;
var lastTime    = 0;

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth  = canvas.width;
        gl.viewportHeight = canvas.height;
    } 
    catch (e) {
    }

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function getShader(gl, id) {
    var shaderScript = <HTMLScriptElement> document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var shaderSource = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            shaderSource += k.textContent;
        }

        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } 
    else if (shaderScript.type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else {
        return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders() {
    var fragmentShader = getShader(gl, "fragmentShader");
    var vertexShader   = getShader(gl, "vertexShader");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

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

function handleLoadedTeapot(teapotData) {
    teapotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexPositions), gl.STATIC_DRAW);
    teapotVertexPositionBuffer.itemSize = 3;
    teapotVertexPositionBuffer.numItems = teapotData.vertexPositions.length / 3;

    teapotVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexNormals), gl.STATIC_DRAW);
    teapotVertexNormalBuffer.itemSize = 3;
    teapotVertexNormalBuffer.numItems = teapotData.vertexNormals.length / 3;

    teapotVertexFrontColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexFrontColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexFrontcolors), gl.STATIC_DRAW);
    teapotVertexFrontColorBuffer.itemSize = 3;
    teapotVertexFrontColorBuffer.numItems = teapotData.vertexFrontcolors.length / 3;
}

function loadTeapot() {
    var request = new XMLHttpRequest();
    request.open("GET", "./model/Teapot.json");
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
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (teapotVertexPositionBuffer   == null || 
        teapotVertexNormalBuffer     == null || 
        teapotVertexFrontColorBuffer == null) {
        
        return;
    }

    // Setup Projection Matrix
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    // Setup Model-View Matrix
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, -50]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(teapotAngle), [0, 1, 0]);

    //invT_mvMatrix = Object.assign({}, mvMatrix)
    mat4.invert(invT_mvMatrix, mvMatrix);
    mat4.transpose(invT_mvMatrix, invT_mvMatrix);

    setMatrixUniforms();

    // Setup teapot position data
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                            teapotVertexPositionBuffer.itemSize, 
                            gl.FLOAT, 
                            false, 
                            0, 
                            0);

    // Setup teapot front color data
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexFrontColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexFrontColorAttribute, 
                            teapotVertexFrontColorBuffer.itemSize, 
                            gl.FLOAT, 
                            false, 
                            0, 
                            0);

    // Setup teapot normal data
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                            teapotVertexNormalBuffer.itemSize, 
                            gl.FLOAT, 
                            false, 
                            0, 
                            0);

    gl.drawArrays(gl.TRIANGLES, 0, teapotVertexPositionBuffer.numItems);
}

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        teapotAngle += 0.1 * elapsed;
    }
    
    lastTime = timeNow;
}

function tick() {
    window.requestAnimationFrame(tick);
    drawScene();
    animate();
}

function webGLStart() {
    // var canvas = <HTMLCanvasElement> document.getElementById("ICG-canvas");
    var canvas = <HTMLCanvasElement> document.createElement("canvas")
    canvas.id = "ICG-canvas"
    canvas.style.backgroundColor = "#0078D4"
    canvas.width  = 1280;
    canvas.height = 720;
    // canvas.style.position = "fixed"
    // canvas.style.bottom = "10px"
    // canvas.style.right = "20px"
    // canvas.style.width = "1920"
    // canvas.style.height = "1080"

    initGL(canvas);
    initShaders();
    loadTeapot();

    gl.clearColor(0.0, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.body.appendChild(canvas)
    tick();
}

