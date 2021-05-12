attribute vec3 aVertexPosition;
attribute vec3 aFrontColor;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uinvTModelMatrix;

struct Light {
    bool enabled;
    vec3 position;
    vec3 la; // Ambient
    vec3 ld; // Diffuse
    vec3 ls; // Specular
    // float gloss;
};

uniform float gloss;
uniform Light lights[4];
uniform vec3 uCamPos;

vec3 normal;
vec3 pos;
vec3 viewDir;

varying vec3 fragcolor;

void shading() {
    vec3 light_color = vec3(0);
    vec3 spec_color = vec3(0);
    fragcolor = vec3(0);
    for(int i = 0; i < 4; ++i){
        if(!lights[i].enabled){
            break;
        }
        vec3 lightDir = normalize(lights[i].position - pos);

        float dif = dot(normal, lightDir);
        light_color += lights[i].la + dif * lights[i].ld;
        
        vec3 halfDir = normalize(viewDir + lightDir);
        float spec = pow(max(dot(normal, halfDir), 0.), gloss);
        spec_color += lights[i].ls * spec;
    }
    fragcolor = light_color * aFrontColor + spec_color;
}
void main(void) {
    pos = (uModelMatrix * vec4(aVertexPosition, 1)).xyz;
    normal = normalize((uinvTModelMatrix * vec4(aNormal, 0.0)).xyz);
    viewDir = normalize(uCamPos - pos);
    shading();
    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
}