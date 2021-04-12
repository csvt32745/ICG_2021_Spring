precision mediump float;

varying vec4 fragcolor;
varying vec3 normal;
varying vec3 pos;


void main(void) {
    vec3 lightPos = vec3(50, -10, 0);
    vec3 lightCor = vec3(0.5, .5, .5);
    vec3 dir = normalize(lightPos - pos);
    //dir = normalize(vec3(0, 1, 1));


    float dif = dot(normalize(normal), dir);
    // dif = (dif<.0)? .0 : (dif>1.)? 1. : dif;

    gl_FragColor = vec4(.5, 0, 0, 1);
    gl_FragColor.rgb *= 0.4;
    gl_FragColor.rgb += lightCor * dif;
}