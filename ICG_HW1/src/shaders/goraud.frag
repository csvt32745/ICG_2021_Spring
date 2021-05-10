precision highp float;

varying vec3 fragcolor;

void main(void) {
    gl_FragColor.rgb = fragcolor;
    gl_FragColor.w = 1.;
}