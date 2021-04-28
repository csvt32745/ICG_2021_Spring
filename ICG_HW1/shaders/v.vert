attribute vec3 aVertexPosition;
attribute vec3 aFrontColor;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uinvTMVMatrix;
uniform mat4 uinvTModelMatrix;

varying vec4 fragcolor;
varying vec3 normal;
varying vec3 pos;

void main(void) {
    fragcolor = vec4(aFrontColor.rgb, 1.0);
    pos = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;
    gl_Position = uPMatrix * uMVMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
    normal = normalize((uinvTMVMatrix * uinvTModelMatrix * vec4(aNormal, 0.0)).xyz);
}