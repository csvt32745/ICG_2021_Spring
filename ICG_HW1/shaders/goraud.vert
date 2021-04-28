attribute vec3 aVertexPosition;
attribute vec3 aFrontColor;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uinvTMVMatrix;
uniform mat4 uinvTModelMatrix;

varying vec4 fragcolor;
vec3 normal;
vec3 pos;

void shading() {
    vec3 viewDir = normalize(vec3(0, 0, 50));
    vec3 lightPos = vec3(50, 50, 20);
    
    vec3 dir = normalize(lightPos - pos);
    vec3 lightCor = vec3(0.5, .5, .5);
    float lightIntensity = 1.;
    float dif = dot(normalize(normal), dir);

    fragcolor = vec4(.5, .0, .0, 1);
    fragcolor.rgb += lightCor * dif * lightIntensity;
    vec3 halfDir = normalize(viewDir + dir);
    float _spec = 1.;
    float _gloss = 10.;
    float spec = _spec * pow(clamp(dot(normal, halfDir), 0., 1.),  _gloss);
    spec = step(0.7, spec);
    fragcolor.rgb += lightCor*spec;
}

void main(void) {
    vec4 pos4 = uMVMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
    pos = pos4.xyz;
    normal = normalize((uinvTMVMatrix * uinvTModelMatrix * vec4(aNormal, 0.0)).xyz);
    gl_Position = uPMatrix * pos4;
    shading();
}