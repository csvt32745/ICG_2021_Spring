precision mediump float;

varying vec4 fragcolor;
varying vec3 normal;
varying vec3 pos;


void main(void) {
    vec3 lightPos = vec3(50, 50, 20);
    vec3 lightCor = vec3(0.5, .5, .5);
    float lightIntensity = 1.;
    vec3 dir = normalize(lightPos - pos);
    //dir = normalize(vec3(0, 1, 1));


    float dif = dot(normalize(normal), dir);
    if(dif > .6) dif = 0.8;
    else if(dif > .25) dif = .3;
    // dif = step(0.25, dif)*0.5;
    // if(dif < 1e-9) dif = step(0.6, dif)*0.8;
    // dif = (dif<.0)? .0 : (dif>1.)? 1. : dif;

    gl_FragColor = vec4(.5, .1, .1, 1);
    // gl_FragColor.rgb *= 0.4;
    gl_FragColor.rgb += lightCor * dif * lightIntensity;
    vec3 viewDir = normalize(vec3(0, 0, 50));
    vec3 halfDir = normalize(viewDir + dir);
    float _spec = 1.;
    float _gloss = 10.;
    float spec = _spec * pow(clamp(dot(normal, halfDir), 0., 1.),  _gloss);
    spec = step(0.7, spec);
    gl_FragColor.rgb += lightCor*spec;
}