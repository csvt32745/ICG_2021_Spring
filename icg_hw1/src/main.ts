/* https://github.com/toji/gl-matrix */
import { mat4, vec3, quat } from 'gl-matrix'
import './js/webgl-utils'
import { createApp } from 'vue'
import App from './App.vue'
import SceneObjectListComponent from './components/SceneObjectList.vue'

/* Custom Module */
import { Transform, degToRad } from './ts/transform'
import { ModelObject } from './ts/modelObject'
import { BasicShader } from './ts/shaderProgram'
import { Camera } from './ts/camera'
import { PhongLight, Shadow } from './ts/light'
// import { Vue } from 'vue-class-component'

window.onload = () => webGLStart();
window.onresize = () => setCanvasSize();

declare global {
    interface Window {
        // from webgl-utils
        requestAnimFrame: Function
    }
    var gl: WebGLRenderingContext
    var elapsed_time: number

    var scene_objects: { [name: string]: ModelObject };
    var shader_programs: { [name: string]: BasicShader };
    var lights: PhongLight[];
    var camera: Camera;
    var texture_list: string[];
}


// common variables
declare var gl: WebGLRenderingContext;
declare var elapsed_time: number;
declare var scene_objects: { [name: string]: ModelObject };
declare var shader_programs: { [name: string]: BasicShader };
declare var lights: PhongLight[];
declare var camera: Camera;
declare var texture_list: string[];

var teapotAngle = 20;
var lastTime    = 0;
var canvas: HTMLCanvasElement = document.createElement("canvas");
var shadow: Shadow;
var shadow_shader: BasicShader;

function initGlobalVariables() {
    global.lights = []
    global.scene_objects = {}
    global.shader_programs = {}
    global.elapsed_time = .1;
    global.camera = new Camera({width: canvas.width, height: canvas.height});
    global.texture_list = [
        'debug.png',
        'debug_white.png',
        'debug_yellow.png',
    ]
}

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight/2;
    camera.viewportWidth = canvas.width;
    camera.viewportHeight = canvas.height;
}

function webGLStart() {
    canvas.id = "ICG-canvas"
    canvas.width  = 1280;
    canvas.height = 720;
    canvas.style.backgroundColor = "#0078D4"
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.position = 'fixed'
    initGL(canvas);
    initGlobalVariables();
    setCanvasSize();
    
    camera.setPos(0 , 0, 30);
    
    var l = new PhongLight().setDiffuse(.9, .2, .2).setAttenuation(300);
    l.setPos(-15, 10, 0);
    lights.push(l);
    
    l = new PhongLight().setAmbient(.1, .1, .1).setDiffuse(.9, .9, .9).setSpecular(.5, .5, .5).setAttenuation(100);
    l.setPos(0, 25, 0);
    lights.push(l);

    l = new PhongLight().setAmbient(0, 0, 0).setDiffuse(.5, .5, .5).setSpecular(.0, .0, .0).setAttenuation(500);
    l.setPos(0, 50, 50);
    lights.push(l); 
    
    shadow = new Shadow(lights[0]);
    shadow_shader = new BasicShader('shadow');

    shader_programs["phong"] = new BasicShader('phong');
    shader_programs["goraud"] = new BasicShader('goraud');
    shader_programs["flat"] = new BasicShader('flat');
    shader_programs["cel"] = new BasicShader('cel');
    shader_programs["custom"] = new BasicShader('custom');

    scene_objects["plane"] = new ModelObject(
        shader_programs["custom"], 'plane', 'debug.png')
        .setScale(100).setPos(0, -10, 0).setRot(0, 0, 0).setGloss(16);
    scene_objects["easter"] = new ModelObject(shader_programs["flat"], 'Easter')
        .setScale(10).setRot(-90, 0, 0).setPos(-15, 0, 0).setGloss(4);
    scene_objects["easter2"] = new ModelObject(shader_programs["phong"], 'Easter')
        .setScale(10).setRot(-90, -0, 0).setPos(15, 0, 0).setGloss(64);
    scene_objects["teapot"] = new ModelObject(
        shader_programs["custom"], 'Teapot', 'debug_yellow.png')
        .setScale(0.5).setGloss(32);
    // scene_objects["kangaroo"] = new ModelObject(shader_programs["phong"], 'Kangaroo').setScale(20).setRot(-90, 0, 0).setPos(20, 10, 0);

    var vm = createApp(SceneObjectListComponent)
    vm.mount('#app')
    
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
        if(!gl.getExtension('WEBGL_depth_texture')){
            throw('Depth texture extension not supported!')
        }
        if(!gl.getExtension('EXT_frag_depth')){
            throw('Depth texture extension not supported!')
        }
    } 
    catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function tick() {
    // window.requestAnimationFrame(tick);
    window.requestAnimFrame(tick);
    update();
    
    // depth maps
    // drawShadow(shadow, shadow_shader);
    shadow.setPosRot();
    shadow.view.setMVP();
    let mat = shadow.getMatrix();
    // let mat = mat4.create();
    Object.entries(shader_programs).forEach(
        ([, prog]) => {
            prog.setDepthMatrixUniforms(shadow.depthTextureSize, mat, shadow.depthTexture);
        }
    );
    // rendering
    // draw(shadow.view);
    draw();
    updateTime();
}


function update() {
    teapotAngle += degToRad(0.03) * elapsed_time;
    // scene_objects['teapot'].rotateY(degToRad(0.05) * elapsed_time); 
    // scene_objects['easter'].rotateZ(degToRad(0.05) * elapsed_time); 
    // scene_objects['kangaroo'].rotateZ(degToRad(0.01) * elapsed_time); 
    lights[0].setPos(30*Math.cos(teapotAngle), lights[0].position[1], 30*Math.sin(teapotAngle))
    lights[1].setPos(0, lights[1].position[1], 100*Math.cos(teapotAngle*2))
    // scene_objects['teapot'].translate(0, 0, -.01 * elapsed_time);
    // camera.rotateY(degToRad(0.05) * elapsed_time);
}

function draw(
    view: Camera = camera,
    shaders:{ [name: string]: BasicShader } | BasicShader[] = shader_programs,
    )
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.CULL_FACE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, view.viewportWidth, view.viewportHeight);
    
    let world_mat = view.setMVP();
    Object.entries(shaders).forEach(
        ([, prog]) => {
            prog.setWorldMatrixUniforms(world_mat);
            prog.setLightUniforms(lights);
            prog.setCamPosUniform(view.position);
        }
    );
    Object.entries(scene_objects).forEach(
        ([, obj]) => obj.draw()
    );
}

function drawShadow(
    shadow: Shadow, shader: BasicShader
    )
{
    shadow.setFrameBuffer();
    let view = shadow.view;
    // gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, view.viewportWidth, view.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let world_mat = view.setMVP();
    shader.setWorldMatrixUniforms(world_mat);
    shader.setLightUniforms(lights);
    shader.setCamPosUniform(view.position);
    Object.entries(scene_objects).forEach(
        ([, obj]) => {
            // let s = obj.shaderProgram;
            // obj.shaderProgram = shader;
            obj.draw()
            // obj.shaderProgram = s;
        }
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


function updateTime() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        elapsed_time = timeNow - lastTime;
    }
    lastTime = timeNow;
}