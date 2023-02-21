<template>
    <div>
        <label class="toggle__button" :class="{'active': props.checkedValue}" :for="props.id">
            <span v-if="props.checkedValue" class="toggle__label">On</span>
            <span v-if="!props.checkedValue" class="toggle__label">Off</span>

            <input type="checkbox" :id="props.id" @click="props.onClickHandler" v-model="props.checkedValue">
            <span class="toggle__switch"></span>
        </label>
    </div>
</template>

<script setup>
import { inject, computed } from 'vue';
const store = inject('store');
const props = defineProps({
    checkedValue: {
        type: Boolean,
        default: true,
    },
    onClickHandler: {
        type: Function,
    },
    id: {
        type: String
    }
});

</script>

<style scoped>
div{
    margin-bottom: 20px;
}
.toggle__button {
    vertical-align: middle;
    user-select: none;
    cursor: pointer;
}
.toggle__button input[type="checkbox"] {
    opacity: 0;
    position: absolute;
    width: 1px;
    height: 1px;
}
.toggle__button .toggle__switch {
    display:inline-block;
    height:12px;
    border-radius:6px;
    width:40px;
    background: #BFCBD9;
    box-shadow: inset 0 0 1px #BFCBD9;
    position:relative;
    margin-left: 10px;
    transition: all .25s;
}
.toggle__button .toggle__switch::after, 
.toggle__button .toggle__switch::before {
    content: "";
    position: absolute;
    display: block;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    left: 0;
    top: -3px;
    transform: translateX(0);
    transition: all .25s cubic-bezier(.5, -.6, .5, 1.6);
}
.toggle__button .toggle__switch::after {
    background: #4D4D4D;
    box-shadow: 0 0 1px #666;
}
.toggle__button .toggle__switch::before {
    background: #4D4D4D;
    box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
    opacity:0;
}
.active .toggle__switch {
    background: #adedcb;
    box-shadow: inset 0 0 1px #adedcb;
}
.active .toggle__switch::after,
.active .toggle__switch::before{
    transform:translateX(40px - 18px);
}
.active .toggle__switch::after {
    left: 23px;
    background: #53B883;
    box-shadow: 0 0 1px #53B883;
}
</style>