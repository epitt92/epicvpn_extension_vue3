<template>
    <Header></Header>
    <main class="main text-align-center">
        <div class="container">
            <h1 class="h1">Forgot password?</h1>
            <p class="title-subtext">Enter the email address assosiated with your account!</p>

            <form class="form" @submit.prevent="onSubmit">
                <div class="mb-16px">
                    <Input v-model="formData.email" type="text" placeholder="Email" :validation="{ invalid: v$.email.$invalid, error: v$.email.$error }" @input="onInput">
                        <template v-slot:error>
                            <span v-for="error in v$.email.$errors" :key="error.$uid">{{ error.$message }}</span>
                        </template>
                        <template v-slot:validIcon>
                            <IconInputValid />
                        </template>
                        <template v-slot:invalidIcon>
                            <IconInputInvalid class="svg-icon svg-icon--grey cursor-pointer" @click.native="formData.email = ''" />
                        </template>
                    </Input>
                </div>

                <Button
                    :label="'Reset Password'"
                    type="submit"
                    size="m"
                    widthType="fluid"
                    class="btn--blue"
                    :borderRadius="4"
                    loaderColor="#fff"
                    :disabled="false"
                    :loading="state.loading"
                />
            </form>
        </div>
    </main>
    <Footer class="footer text-align-center font-size-small">
        <template v-slot:content>
            <p class="mb-2px">Remember password? <router-link class="link link--blue font-medium" to="/signin">Sign in</router-link></p>
        </template>
    </Footer>
</template>

<script setup>
import { ref, inject, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { getError } from '@/helpers/mixins.js';
import IconInputValid from '@/components/icons/IconInputValid.vue';
import IconInputInvalid from '@/components/icons/IconInputInvalid.vue';

const formData = reactive({
    email: '',
});
const router = useRouter();
const state = reactive({ loading: false });
const rules = {
    email: { required: helpers.withMessage('This field is required.', required), email: helpers.withMessage('This is invalid email address.', email) },
};
const $externalResults = ref({});
const v$ = useVuelidate(rules, formData, { $externalResults });
const onInput = () => {
    v$.value.$clearExternalResults();
};

async function onSubmit() {
    const result = await v$.value.$validate();

    if (result) {
        state.loading = true;
        chrome.runtime.sendMessage(
            {
                type: 'request',
                url: `${import.meta.env.VITE_API_URL}/auth/v1/password/email`,
                method: 'post',
                params: { email: formData.email, link: 0 },
            },
            async (response) => {
                if (!response.error) {
                    router.push({ name: 'password-verify' });
                    localStorage.setItem('email', formData.email);
                    state.loading = false;
                } else {
                    await v$.value.$validate();
                    $externalResults.value = { email: getError(response) };
                    state.loading = false;
                }
            }
        );
    }
}
</script>

<style scoped>
.main {
    padding-top: 60px;
}

.form {
    margin: 0 0 16px 0;
}
</style>
