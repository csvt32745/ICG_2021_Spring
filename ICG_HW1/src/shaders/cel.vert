attribute vec3 aVertexPosition;
attribute vec3 aFrontColor;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uinvTMVMatrix;
uniform mat4 uinvTModelMatrix;

varying vec3 fragcolor;
varying vec3 vNormal;
varying vec3 pos;

mat4 transpose(mat4 inMatrix) { 
    vec4 i0 = inMatrix[0]; 
    vec4 i1 = inMatrix[1]; 
    vec4 i2 = inMatrix[2]; 
    vec4 i3 = inMatrix[3]; 

    mat4 outMatrix = mat4(
       vec4(i0.x, i1.x, i2.x, i3.x), 
       vec4(i0.y, i1.y, i2.y, i3.y), 
       vec4(i0.z, i1.z, i2.z, i3.z), 
       vec4(i0.w, i1.w, i2.w, i3.w) 
       ); 

    return outMatrix; 
} 

void main(void) {
    fragcolor = aFrontColor;
    // pos = aVertexPosition;
    pos = (uModelMatrix * vec4(aVertexPosition, 1)).xyz;
    // normal = normalize(aNormal);
    vNormal = ((uinvTModelMatrix * vec4(aNormal, 0.0)).xyz);

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}