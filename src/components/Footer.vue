<template>
    <div class="footer" v-if="$slots.content">
        <div class="container">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineProps({
    iconLeft: {
        type: Boolean,
        default: true,
    },
    iconRight: {
        type: Boolean,
        default: false,
    },
});

const router = useRouter();
</script>

<style lang="scss" scoped>
.footer {
    padding: 20px 0;
}
</style>
