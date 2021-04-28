attribute vec3 aVertexPosition;
// attribute vec3 aFrontColor;
// attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 pos;

void shading() {
}

void main(void) {
    pos = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;
    gl_Position = uPMatrix * uMVMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
}