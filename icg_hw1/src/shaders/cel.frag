precision highp float;

// varying vec4 fragcolor;
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
    gl_FragColor = vec4(0, 0, 0, 1);
    vec3 color = fragcolor;
    // vec3 camPos = uCamPos;
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uCamPos - pos);
    float rim = dot(normal, viewDir);
    if(rim < 0.2){
        return;
    }else if(rim < .4){
        gl_FragColor.rgb = vec3(1.- .2*smoothstep(.2, .4, rim));
        return;
    }
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
        if(dif > 0.6) dif = .8;
        else dif = dif*0.1;
        light_color += (lights[i].la + dif * lights[i].ld);
        
        vec3 halfDir = normalize(viewDir + lightDir);
        float spec = pow(max(dot(normal, halfDir), 0.), gloss)*atten;
        spec = step(.4, spec*atten);
        spec_color += (lights[i].ls * spec);
    }
    gl_FragColor.rgb = light_color * color + spec_color;
}