attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 projected_pos;

void main(void) {
    projected_pos = uPMatrix * uMVMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = projected_pos;
}