<template>
    <div :class="{ 'w-input-wrap': true, invalid: validation.error }">
        <label class="w-input-label" for="w-input" v-if="label">{{ label }}</label>
        <div class="w-input-block">
            <input id="w-input" :class="inputClass" :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" v-bind="$attrs" />
            <div :class="iconClass">
                <slot name="icon"></slot>
                <slot name="validIcon" v-if="!validation.invalid && modelValue"></slot>
                <slot name="invalidIcon" v-if="validation.invalid && modelValue"></slot>

                <IconEye class="svg-icon svg-icon--grey cursor-pointer" v-if="isPassword && type === 'password'" @click.native="changePasswordType" />
                <IconEyeClosed class="svg-icon svg-icon--grey cursor-pointer" v-if="isPassword && type !== 'password'" @click.native="changePasswordType" />
            </div>
        </div>
        <div class="w-input-error" v-if="$slots.error">
            <slot name="error"></slot>
        </div>
    </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';
import IconEye from '@/components/icons/IconEye.vue';
import IconEyeClosed from '@/components/icons/IconEyeClosed.vue';

const slots = useSlots();
const props = defineProps({
    label: {
        type: [String, Boolean],
        default: false,
    },

    modelValue: {
        type: String,
        default: '',
    },

    validation: {
        type: Object,
        default: () => {
            return {
                invalid: true,
                error: false,
            };
        },
    },

    isPassword: {
        type: Boolean,
        default: false,
    },

    padding: {
        type: Number,
        default: 16,
    },

    type: {
        type: String,
        default: 'text',
    },
});

const iconClass = computed(() => {
    return {
        'w-input-icon': true,
        [`right-${props.padding}px`]: true,
        'pointer-events-none': slots.icon,
    };
});
const inputClass = computed(() => {
    return {
        'w-input': true,
        [`pl-${props.padding}px`]: true,
        [`pr-${props.padding}px`]: true,
    };
});

const changePasswordType = () => {
    props.type = props.type === 'text' ? 'password' : 'text';
};
</script>

<style lang="scss" scoped>
.w-input {
    &-wrap {
        display: flex;
        flex-direction: column;
        text-align: left;
        position: relative;

        input {
            width: 100%;
            height: 100%;
            min-height: 38px;
            background: transparent;
            border: none;
            border-radius: inherit;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;

            &:focus {
                background: darken($color: $colorLightGrey, $amount: 4);
                border: none;
                box-shadow: none;
                outline: none;
            }

            &::placeholder {
                color: #aeaeae;
            }
        }

        &.invalid {
            .w-input {
                &-block {
                    outline-color: $colorError;
                }
            }
        }
    }

    &-label {
        margin-bottom: 4px;
        cursor: pointer;
        align-self: flex-start;
    }

    &-block {
        background: $colorLightGrey;
        border-radius: $borderRadiusPrimary;
        display: flex;
        align-items: center;
        position: relative;
        outline: 1px solid transparent;

        &:focus-within {
            background: darken($color: $colorLightGrey, $amount: 4);
        }
    }

    &-icon {
        position: absolute;
        top: 46%;
        transform: translate(0, -50%);
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
            width: 100%;
            height: auto;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }

    &-error {
        // position: absolute;
        // bottom: 0;
        // left: 0;
        // transform: translate(0, 100%);
        color: $colorError;
        font-size: 12px;
        line-height: 16px;
        margin-top: 4px;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
    transform: scale(0);
    opacity: 0;
}
</style>
