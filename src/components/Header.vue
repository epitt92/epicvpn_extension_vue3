<template>
    <div class="header">
        <div class="container">
            <IconNavBackArrow v-if="iconLeft" @click.native="goBack" />

            <span class="header__title" v-if="$slots.title"><slot name="title"></slot></span>

            <div class="header__icon" v-if="iconRight"></div>
        </div>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import IconNavBackArrow from '@/components/icons/IconNavBackArrow.vue';

const props = defineProps({
    iconLeft: {
        type: Boolean,
        default: true,
    },
    iconRight: {
        type: Boolean,
        default: false,
    },
    backLink: {
        type: Object,
    },
});

const router = useRouter();
const goBack = () => {
    if (props.backLink) {
        router.push(props.backLink);
    } else {
        router.go(-1);
    }
};
</script>

<style lang="scss" scoped>
.header {
    padding: 30px 0 0;
    .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
    }

    &__title {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        text-align: center;
        max-width: 60%;
        font-family: $fontB;
        font-size: 16px;
        line-height: 20px;
    }
}
</style>
