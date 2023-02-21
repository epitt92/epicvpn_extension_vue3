<template>
    <main class="main text-align-center">
        <div class="container">
            <IconIllustrationPlace class="illustration-place mb-20px" />
            <h1 class="h1">Set new password?</h1>
            <p class="title-subtext">
                Minimum of 8 characters, with upper <br />
                and lowercase and a number, or a symbol
            </p>

            <form class="form" @submit.prevent="onSubmit">
                <div class="mb-10px">
                    <Input
                        :isPassword="true"
                        v-model="formData.password"
                        type="password"
                        placeholder="New password"
                        :validation="{ invalid: v$.password.$invalid, error: v$.password.$error }"
                        @input="onInput"
                    >
                        <template v-slot:error>
                            <span v-if="v$.password.$errors.length">{{ v$.password.$errors[0].$message }}</span>
                        </template>
                    </Input>
                </div>
                <div class="mb-16px">
                    <Input
                        :isPassword="true"
                        v-model="formData.password_confirmation"
                        type="password"
                        placeholder="Confirm password"
                        :validation="{ invalid: v$.password_confirmation.$invalid, error: v$.password_confirmation.$error }"
                        @input="onInput"
                    >
                        <template v-slot:error>
                            <span v-if="v$.password_confirmation.$errors.length">{{ v$.password_confirmation.$errors[0].$message }}</span>
                        </template>
                    </Input>
                </div>

                <Button
                    :label="'Change Password'"
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
            <p class="mb-2px">Remember password? <router-link class="link link--blue font-medium" :to="{ name: 'signin' }">Sign in</router-link></p>
        </template>
    </Footer>
</template>

<script setup>
import { ref, inject, reactive } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { getError } from '@/helpers/mixins.js';
import IconIllustrationPlace from '@/components/icons/IconIllustrationPlace.vue';

const formData = reactive({
    password: '',
    password_confirmation: '',
    email: localStorage.getItem('email'),
    token: localStorage.getItem('passwordOTP'),
});
const router = useRouter();
const state = reactive({ loading: false });

// VALIDATION RULES
const min8Simbols = (value) => value.length >= 8;
const anyLetter = (value) => /[a-zA-Z, а-яА-Я]+/g.test(value);
const anyNumber = (value) => /\d/g.test(value);
const anySimbol = (value) => /[-!@$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(value);

const rules = {
    password: {
        required: helpers.withMessage("The password doesn't meet the requirements.", required),
        min8Simbols: helpers.withMessage("The password doesn't meet the requirements.", min8Simbols),
        anyLetter: helpers.withMessage("The password doesn't meet the requirements.", anyLetter),
        anyNumber: helpers.withMessage("The password doesn't meet the requirements.", anyNumber),
        anySimbol: helpers.withMessage("The password doesn't meet the requirements.", anySimbol),
    },
    password_confirmation: {
        required: helpers.withMessage("The password doesn't meet the requirements.", required),
        min8Simbols: helpers.withMessage("The password doesn't meet the requirements.", min8Simbols),
        anyLetter: helpers.withMessage("The password doesn't meet the requirements.", anyLetter),
        anyNumber: helpers.withMessage("The password doesn't meet the requirements.", anyNumber),
        anySimbol: helpers.withMessage("The password doesn't meet the requirements.", anySimbol),
    },
};
// VALIDATION RULES

const $externalResults = ref({});
const v$ = useVuelidate(rules, formData, { $externalResults });
const onInput = () => {
    v$.value.$clearExternalResults();
};

async function onSubmit() {
    const result = await v$.value.$validate();

    if (result) {
        state.loading = true;
        const params = { email: formData.email, password: formData.password, password_confirmation: formData.password_confirmation, token: formData.token };
        chrome.runtime.sendMessage(
            {
                type: 'request',
                url: `${import.meta.env.VITE_API_URL}/auth/v1/password/reset`,
                method: 'post',
                params,
            },
            async (response) => {
                if (!response.error) {
                    router.push({ name: 'signin' });
                    state.loading = false;
                } else {
                    await v$.value.$validate();
                    $externalResults.value = { password_confirmation: getError(response) };
                    state.loading = false;
                }
            }
        );
    }
}
</script>

<style scoped>
.main {
    padding-top: 40px;
}

.form {
    margin: 0 0 16px 0;
}
</style>
