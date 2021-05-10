attribute vec3 aVertexPosition;
attribute vec3 aFrontColor;
// attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 fragcolor;
varying vec3 pos;


void main(void) {
    pos = (uModelMatrix * vec4(aVertexPosition, 1.0)).xyz;
    fragcolor = aFrontColor;
    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}