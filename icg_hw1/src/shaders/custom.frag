precision highp float;

varying vec3 fragcolor;
varying vec3 vNormal;
varying vec3 pos;
varying vec2 uv;

uniform sampler2D tex;
uniform bool tex_enabled;

struct Light {
    bool enabled;
    vec3 position;
    vec3 la; // Ambient
    vec3 ld; // Diffuse
    vec3 ls; // Specular
    float attenuation;
};


uniform float gloss;
uniform Light lights[4];
uniform vec3 uCamPos;

void main(void) {
    gl_FragColor = vec4(0, 0, 0, 1);
    vec3 color;
    if(tex_enabled){
        vec2 uv_ = uv;
        // uv_ = uv_*0.2;
        // uv_.y *= -1.;
        color = texture2D(tex, uv_).rgb;
        // gl_FragColor = texture2D(tex, uv_);
        // return;
    }
    else{
        color = fragcolor;
    }
    // vec3 camPos = uCamPos;
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uCamPos - pos);
    // float rim = dot(normal, viewDir);
    // if(rim < 0.2){
    //     return;
    // }else if(rim < .4){
    //     gl_FragColor.rgb = vec3(1.- .2*smoothstep(.2, .4, rim));
    //     return;
    // }
    // vec3 color = vec3(1, 0 ,0);
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