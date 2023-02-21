<template>
    <Header class="pb-0px" :backLink="{ name: 'twoFA' }"></Header>
    <main class="main text-align-center">
        <form class="container" @submit.prevent="onSubmit">
            <h1 class="h1 font-bold">Two-factor Authentication</h1>
            <p class="title-subtext">Enter one of the recovery codes you previously generated.</p>

            <Input v-model="formData.code" type="text" placeholder="Code" :validation="{ invalid: v$.code.$invalid, error: v$.code.$error }" @input="onInput">
                <template v-slot:error>
                    <span v-for="error in v$.code.$errors" :key="error.$uid">{{ error.$message }}</span>
                </template>
            </Input>

            <Button
                :label="'Verify and continue'"
                type="submit"
                size="m"
                widthType="fluid"
                class="btn--blue mt-24px"
                :borderRadius="4"
                loaderColor="#fff"
                :disabled="false"
                :loading="state.loading"
                @click.native="onSubmit"
            />
        </form>
    </main>
    <Footer class="footer text-align-center font-size-small">
        <template v-slot:content>
            <p class="mb-2px">Don't have recovery code? <a class="link link--blue font-medium" :href="env.VITE_CONTACT_US_URL" target="blank">Contact us</a></p>
        </template>
    </Footer>
</template>

<script setup>
import { inject, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import { getError } from '@/helpers/mixins.js';
import { getCurrentSub, getReferralProgram, initWS } from '@/actions.js';
import { deleteConfidentialUserData } from '@/helpers/mixins.js';

const env = import.meta.env;
const router = useRouter();
const $externalResults = ref({});
const store = inject('store');
const state = reactive({ loading: false });
const rules = {
    code: { required: helpers.withMessage('This field is required.', required) },
};
const formData = reactive({
    code: '',
});
const v$ = useVuelidate(rules, formData, { $externalResults });
const onInput = () => {
    v$.value.$clearExternalResults();
};
const onSubmit = async () => {
    const result = await v$.value.$validate();

    if (result) {
        state.loading = true;
        chrome.runtime.sendMessage(
            {
                type: 'request',
                url: `${import.meta.env.VITE_API_URL}/auth/v1/login/confirmation`,
                method: 'post',
                params: { email: store.state.userEmail, password: store.state.userPassword, code: formData.code },
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
                    await v$.value.$validate();
                    $externalResults.value = { code: getError(response) };
                    state.loading = false;
                }
            }
        );
    }
};
</script>

<style scoped>
.title-subtext {
    width: 90%;
}
</style>
