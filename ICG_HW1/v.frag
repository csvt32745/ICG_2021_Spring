precision mediump float;

varying vec4 fragcolor;
varying vec3 normal;
varying vec3 pos;


void main(void) {
    vec3 viewDir = normalize(vec3(0, 0, 50));

    if(abs(dot(viewDir, normal)) < 0.45){
        gl_FragColor = vec4(0, 0, 0, 1);
        return;
    }

    vec3 lightPos = vec3(50, 50, 20);
    vec3 dir = normalize(lightPos - pos);
    vec3 lightCor = vec3(0.5, .5, .5);
    float lightIntensity = 1.;
    //dir = normalize(vec3(0, 1, 1));


    float dif = dot(normalize(normal), dir);
    if(dif > .6) dif = 0.8;
    else if(dif > .25) dif = .3;
    

    gl_FragColor = vec4(.5, .0, .0, 1);
    // gl_FragColor.rgb *= 0.4;
    gl_FragColor.rgb += lightCor * dif * lightIntensity;
    vec3 halfDir = normalize(viewDir + dir);
    float _spec = 1.;
    float _gloss = 10.;
    float spec = _spec * pow(clamp(dot(normal, halfDir), 0., 1.),  _gloss);
    spec = step(0.7, spec);
    gl_FragColor.rgb += lightCor*spec;
}