<template>
    <div :class="{ 'cl-btn': true, connected: !connecting && connected, disconnected: !connecting && !connected }">
        <button :class="['cl-btn__center', connected && 'connected']" @click="emit('onClick')" :disabled="connecting">
            <svg class="cl-btn__svg" width="45" height="46" viewBox="0 0 45 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M33.369 3.27689L29.9683 9.43374C32.973 11.0892 35.342 13.6968 36.7023 16.8461C38.0626 19.9955 38.3371 23.5078 37.4824 26.8302C36.6278 30.1527 34.6925 33.0966 31.9814 35.1986C29.2702 37.3006 25.937 38.4414 22.5064 38.4414C19.0758 38.4414 15.7426 37.3006 13.0314 35.1986C10.3202 33.0966 8.38499 30.1527 7.53033 26.8302C6.67568 23.5078 6.9501 19.9955 8.31042 16.8461C9.67074 13.6968 12.0397 11.0892 15.0445 9.43374L11.6311 3.27689C7.26146 5.68761 3.81733 9.48264 1.84051 14.0649C-0.136305 18.6472 -0.533616 23.7566 0.711086 28.5894C1.95579 33.4221 4.77186 37.7039 8.71626 40.7612C12.6607 43.8184 17.5095 45.4775 22.5 45.4775C27.4905 45.4775 32.3394 43.8184 36.2838 40.7612C40.2282 37.7039 43.0443 33.4221 44.289 28.5894C45.5337 23.7566 45.1364 18.6472 43.1595 14.0649C41.1827 9.48264 37.7386 5.68761 33.369 3.27689V3.27689Z"
                    :fill="btnIconColor"
                />
                <path d="M20.0201 18.9659L18.9818 0H26.0182L24.9799 18.9659H20.0201Z" :fill="btnIconColor" />
            </svg>
        </button>

        <span v-for="(el, i) in 4" :ref="`c${i}`" :class="{ [`c${i}`]: true, [`${state[`circle${i}`].status}`]: true }" @animationiteration="onAnimationiteration($event, i)"></span>
    </div>
</template>
<script setup>
import { inject, reactive, ref, computed, defineEmits, defineExpose, watch } from 'vue';

const c0 = ref(null);
const c1 = ref(null);
const c2 = ref(null);
const c3 = ref(null);
const store = inject('store');
const connecting = computed(() => store.state.connecting);
const connected = computed(() => store.state.connected);
const emit = defineEmits(['onClick']);
const btnIconColor = computed(() => (connected.value ? '#257eff' : '#E3E4E6'));
const state = reactive({
    transition: false,
    circle0: {
        animationiteration: 0,
        status: 'off',
        finishOnIteration: false,
    },
    circle1: {
        animationiteration: 0,
        status: 'off',
        finishOnIteration: false,
    },
    circle2: {
        animationiteration: 0,
        status: 'off',
        finishOnIteration: false,
    },
    circle3: {
        animationiteration: 0,
        status: 'off',
        finishOnIteration: false,
    },
});

const onAnimationiteration = (e, index) => {
    if (state[`circle${index}`].finishOnIteration) {
        state[`circle${index}`].status = 'off';
    }
};

const animate = (action) => {
    switch (action) {
        case 'play':
            state.circle0.status = 'on';
            state.circle1.status = 'on';
            state.circle2.status = 'off';
            state.circle3.status = 'off';
            state.circle0.finishOnIteration = false;
            state.circle1.finishOnIteration = false;
            break;
        case 'stop':
            state.circle0.finishOnIteration = true;
            state.circle1.finishOnIteration = true;
            state.circle2.status = 'on';
            state.circle3.status = 'on';
            break;
        default:
            break;
    }
};

watch(
    () => store.state.connecting,
    (currentValue, oldValue) => {
        animate(currentValue ? 'play' : 'stop');
    }
);
</script>

<style lang="scss" scoped>
.cl-btn {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &__center {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background: $colorWhite;
        position: relative;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;

        &:not(:disabled) {
            cursor: pointer;

            &:not(.connected) {
                &:hover {
                    svg path {
                        fill: darken($color: #e3e4e6, $amount: 10);
                    }
                }

                &:active {
                    svg path {
                        fill: #e3e4e6;
                    }
                }
            }

            &.connected {
                &:hover {
                    svg path {
                        fill: darken($color: $colorBlue, $amount: 6);
                    }
                }

                &:active {
                    svg path {
                        fill: $colorBlue;
                    }
                }
            }
        }
    }

    &__svg {
        width: 30px;
        height: 30px;

        path {
            transition: $transitionPrimary;
        }
    }

    .c0,
    .c1,
    .c2,
    .c3 {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        border-radius: 50%;
        z-index: 1;
        transition: 0.3s all ease;
    }

    .c0 {
        z-index: 8;
        opacity: 0.4;

        &.on {
            background: lighten($color: $colorGrey, $amount: 30);
            animation: pulseProgress 1s linear infinite;
        }
    }

    .c1 {
        z-index: 8;
        opacity: 0.4;

        &.on {
            background: lighten($color: $colorGrey, $amount: 30);
            animation: pulseProgress 1s 0.5s linear infinite;
        }
    }

    .c2 {
        z-index: 8;
    }

    .c3 {
        z-index: 7;
    }

    &.connected {
        .c2 {
            background: #4599f3;
            transform: scale(1.4);

            &.on {
                transform: scale(1);
                background: #4599f3;
                animation: pulseComplete1 0.5s linear forwards;
            }
        }

        .c3 {
            background: #9cc8f9;
            transform: scale(1.8);

            &.on {
                transform: scale(1);
                background: #9cc8f9;
                animation: pulseComplete2 0.5s linear forwards;
                -webkit-box-shadow: 0px 0px 10px 4px rgba(156, 200, 249, 0.4);
                -moz-box-shadow: 0px 0px 10px 4px rgba(156, 200, 249, 0.4);
                box-shadow: 0px 0px 10px 4px rgba(156, 200, 249, 0.4);
            }
        }
    }
    &.disconnected {
        .c2 {
            background: #eaeaea;
            transform: scale(1.4);

            &.on {
                transform: scale(1);
                background: #eaeaea;
                animation: pulseComplete1 0.5s linear forwards;
            }
        }

        .c3 {
            background: #f4f4f4;
            transform: scale(1.8);

            &.on {
                transform: scale(1);
                background: #f4f4f4;
                animation: pulseComplete2 0.5s linear forwards;
                box-shadow: none;
            }
        }
    }

    @keyframes pulseProgress {
        0% {
            -webkit-transform: scale(1);
            opacity: 1;
        }

        100% {
            -webkit-transform: scale(2.1);
            opacity: 0;
        }
    }

    @keyframes pulseComplete1 {
        0% {
            -webkit-transform: scale(1);
        }

        100% {
            -webkit-transform: scale(1.4);
        }
    }

    @keyframes pulseComplete2 {
        0% {
            -webkit-transform: scale(1);
        }

        100% {
            -webkit-transform: scale(1.8);
        }
    }
}
</style>
