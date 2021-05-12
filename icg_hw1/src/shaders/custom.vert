attribute vec3 aVertexPosition;
attribute vec3 aFrontColor;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uinvTMVMatrix;
uniform mat4 uinvTModelMatrix;

varying vec3 fragcolor;
varying vec3 vNormal;
varying vec3 pos;
varying vec2 uv;

void main(void) {
    fragcolor = aFrontColor;
    uv = aUV;
    // pos = aVertexPosition;
    pos = (uModelMatrix * vec4(aVertexPosition, 1)).xyz;
    // normal = normalize(aNormal);
    vNormal = ((uinvTModelMatrix * vec4(aNormal, 0.0)).xyz);

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}