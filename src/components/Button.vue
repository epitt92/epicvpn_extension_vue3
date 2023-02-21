<template>
    <button :type="type" :class="btnClass" @click="onClick" :disabled="disabled || loading">
        <div :class="iconClass" v-if="!loading">
            <slot name="icon"></slot>
        </div>
        <Loader class="btn__loader" v-if="loading" :color="loaderColor" :type="4" :width="24" :height="24" :borderWidth="3" />
        <template v-if="!onlyIcon">
            <span class="btn__value" :class="[loading ? 'opacity-0' : 'opacity-1']">{{ label }}</span>
        </template>
    </button>
</template>

<script>
export default {
    name: 'Button',

    props: {
        label: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
            default: 'button',
        },
        to: {
            default: null,
        },
        size: {
            type: String,
            default: 'm',
            validator: (value) => ['xs', 's', 'm', 'l', 'xl'].indexOf(value) !== -1,
        },
        widthType: {
            type: String,
            default: 'size',
            validator: (value) => ['size', 'fluid', 'auto'].indexOf(value) !== -1,
        },
        disabled: {
            default: false,
        },
        loading: {
            default: false,
        },
        borderRadius: {
            type: Number,
            default: 8,
        },
        iconAlign: {
            type: String,
            default: 'left',
            validator: (value) => ['left', 'right'].indexOf(value) !== -1,
        },
        padding: {
            type: String,
            default: '',
        },
        loaderColor: {
            type: String,
            default: '#689dfd',
        },
        loaderType: {
            type: Number,
            default: 4,
        },
        blank: {
            type: Boolean,
            default: false,
        },
    },

    computed: {
        btnClass() {
            return {
                btn: true,
                [`btn-size--${this.size}`]: true,
                [`btn-icon-align--${this.iconAlign}`]: this.$slots.icon,
                [`btn-form--square`]: this.onlyIcon,
                [`width-100`]: this.widthType === 'fluid',
                [`width-auto`]: this.widthType === 'auto',
                [`br-${this.borderRadius}px`]: true,
            };
        },

        iconClass() {
            return {
                [`m-0`]: true,
            };
        },
    },

    methods: {
        onClick() {
            if (this.type == 'link') {
                if (this.blank) {
                    const routeData = this.router.resolve(this.to);
                    window.open(routeData.href, '_blank');
                } else {
                    this.$router.push(this.to);
                }
            }
            this.$emit('onClick');
        },
    },
};
</script>

<style lang="scss">
.btn {
    outline: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    border: none;
    padding: 0;
    overflow: hidden;
    outline: none;
    padding: 0 20px;
    transition-property: opacity, background, border;
    transition-duration: 0.3s, 0.3s, 0.3s;
    transition-timing-function: ease;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
    position: relative;
    font-family: GraphikMedium;

    &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__loader {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    &-icon-align {
        &--right {
            flex-direction: row-reverse;
            .btn__icon {
                margin-left: 10px;
            }
        }

        &--left {
            .btn__icon {
                margin-right: 10px;
            }
        }
    }

    &:not(:disabled) {
        cursor: pointer;
    }

    &:disabled {
        pointer-events: none;
    }

    &:focus {
        box-shadow: none;
    }

    &--link {
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        color: $colorBlue;

        &:not(:disabled) {
            &:hover {
                text-decoration: underline;
            }
        }

        &:disabled {
            color: $colorGrey;
            cursor: default;
        }
    }

    &--unstyled {
        padding: 0;
        background: transparent;
        border: none;
    }

    &--border-blue {
        border: 2px solid $colorBlue;
        background: transparent;
        color: $colorBlue;

        &:hover {
            color: $colorWhite;
            background: $colorBlue;
        }

        &:active {
            color: $colorWhite;
            border-color: darken($color: $colorBlue, $amount: 8);
            background: darken($color: $colorBlue, $amount: 8) !important;
        }
    }

    &--blue {
        background: $colorBlue;
        color: $colorWhite;

        &:not(:disabled) {
            &:hover {
                color: $colorWhite;
                background: darken($color: $colorBlue, $amount: 8);
            }
        }

        &:disabled {
            background: $colorLightBlue;
            cursor: default;
        }

        &:active {
            background: $colorBlue !important;
        }
    }

    &-size {
        &--xs {
            min-width: 80px;
            min-height: 24px;
            padding: 0 8px;
        }

        &--s {
            min-width: 100px;
            min-height: 30px;
        }

        &--m {
            min-width: 148px;
            min-height: 38px;
        }

        &--l {
            min-width: 148px;
            min-height: 42px;
        }

        &--xl {
            min-width: 148px;
            min-height: 48px;
        }
    }

    &-form {
        &--square {
            width: auto;

            &.btn-size {
                &--xs {
                    min-width: 24px;
                    min-height: 24px;
                }

                &--s {
                    min-width: 30px;
                    min-height: 30px;
                }

                &--m {
                    min-width: 40px;
                    min-height: 40px;
                }

                &--l {
                    min-width: 48px;
                    min-height: 48px;
                }

                &--xl {
                    min-width: 50px;
                    min-height: 50px;
                }
            }
        }
    }
}

.text-btn {
    color: $colorDark;
    cursor: pointer;
    padding: 0;
    margin: 0;
    transition: $transitionPrimary;
    display: flex;
    align-items: center;
    line-height: 1;

    svg.icon {
        path {
            transition: $transitionPrimary;
        }
    }

    &:hover {
        color: $colorBlue;

        svg.icon {
            path {
                fill: $colorBlue;
            }
        }
    }

    &:active {
        color: $colorDark;

        svg.icon {
            path {
                fill: $colorDark;
            }
        }
    }

    &.disabled {
        color: $colorGrey;
        pointer-events: none;
        cursor: default;
    }
}
</style>
