<template>
    <div class="panel">
        <div>
            <select v-model="selected" style="font-size:24px" size=10>
                <option :value="selected_default" selected>No object selected</option>
                <!-- <option :value="obj[0]" selected>No object selected</option> -->
                <option v-for="o in obj" :key=o :value=o> {{o.name}} </option>
            </select>
        </div>

        <div>
            <!-- <p v-if="is_selected"> {{selected.name}}: {{selected.object.position}} </p> -->
            <div v-if="is_selected"> <object-component :obj=selected></object-component>  </div>
        </div>
    </div>
</template>


<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { ObjectAttribute, ModelObject } from '../ts/modelObject'
import ObjectComponent from './ObjectComponent.vue'

declare let scene_objects: { [name: string]: ModelObject }

@Options({
    components: {ObjectComponent}
})
export default class SceneObjectListComponent extends Vue {
    obj: ObjectAttribute[] = []
    selected_default: ObjectAttribute = { name: "null", object: null };
    selected: ObjectAttribute = this.selected_default;
    
    beforeMount() {
        this.obj = [];
        Object.entries(scene_objects).forEach(
            ([name, obj]) => {
                this.obj.push({
                    name: name,
                    object: obj
                });
            }
        );
    }
    
    get is_selected(): boolean {
        return this.selected.object instanceof ModelObject
    }

    
}

</script>

<style>
.panel {
    position: fixed;
    top: 50%;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* float:inline-end; */
    text-align: left;
    /* right: 500px; */
    /* color: #2c3e50; */
    margin-top: 10px;
    width: 50%;
    height: 25%;
    font-size: 18px;
    display: flex;
}

/* Split the screen in half */
.scenelist {
    resize:both;
    height: 50%;
    width: 25%;
    position: inherit;
    z-index: 1;
    /* top: 0; */
    /* overflow-x: hidden;
    padding-top: 20px; */
    /* min-width: 10px; */
    display: inline-flex;
    left: 0;
    background-color: #111;
}

.object {
    resize:both;
    height: 50%;
    width: 25%;
    position: inherit;
    z-index: 1;
    /* min-width: 10px; */
    display: inline-flex;
    left: 25%;
    background-color:bisque;
}

/* If you want the content centered horizontally and vertically */
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>
