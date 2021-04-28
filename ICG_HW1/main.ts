/* https://github.com/toji/gl-matrix */
import { mat4, vec3, quat } from "gl-matrix";
import "./js/webgl-utils.js";

/* Custom Module */
import { ModelObject } from "./ts/object";
import { BasicShader } from "./ts/shaderProgram";
import { Camera } from "./ts/camera";

declare global {
    interface Window {
        // from webgl-utils
        requestAnimFrame: Function;
    }
    var gl: WebGLRenderingContext;
    var elapsed_time: number;
}

window.onload = () => webGLStart();

// common variables
declare var gl: WebGLRenderingContext;
declare var elapsed_time: number;

var teapotAngle = 20;
var lastTime    = 0;

var scene_objects: { [name: string]: ModelObject } = {}
var shader_programs: { [name: string]: BasicShader } = {}

var camera: Camera;

function webGLStart() {
    var canvas = <HTMLCanvasElement> document.createElement("canvas")
    canvas.id = "ICG-canvas"
    canvas.style.backgroundColor = "#0078D4"
    canvas.width  = 1280;
    canvas.height = 720;
    camera = new Camera({width: canvas.width, height: canvas.height});
    camera.position = vec3.fromValues(0 , 0, -35);
    global.elapsed_time = .1;

    initGL(canvas);
    shader_programs["phong"] = new BasicShader('v');
    shader_programs["goraud"] = new BasicShader('goraud');
    shader_programs["flat"] = new BasicShader('flat');

    scene_objects["easter"] = new ModelObject(shader_programs["phong"], 'Easter').setScale(10).setRot(-90, 0, 0).setPos(-15, 0, 0);
    scene_objects["teapot"] = new ModelObject(shader_programs["flat"], 'Teapot').setScale(0.5);
    scene_objects["csie"] = new ModelObject(shader_programs["goraud"], 'Kangaroo').setScale(30).setRot(-45, 0, 0).setPos(20, 0, 0);

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    document.body.appendChild(canvas)
    tick();
}


function initGL(canvas: HTMLCanvasElement) {
    try {
        global.gl = <WebGLRenderingContext> canvas.getContext("webgl") || <WebGLRenderingContext> canvas.getContext("experimental-webgl");
        if(!gl.getExtension('OES_standard_derivatives')){
            throw('OES std extension not supported!')
        }
    } 
    catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function update() {
    teapotAngle += 0.05 * elapsed_time;
    scene_objects['teapot'].setRot(0, teapotAngle, 0); 
}

function draw() {
    gl.viewport(0, 0, camera.viewportWidth, camera.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.setMVP();
    let world_mat = camera.getMVP();
    Object.entries(shader_programs).forEach(
        ([, prog]) => prog.setWorldMatrixUniforms(world_mat)
    );
    Object.entries(scene_objects).forEach(
        ([, obj]) => obj.draw()
    );
}


/* WebGL Util */

function updateTime() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        elapsed_time = timeNow - lastTime;
    }
    lastTime = timeNow;
}

function tick() {
    // window.requestAnimationFrame(tick);
    window.requestAnimFrame(tick);
    update();
    draw();
    updateTime();
}


