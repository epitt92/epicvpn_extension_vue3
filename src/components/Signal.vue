<template>
    <div class="signal">
        <span v-if="quality >= 1"></span>
        <span v-if="quality >= 2"></span>
        <span v-if="quality >= 3"></span>
        <span v-if="quality >= 4"></span>
    </div>
</template>
<script setup>
const props = defineProps({
    quality: {
        type: Number,
        default: 1,
    },
});
</script>
<style lang="scss" scoped>
.signal {
    height: 16px;
    display: flex;
    align-items: flex-end;

    span {
        display: block;
        width: 3px;
        background: $colorBlue;
        border-radius: 3px;
        flex-shrink: 0;

        &:not(:last-child) {
            margin-right: 3px;
        }

        &:nth-child(1) {
            height: 40%;
        }
        &:nth-child(2) {
            height: 60%;
        }
        &:nth-child(3) {
            height: 80%;
        }
        &:nth-child(4) {
            height: 100%;
        }
    }
}
</style>
