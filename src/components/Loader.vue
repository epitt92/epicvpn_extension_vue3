<template>
    <div :class="['q-loader', `q-loader--type-${type}`]">
        <div class="lds-roller" :style="{ '--color': color }" v-if="type == 1">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <div class="lds-ring" :class="iconClass" v-if="type == 2">
            <div :style="{ borderColor: `${color} transparent transparent transparent`, 'border-width': getStyleValue(borderWidth) }"></div>
            <div :style="{ borderColor: `${color} transparent transparent transparent`, 'border-width': getStyleValue(borderWidth) }"></div>
            <div :style="{ borderColor: `${color} transparent transparent transparent`, 'border-width': getStyleValue(borderWidth) }"></div>
            <div :style="{ borderColor: `${color} transparent transparent transparent`, 'border-width': getStyleValue(borderWidth) }"></div>
        </div>
        <div class="lds-dual-ring" :class="iconClass" v-if="type == 3">
            <span :style="{ borderColor: `transparent transparent ${color} transparent`, 'border-width': getStyleValue(borderWidth) }"></span>
        </div>
        <div class="lds-dual-ring" :class="iconClass" v-if="type == 4">
            <span :style="{ borderColor: `${color} transparent ${color} transparent`, 'border-width': getStyleValue(borderWidth) }"></span>
        </div>
        <div class="lds-ellipsis" v-if="type == 5 || type == 6">
            <div :style="{ background: color }"></div>
            <div :style="{ background: color }"></div>
            <div :style="{ background: color }"></div>
            <div :style="{ background: color }"></div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        color: {
            default: '#689dfd',
            type: String,
        },

        type: {
            default: 1,
            type: Number,
        },

        width: {
            default: 60,
        },

        height: {
            default: 60,
        },

        borderWidth: {
            default: 4,
        },
    },

    computed: {
        iconClass() {
            return {
                [`width-${this.width}px`]: true,
                [`height-${this.height}px`]: true,
            };
        },
    },

    methods: {
        getStyleValue(val) {
            return typeof val == 'number' ? `${val}px` : val;
        },
    },
};
</script>
<style lang="scss" scoped>
.q-loader {
    display: flex;
    &--type {
        &-1 {
            .lds-roller {
                display: inline-block;
                position: relative;
                width: 80px;
                height: 80px;
            }
            .lds-roller div {
                animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                transform-origin: 40px 40px;
            }
            .lds-roller div:after {
                content: ' ';
                display: block;
                position: absolute;
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: var(--color);
                margin: -4px 0 0 -4px;
            }
            .lds-roller div:nth-child(1) {
                animation-delay: -0.036s;
            }
            .lds-roller div:nth-child(1):after {
                top: 63px;
                left: 63px;
            }
            .lds-roller div:nth-child(2) {
                animation-delay: -0.072s;
            }
            .lds-roller div:nth-child(2):after {
                top: 68px;
                left: 56px;
            }
            .lds-roller div:nth-child(3) {
                animation-delay: -0.108s;
            }
            .lds-roller div:nth-child(3):after {
                top: 71px;
                left: 48px;
            }
            .lds-roller div:nth-child(4) {
                animation-delay: -0.144s;
            }
            .lds-roller div:nth-child(4):after {
                top: 72px;
                left: 40px;
            }
            .lds-roller div:nth-child(5) {
                animation-delay: -0.18s;
            }
            .lds-roller div:nth-child(5):after {
                top: 71px;
                left: 32px;
            }
            .lds-roller div:nth-child(6) {
                animation-delay: -0.216s;
            }
            .lds-roller div:nth-child(6):after {
                top: 68px;
                left: 24px;
            }
            .lds-roller div:nth-child(7) {
                animation-delay: -0.252s;
            }
            .lds-roller div:nth-child(7):after {
                top: 63px;
                left: 17px;
            }
            .lds-roller div:nth-child(8) {
                animation-delay: -0.288s;
            }
            .lds-roller div:nth-child(8):after {
                top: 56px;
                left: 12px;
            }
            @keyframes lds-roller {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        }

        &-2 {
            .lds-ring {
                display: inline-flex;
                position: relative;
                width: 60px;
                height: 60px;
                justify-content: center;
                align-items: center;
            }
            .lds-ring div {
                box-sizing: border-box;
                display: block;
                position: absolute;
                width: 100%;
                height: 100%;
                border: 6px solid $colorBlue;
                border-radius: 50%;
                animation: type2Animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                border-color: $colorBlue transparent transparent transparent;
            }
            .lds-ring div:nth-child(1) {
                animation-delay: -0.45s;
            }
            .lds-ring div:nth-child(2) {
                animation-delay: -0.3s;
            }
            .lds-ring div:nth-child(3) {
                animation-delay: -0.15s;
            }
            @keyframes type2Animation {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        }

        &-3 {
            .lds-dual-ring {
                display: inline-block;

                span {
                    display: block;
                    width: inherit;
                    height: inherit;
                    border-radius: 50%;
                    border: 10px solid #fff;
                    animation: type3Animation 0.8s linear infinite;
                }

                @keyframes type3Animation {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            }
        }

        &-4 {
            .lds-dual-ring {
                display: inline-block;

                span {
                    display: block;
                    width: inherit;
                    height: inherit;
                    border-radius: 50%;
                    border: 10px solid #fff;
                    animation: type4Animation 1.2s linear infinite;
                }

                @keyframes type4Animation {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            }
        }

        &-5 {
            justify-content: center;
            .lds-ellipsis {
                display: inline-block;
                position: relative;
                height: 20px;
                width: 56px;
            }
            .lds-ellipsis div {
                position: absolute;
                top: 6px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #414141;
                animation-timing-function: cubic-bezier(0, 1, 1, 0);
            }
            .lds-ellipsis div:nth-child(1) {
                left: 6px;
                animation: type5Animation1 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(2) {
                left: 6px;
                animation: type5Animation2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(3) {
                left: 24px;
                animation: type5Animation2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(4) {
                left: 42px;
                animation: type5Animation3 0.6s infinite;
            }
            @keyframes type5Animation1 {
                0% {
                    transform: scale(0);
                }
                100% {
                    transform: scale(1);
                }
            }
            @keyframes type5Animation3 {
                0% {
                    transform: scale(1);
                }
                100% {
                    transform: scale(0);
                }
            }
            @keyframes type5Animation2 {
                0% {
                    transform: translate(0, 0);
                }
                100% {
                    transform: translate(18px, 0);
                }
            }
        }

        &-6 {
            justify-content: center;
            .lds-ellipsis {
                display: inline-block;
                position: relative;
                height: 8px;
            }
            .lds-ellipsis div {
                position: absolute;
                top: 3px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #6e767d;
                animation-timing-function: cubic-bezier(0, 1, 1, 0);
            }
            .lds-ellipsis div:nth-child(1) {
                left: 4px;
                animation: type6Animation1 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(2) {
                left: 4px;
                animation: type6Animation2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(3) {
                left: 16px;
                animation: type6Animation2 0.6s infinite;
            }
            .lds-ellipsis div:nth-child(4) {
                left: 28px;
                animation: type6Animation3 0.6s infinite;
            }
            @keyframes type6Animation1 {
                0% {
                    transform: scale(0);
                }
                100% {
                    transform: scale(1);
                }
            }
            @keyframes type6Animation3 {
                0% {
                    transform: scale(1);
                }
                100% {
                    transform: scale(0);
                }
            }
            @keyframes type6Animation2 {
                0% {
                    transform: translate(0, 0);
                }
                100% {
                    transform: translate(12px, 0);
                }
            }
        }
    }
}
</style>
