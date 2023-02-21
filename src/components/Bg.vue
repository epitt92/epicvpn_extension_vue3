<template>
    <div class="bg">
        <img :src="src" alt="background" />
    </div>
</template>
<script setup>
import { ref } from 'vue';

const src = ref(chrome.runtime.getURL('/images/bg.svg'));
</script>

<style lang="scss" scoped>
.bg {
    position: fixed;
    overflow: hidden;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;

    svg {
        width: 100%;
        height: 100%;
    }
}
</style>
