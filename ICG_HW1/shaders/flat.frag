#extension GL_OES_standard_derivatives : enable
precision highp float;

// varying vec4 fragcolor;
varying vec3 pos;

void main(void) {
    // Normal
    vec3 dx = dFdx(pos);
    vec3 dy = dFdy(pos);
    vec3 normal = normalize(cross(dx, dy));

    // Color
    vec3 viewDir = normalize(vec3(0, 0, 50));
    vec3 lightPos = vec3(50, 50, 20);
    
    vec3 dir = normalize(lightPos - pos);
    vec3 lightCor = vec3(0.5, .5, .5);
    float lightIntensity = 1.;
    float dif = dot(normalize(normal), dir);

    gl_FragColor = vec4(.5, .0, .0, 1);
    gl_FragColor.rgb += lightCor * dif * lightIntensity;
    vec3 halfDir = normalize(viewDir + dir);
    float _spec = 1.;
    float _gloss = 10.;
    float spec = _spec * pow(clamp(dot(normal, halfDir), 0., 1.),  _gloss);
    spec = step(0.7, spec);
    gl_FragColor.rgb += lightCor*spec;
}