attribute vec3 aVertexPosition;
attribute vec3 aFrontColor;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uinvTModelMatrix;
uniform mat4 uDepthMatrix;
// uniform mat4 lightspaceMatrices[4];

varying vec3 fragcolor;
varying vec3 vNormal;
varying vec3 pos;
varying vec2 uv;
varying vec4 depth_pos;

void main(void) {
    fragcolor = aFrontColor;
    uv = aUV;
    pos = (uModelMatrix * vec4(aVertexPosition, 1)).xyz;
    vNormal = ((uinvTModelMatrix * vec4(aNormal, 0.0)).xyz);
    depth_pos = uDepthMatrix * vec4(pos, 1.0);
    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
    // gl_Position = depth_pos;
    // depth_pos = gl_Position;
    // gl_Position = depth_pos;
}