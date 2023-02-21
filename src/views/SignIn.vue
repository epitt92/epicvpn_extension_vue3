<template>
  <Header :backLink="{ name: 'get-started' }"></Header>
  <main class="main text-align-center">
    <div class="container">
      <h1 class="h1">Welcome Back!</h1>
      <p class="title-subtext">Protect your Privacy now!</p>

      <form class="form" @submit.prevent="onSubmit">
        <div class="mb-10px">
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
        <div class="mb-16px">
          <Input v-model="formData.password" type="password" placeholder="Password" :isPassword="true" :validation="{ invalid: v$.email.$invalid, error: v$.email.$error }" @input="onInput">
            <template v-slot:error>
              <span v-for="error in v$.password.$errors" :key="error.$uid">{{ error.$message }}</span>
            </template>
          </Input>
        </div>

        <Button :label="'Sign in'" type="submit" size="m" widthType="fluid" class="btn--blue" :borderRadius="4" loaderColor="#fff" :disabled="false" :loading="state.loading" />
      </form>

      <router-link to="/password-forgot" class="link link--blue font-medium">Forgot password?</router-link>
    </div>
  </main>
  <Footer class="footer text-align-center font-size-small">
    <template v-slot:content>
      <p class="mb-2px">Don't have an account yet? <a class="link link--blue font-medium" :href="env.VITE_SIGNUP_URL" target="_blank">Sign up</a></p>
    </template>
  </Footer>
</template>

<script setup>
import { ref, inject, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { getError } from '@/helpers/mixins.js';
import { getCurrentSub, getReferralProgram, initWS, getMembershipInfo } from '@/actions.js';
import IconInputValid from '@/components/icons/IconInputValid.vue';
import IconInputInvalid from '@/components/icons/IconInputInvalid.vue';
import { deleteConfidentialUserData } from '@/helpers/mixins.js';

const env = import.meta.env;
const formData = reactive({
  email: '',
  password: '',
});
const router = useRouter();
const store = inject('store');
const state = reactive({ loading: false });
const rules = {
  email: { required: helpers.withMessage('This field is required.', required), email: helpers.withMessage('This is invalid email address.', email) },
  password: { required: helpers.withMessage('This field is required.', required) },
};
const $externalResults = ref({});
const v$ = useVuelidate(rules, formData, { $externalResults });
const onInput = () => {
  v$.value.$clearExternalResults();
};

async function onSubmit() {
  const result = await v$.value.$validate();

  const { email, password } = formData;

  if (result) {
    state.loading = true;
    chrome.runtime.sendMessage(
      {
        type: 'request',
        url: `${import.meta.env.VITE_API_URL}/auth/v1/login`,
        method: 'post',
        params: { email, password, remember: 'on' },
      },
      async (response) => {
        try {
          if (response) {
            const { data: result, code, error } = response;

            function setUser(user) {
              store.setValue('autoConnect', true, true);
              store.setValue('isWebRtc', false, true);
              store.setValue('user', deleteConfidentialUserData(user), true);
              console.log('WebRTC is enabled');
              chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: 'default' });
              chrome.storage.local.set({ epic_user_auth: true });
              try {
                chrome.runtime.sendMessage(
                  {
                    type: 'request',
                    url: `${import.meta.env.VITE_API_URL}/account/v1/subscriptions/current`,
                    method: 'get',
                    params: {},
                  },

                  async (response) => {
                    if (!response.error) {
                      store.setValue('subscriptions', response.data, true);
                      getMembershipInfo(user, response.data);
                    } else {
                      console.log(response);
                    }
                  }
                );

                chrome.runtime.sendMessage(
                  {
                    type: 'request',
                    url: `${import.meta.env.VITE_API_URL}/account/v1/servers`,
                    method: 'get',
                    params: {},
                  },

                  async (response) => {
                    if (!response.error) {
                      store.setValue('freeServers', response.data.free, true);
                      store.setValue('paidServers', response.data.paid, true);
                      chrome.storage.local.set({
                        freeServers: response.data.free,
                        paidServers: response.data.paid,
                        serversCreatedAt: new Date().getTime(),
                      });
                    } else {
                      console.log(response);
                    }
                  }
                );
              } catch (error) {
                state.loading = false;
                console.log(error);
              }
              // chrome.storage.local.set({ userId: result.id });
            }

            if (code) {
              if (code === 100) {
                setUser(result);
                !store.state.wsConnected && initWS({ userId: result.id });
                router.push({ name: 'email-verify' });
              } else if (code === 102) {
                store.setValue('userPassword', password, true);
                store.setValue('userEmail', email, true);
                router.push({ name: 'twoFA' });
              } else {
                await v$.value.$validate();
                $externalResults.value = { password: getError(response) };
                state.loading = false;
              }
              state.loading = false;
            } else if (!error && result) {
              setUser(result);
              await getCurrentSub();
              await getReferralProgram();
              !store.state.wsConnected && initWS({ userId: result.id });
              router.push({ name: 'main' });
            } else {
              await v$.value.$validate();
              $externalResults.value = { password: getError(response) };
              state.loading = false;
            }
          }
        } catch (error) {
          console.log(error);
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
