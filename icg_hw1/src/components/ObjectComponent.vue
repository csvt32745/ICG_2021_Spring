<template>
    <div class="object-component">
        <h4> {{obj.name}} </h4>

        <p class="array"> Position </p>
        <div v-for="(val, index) in pos" :key=index class="array">
            {{xyz(index)}}
            <input v-model.number="pos[index]" class="input">
        </div>
        <br/>

        <p class="array"> Rotation </p>
        <div v-for="(val, index) in rot" :key=index class="array">
            {{xyz(index)}}
            <input v-model.number="euler[index]" @keyup.enter="rot_changed" class="input">
        </div>
        <br/>

        <p class="array"> Shear </p>
        <div v-for="(val, index) in shear" :key=index class="array">
            {{index}}
            <input v-model.number="shear[index]" class="input">
        </div>
        <br/>

        <p class="array"> Shader </p>
        <select v-model="selected_shader" style="font-size:24px" class="array">
            <option v-for="(_, name) in shader_list" :key=name :value=name> {{name}} </option>
        </select>
        <p class="array"> Gloss <input v-model.number="gloss" class="input"> </p>
    </div>
</template>


<script lang="ts">
import component from '*.vue';
import { Options, Vue, prop } from 'vue-class-component'
import { vec3, quat } from 'gl-matrix'

import { ModelObject, ObjectAttribute } from '../ts/modelObject'
import { getEuler } from '../ts/transform'
import { BasicShader } from '../ts/shaderProgram'


declare let shader_programs: { [name: string]: BasicShader };

class Props {
    obj!: ObjectAttribute
}

export default class ObjectComponent extends Vue.with(Props) {

    euler: Array<number>
    shader_list: { [name: string]: BasicShader };

    beforeMount() {
        this.shader_list = shader_programs;
    }

    get selected_shader() { return this.obj.object.shaderProgram.name; }
    set selected_shader(name) { this.obj.object.shaderProgram = shader_programs[name]; }

    get gloss() { return this.obj.object.gloss; }
    set gloss(val: number) { this.obj.object.gloss = val; }

    get pos(){ return this.obj.object.position.valueOf() as Array<number>; }
    
    get shear(){ return this.obj.object.shear.valueOf() as Array<number>; }

    get rot(){
        this.euler = []
        getEuler(this.euler, this.obj.object.rotation);
        return this.euler;
    }

    rot_changed(){
        this.obj.object.rotation = quat.fromEuler(quat.create(), this.euler[0], this.euler[1], this.euler[2]);
    }

    xyz(index){ return "XYZ"[index]; }
}

</script>

<style>
.object-component {
    position:inherit;
    /* top: 55%; */
    /* right: 50%; */
    /* left: 50%; */
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* float: right; */
    text-align: left;
    font-size: 24px;
    line-break: strict;
    line-height: 0%;
}

.array {
    display: inline-block;
    padding: 0px 5px;
}

.input {
    font-size: 18px;
    width: 60px;
}
</style>
