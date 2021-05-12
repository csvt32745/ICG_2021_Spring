#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec3 fragcolor;
varying vec3 vNormal;
varying vec3 pos;

struct Light {
    bool enabled;
    vec3 position;
    vec3 la; // Ambient
    vec3 ld; // Diffuse
    vec3 ls; // Specular
    float attenuation;
};

uniform Light lights[4];
uniform vec3 uCamPos;
uniform float gloss;

void main(void) {
    // Normal
    vec3 dx = dFdx(pos);
    vec3 dy = dFdy(pos);
    vec3 normal = normalize(cross(dx, dy));
    vec3 viewDir = normalize(uCamPos - pos);

    // Color
    gl_FragColor = vec4(0, 0, 0, 1);
    vec3 color = fragcolor.rgb;
    vec3 light_color = vec3(0);
    vec3 spec_color = vec3(0);
    for(int i = 0; i < 4; ++i){
        if(!lights[i].enabled){
            break;
        }
        vec3 lightDir = (lights[i].position - pos);
        float atten = distance(lightDir, vec3(0));
        atten = pow(max(.1, lights[i].attenuation-atten)/lights[i].attenuation, 2.);
        lightDir = normalize(lightDir);

        float dif = dot(normal, lightDir)*atten;
        light_color += (lights[i].la + dif * lights[i].ld);
        
        vec3 halfDir = normalize(viewDir + lightDir);
        float spec = pow(max(dot(normal, halfDir), 0.), gloss)*atten;
        spec_color += (lights[i].ls * spec);
    }
    gl_FragColor.rgb = light_color * color + spec_color;
}