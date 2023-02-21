<template>
    <main class="main text-align-center">
        <div class="container">
            <IconIllustrationPlace class="illustration-place mb-20px" />
            <h1 class="h1 font-bold">Forgot password?</h1>
            <p class="title-subtext">
                You're almost there! To set new password, <br />
                Please enter the 6 digits code sent to <br />
                <span class="color-dark-blue font-medium">{{ state.email }}</span>
            </p>

            <Otp class="mb-24px" @otpOnInput="otpOnInput" :errorMessage="state.errorMessage" @onSubmit="passwordVerify" :focusOnInit="0" ref="otpInput" />

            <span class="link link--blue font-medium" @click="resendEmail" v-if="state.sendingEnabled">Resend email</span>
            <p class="mb-0px" v-else><span class="font-medium color-green">Email sent!</span> (s{{ state.timeLeft }})</p>

            <Button
                :label="'Verify and continue'"
                type="button"
                size="m"
                widthType="fluid"
                class="btn--blue mt-24px"
                :borderRadius="4"
                loaderColor="#fff"
                :disabled="!state.code"
                :loading="state.loading"
                @click.native="passwordVerify"
            />
        </div>
    </main>
    <Footer class="footer text-align-center font-size-small">
        <template v-slot:content>
            <p class="mb-2px">Remember password? <router-link class="link link--blue font-medium" :to="{ name: 'signin' }">Sign in</router-link></p>
        </template>
    </Footer>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import IconIllustrationPlace from '@/components/icons/IconIllustrationPlace.vue';
import Otp from '@/components/Otp.vue';
import { getError } from '@/helpers/mixins.js';

const otpInput = ref(null);
const router = useRouter();
const state = reactive({
    timeLeft: 59,
    interval: 0,
    sendingEnabled: true,
    email: localStorage.getItem('email'),
    errorMessage: null,
    code: null,
    loading: false,
});
const otpOnInput = (e) => {
    state.code = e;
    state.errorMessage = null;
};
const resendEmail = () => {
    chrome.runtime.sendMessage(
        {
            type: 'request',
            url: `${import.meta.env.VITE_API_URL}/auth/v1/password/resend`,
            method: 'post',
            params: { email: state.email, link: 0 },
        },
        async (response) => {
            if (!response.error) {
                state.timeLeft = 59;
                state.interval = setInterval(decreaseTime, 1000);
                state.sendingEnabled = false;
                state.code = null;
                state.errorMessage = null;
                otpInput.value.reset();
                otpInput.value.focus(0);
            } else {
                console.log(error);
            }
        }
    );
};

const passwordVerify = () => {
    state.loading = true;
    chrome.runtime.sendMessage(
        {
            type: 'request',
            url: `${import.meta.env.VITE_API_URL}/auth/v1/password/token-check`,
            method: 'post',
            params: { email: state.email, token: state.code },
        },
        async (response) => {
            if (!response.error) {
                localStorage.setItem('passwordOTP', state.code);
                router.push({ name: 'password-reset' });
                state.loading = false;
            } else {
                state.errorMessage = getError(response);
                otpInput.value.focus(state.code && state.code.length == 6 ? 5 : state.code.length);
                state.loading = false;
            }
        }
    );
};
const decreaseTime = () => {
    if (state.timeLeft >= 1) {
        state.timeLeft = state.timeLeft - 1;
    } else {
        clearInterval(state.interval);
        state.sendingEnabled = true;
    }
};
</script>

<style scoped>
.main {
    padding-top: 40px;
}
</style>
