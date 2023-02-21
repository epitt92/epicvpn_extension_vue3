<template>
    <div class="otp-wrapper">
        <div class="otp-inputs" ref="inputs">
            <template v-for="(char, index) in valueParts" :key="index">
                <input
                    autocomplete="new-password"
                    v-model="valueParts[index]"
                    @keydown="
                        handleEnterKey($event);
                        handleKeyDown($event, index);
                    "
                    @keypress="handleOnKeyPress"
                    @input="handleInput($event, index)"
                    @paste="onPaste"
                    type="tel"
                    class="otp-input"
                    maxlength="1"
                    :ref="`otpInput${index}`"
                />
            </template>
        </div>
        <p v-if="errorMessage" class="color-error font-size-small mt-10px">{{ errorMessage }}</p>
    </div>
</template>
<script>
function _fill(arr, val, l) {
    arr.length = l;
    arr.fill(val, 0, l);
    return arr;
}

function _sanitizeEventKey(key) {
    return key === 'Unidentified' ? undefined : key;
}

export default {
    props: {
        codeLength: {
            type: Number,
            default: 6,
        },

        initialValue: {
            type: String,
            default: null,
        },

        errorMessage: {
            type: String,
            default: null,
        },

        focusOnInit: {
            type: Number,
            default: null,
        },
    },

    data: () => {
        return {
            valueParts: null,
        };
    },

    methods: {
        focus(index) {
            const inp = this.$refs.inputs.children[index];
            if (inp) {
                inp.focus();
            }
        },

        reset() {
            this.valueParts = _fill([], '', this.codeLength);
        },

        handleOnKeyPress(event) {
            let keyCode = event.keyCode ? event.keyCode : event.which;

            if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
                // 46 is dot
                event.preventDefault();
            }
        },

        handleEnterKey(event) {
            // handle Enter key submit since "onKeyPress="if(this.value.length" prevents thisdefault action
            if (event.key === 'Enter') {
                this.$emit('onSubmit');
                event.stopPropagation();
            }
        },

        handleKeyDown(event, index) {
            // handle "Unindentified" as undefined
            const key = _sanitizeEventKey(event.key);
            if (!key) {
                return;
            } else if (key === 'Backspace') {
                setTimeout(() => this.focus(index - 1), 0);
            } else if (!event.shiftKey && (key === 'ArrowRight' || key === 'Right') && event.target.selectionStart == 1) {
                if (this.$refs[`otpInput${index + 1}`]) {
                    const input = this.$refs[`otpInput${index + 1}`][0];
                    input.selectionStart = 0;
                    input.selectionEnd = 0;
                    setTimeout(() => {
                        this.focus(index + 1);
                    }, 0);
                }
            } else if ((event.keyCode == 37 && event.target.selectionStart == 0) || ((event.keyCode == 8 || event.keyCode == 46) && event.target.selectionStart == 0)) {
                if (this.$refs[`otpInput${index - 1}`]) {
                    const input = this.$refs[`otpInput${index - 1}`][0];
                    input.selectionStart = 1;
                    input.selectionEnd = 1;
                    setTimeout(() => this.focus(index - 1), 0);
                }
            } else if (key.length === 1 && this.valueParts[index]) {
                this.valueParts[index] = key;
                this.$forceUpdate();
                setTimeout(() => this.focus(index + 1), 0);
                this.emitInput();
            }
        },

        handleInput(event, index) {
            const value = event.target.value;

            if (value) {
                if (value.length == 1) {
                    this.valueParts[index] = value[value.length - 1];
                }
                this.focus(index + 1);
            }

            this.emitInput();
        },

        onPaste(event) {
            const clipboardData = event.clipboardData || window.clipboardData;
            if (!clipboardData) {
                return;
            }
            // IE fix
            event.preventDefault();
            const code = clipboardData.getData('Text') || clipboardData.getData('text/plain');
            this.fillCode(code);
            this.emitInput();
        },

        fillCode(code) {
            code = code.trim();
            code = code.slice(0, this.codeLength);
            const parts = code.split('');
            parts.length = this.codeLength;
            this.valueParts = parts;

            const last = code.length - 1;
            const that = this;
            this.$nextTick(() => {
                // cut out extra chars from last input
                this.valueParts[last] = this.valueParts[last] && this.valueParts[last].slice(0, 1); // apply just first char
                this.$forceUpdate();
                this.focus(last);
            });
        },

        emitInput() {
            const result = this.valueParts.join('').slice(0, this.codeLength);
            result.length == this.codeLength && this.$emit('otpOnChange', result);
            this.$emit('otpOnInput', result);
        },
    },

    mounted() {
        this.valueParts = _fill([], '', this.codeLength);
        if (this.initialValue) {
            this.valueParts = this.initialValue.split('');
        }
        this.$nextTick(() => !['null', 'undefined'].includes(this.focusOnInit) && this.focus(this.focusOnInit));
    },
};
</script>
<style lang="scss" scoped>
.otp {
    &-inputs {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &-input {
        display: inline-block;
        width: 30px;
        height: 35px;
        text-align: center;
        border: none;
        border-bottom: 1px solid #9a9a9a;
        margin: 0 6px;
        border-radius: 0;
        text-align: center;
        padding: 0;

        &:focus {
            outline: none;
            border-color: $colorBlue;
        }
    }

    &-error {
        text-align: center;
        margin-top: 12px;
    }
}
</style>
