<template>
    <div class="overlay">
        <Loader :type="2" :width="24" :height="24" :borderWidth="2" />
    </div>
</template>
<script setup>
import { defineProps } from 'vue';
const props = defineProps({
    enabled: {
        type: Boolean,
        default: false,
    },
});
</script>

<style lang="scss" scoped>
.overlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
