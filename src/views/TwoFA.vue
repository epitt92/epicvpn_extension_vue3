<template>
    <Header class="pb-0px" :backLink="{ name: 'signin' }"></Header>
    <main class="main text-align-center">
        <div class="container">
            <h1 class="h1 font-bold">Two-factor Authentication</h1>
            <p class="title-subtext">Enter the code displayed on your authenticator app.</p>

            <Otp class="mb-24px" @otpOnInput="otpOnInput" :errorMessage="state.errorMessage" @onSubmit="verify" :focusOnInit="0" ref="otpInput" />

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
                @click.native="verify"
            />
        </div>
    </main>
    <Footer class="footer text-align-center font-size-small">
        <template v-slot:content>
            <p class="mb-2px">Try another method? <router-link class="link link--blue font-medium" to="/twoFArecoveryCode">Recovery code</router-link></p>
        </template>
    </Footer>
</template>

<script setup>
import { inject, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Otp from '@/components/Otp.vue';
import { getError } from '@/helpers/mixins.js';
import { getCurrentSub, initWS, getReferralProgram } from '@/actions.js';
import { deleteConfidentialUserData } from '@/helpers/mixins.js';

const otpInput = ref(null);
const router = useRouter();
const store = inject('store');
const state = reactive({
    errorMessage: null,
    code: null,
    loading: false,
});
const otpOnInput = (e) => {
    state.code = e;
    state.errorMessage = null;
};
const verify = () => {
    state.loading = true;
    chrome.runtime.sendMessage(
        {
            type: 'request',
            url: `${import.meta.env.VITE_API_URL}/auth/v1/login/confirmation`,
            method: 'post',
            params: { email: store.state.userEmail, password: store.state.userPassword, code: state.code },
        },
        async (response) => {
            if (!response.error) {
                const { data } = response;
                if (data && data.api_token) {
                    store.setValue('user', deleteConfidentialUserData(data), true);
                    await getCurrentSub();
                    await getReferralProgram();
                    !store.state.wsConnected && initWS({ userId: data.id });
                    router.push({ name: 'main' });
                } else {
                    state.errorMessage = 'Error occured';
                }
                state.loading = false;
            } else {
                state.errorMessage = getError(response);
                otpInput.value.focus(state.code && state.code.length == 6 ? 5 : state.code.length);
                state.loading = false;
            }
        }
    );
};
</script>

<style scoped>
.title-subtext {
    width: 90%;
}
</style>
