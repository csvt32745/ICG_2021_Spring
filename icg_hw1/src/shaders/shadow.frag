// #extension GL_OES_standard_derivatives : enable
// #extension GL_EXT_frag_depth : enable
precision highp float;

varying vec4 projected_pos;

void main(void) {
    float depth = (projected_pos.xyz / projected_pos.w).z;
    // gl_FragColor = -vec4(depth);
    gl_FragColor = vec4(1.,0.,0., 1.);
    gl_FragColor.w = 1.;
    // gl_FragDepthEXT = depth*0.5 + 0.5;
}