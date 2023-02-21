<template>
    <main class="main text-align-center">
        <div class="container">
            <IconIllustrationPlace class="illustration-place mb-20px" />
            <h1 class="h1 font-bold">Verify your email</h1>
            <p class="title-subtext">
                To complete your signup process, <br />
                Please enter the 6 digits code sent to <br />
                <span class="color-dark-blue font-medium" v-if="store.state.user && store.state.user.email">{{ store.state.user.email }}</span>
            </p>

            <Otp class="mb-24px" @otpOnInput="otpOnInput" :errorMessage="state.errorMessage" @onSubmit="onSubmit" :focusOnInit="0" ref="otpInput" />

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
                @click.native="onSubmit"
            />
        </div>
    </main>
    <Footer class="footer text-align-center font-size-small">
        <template v-slot:content>
            <span class="link link--paragraph" @click="logout(router, { name: 'signin' })"
                >Logout
                <svg width="8" height="7" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M4.91299 0.0421589L7.95794 3.08711C8.01402 3.14319 8.01402 3.23402 7.95794 3.29017L4.91299 6.33513C4.85691 6.3912 4.76608 6.3912 4.70993 6.33513C4.65385 6.27905 4.65385 6.18822 4.70993 6.13207L7.51022 3.33178H0.143515C0.064453 3.33178 0 3.26761 0 3.18827C0 3.10892 0.064453 3.0447 0.143515 3.0447H7.51034L4.71005 0.244412C4.65398 0.188335 4.65398 0.0975039 4.71005 0.0413553C4.76654 -0.0139183 4.85762 -0.0139183 4.91299 0.0421589Z"
                        fill="black"
                    />
                </svg>
            </span>
        </template>
    </Footer>
</template>

<script setup>
import { inject, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import IconIllustrationPlace from '@/components/icons/IconIllustrationPlace.vue';
import Otp from '@/components/Otp.vue';
import { getError } from '@/helpers/mixins.js';
import { logout, getCurrentSub, getReferralProgram } from '@/actions.js';

const store = inject('store');
const router = useRouter();
const otpInput = ref(null);
const state = reactive({
    timeLeft: 59,
    interval: 0,
    sendingEnabled: true,
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
            url: `${import.meta.env.VITE_API_URL}/auth/v1/email/resend`,
            method: 'post',
            params: { email: store.state.user.email, link: 0 },
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
                console.log(response);
            }
        }
    );
};

const emailVerify = () => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: 'request',
                url: `${import.meta.env.VITE_API_URL}/auth/v1/email/verify-account`,
                method: 'post',
                params: { email: store.state.user.email, token: state.code },
            },
            async (response) => {
                if (!response.error) {
                    resolve(true);
                } else {
                    state.errorMessage = getError(response);
                    otpInput.value.focus(state.code && state.code.length == 6 ? 5 : state.code.length);
                    reject(false);
                }
            }
        );
    });
};

const onSubmit = async () => {
    try {
        state.loading = true;
        const emailVerifyPassed = await emailVerify();
        if (!emailVerifyPassed) return;
        await getCurrentSub();
        await getReferralProgram();
        router.push({ name: 'main' });
        state.loading = false;
    } catch (error) {
        state.loading = false;
    }
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
.title-subtext {
    width: 90%;
}
</style>
