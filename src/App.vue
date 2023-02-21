<template>
  <!-- <OverlayLoader :enabled="store.state.overlayLoader" v-if="store.state.overlayLoader" /> -->
  <router-view />
  <div :class="isProxyError ? 'error-alert' : 'error-alert hidden'">
    <h1>Proxy Warning!</h1>
    <p>Another browser alert is controlling your proxy settings, preventing EpicVPN from working.</p>
    <p>Please disable other proxy extension.</p>
    <a @click="closeWarning('extension')">Close</a>
  </div>

  <div :class="isNetworkError ? 'error-alert' : 'error-alert hidden'">
    <h1>Network Warning!</h1>
    <p>The Internet is not connected.</p>
    <p>Please check the internet connect and click the close button.</p>
    <a @click="closeWarning('network')">Close</a>
  </div>
</template>

<script setup>
import { inject, onBeforeMount, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMembershipInfo, authCheck, getCurrentSub, initWS, logout, myWorker } from '@/actions.js';
import { getError } from '@/helpers/mixins.js';
import OverlayLoader from '@/components/OverlayLoader.vue';
import { deleteConfidentialUserData } from '@/helpers/mixins.js';

const router = useRouter();
const route = useRoute();
const store = inject('store');

const isProxyError = computed(() => store.state.isProxyError);
const isNetworkError = computed(() => store.state.isNetworkError);

const closeWarning = (errorType) => {
  console.log('iserror');
  if (errorType === 'network') {
    store.setValue('isProxyError', false);
    store.setValue('connecting', false);
  }
  if (errorType === 'extension') {
    store.setValue('isNetworkError', false);
  }
};

const init = async () => {
  myWorker.postMessage(['get_ip']);
  chrome.runtime.sendMessage({
    type: 'checkNetwork',
  });
  let storeBG = await store.getBGStore();
  for (const key in storeBG) {
    store.setValue(key, storeBG[key], false);
  }
  console.log('Connect to proxy2', new Date().getTime());

  chrome.runtime.connect({ name: 'popup' });
  const lastRouteName = localStorage.getItem('lastRoute') && JSON.parse(localStorage.getItem('lastRoute')).name;
  console.log('store--', store.state.overlayLoader, lastRouteName);
  if (store.state.overlayLoader) {
    lastRouteName ? router.push({ name: lastRouteName }) : router.push({ name: 'main' });
  } else {
    store.state.user && store.state.user.activated ? router.push({ name: 'main' }) : lastRouteName ? router.push({ name: lastRouteName }) : router.push({ name: 'get-started' });
    if (store.state.user && store.state.user.activated) {
      const isHidden = store.state.user.subscription_id && store.state.subscription && ['active', 'paused', 'canceled'].includes(store.state.subscription.status);
      if (!isHidden) {
        let obj = await chrome.storage.local.get(null);
        let createdAt = obj.serversCreatedAt ? obj.serversCreatedAt : 0;
        let period = new Date().getTime() - createdAt;
        if (period > 2 * 60 * 1000) {
          console.log('Request api for servers');
          try {
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
            console.log(error);
          }
        }

        let planCreatedAt = obj.planCreatedAt ? obj.planCreatedAt : 0;
        let planPeriod = new Date().getTime() - planCreatedAt;
        if (planPeriod > 5 * 24 * 3600 * 1000) {
          chrome.runtime.sendMessage(
            {
              type: 'request',
              url: `${import.meta.env.VITE_API_URL}/get-current-lang`,
              method: 'get',
              params: {},
            },
            async (response) => {
              if (!response.error) {
                store.setValue('currency', response.data.currency, true);
                store.setValue('currencySymbol', response.data.currencySymbol, true);

                chrome.runtime.sendMessage(
                  {
                    type: 'request',
                    url: `${import.meta.env.VITE_API_URL}/account/v1/products`,
                    method: 'get',
                    params: { service_id: 1, currency: response.data.currency },
                  },
                  async (response) => {
                    if (!response.error) {
                      store.setValue('monthlyPrice', response.data.find((d) => d.plan.interval == 'month' && d.plan.interval_count == 1).plan.amount / 100, true);
                      store.setValue(
                        'selectedProduct',
                        response.data.find((d) => d.as_most_selected),
                        true
                      );
                      store.setValue(
                        'products',
                        response.data.sort((a, b) => a.sort - b.sort),
                        true
                      );
                      chrome.storage.local.set({
                        currency: store.state.currency,
                        currencySymbol: store.state.currencySymbol,
                        monthlyPrice: store.state.monthlyPrice,
                        selectedProduct: store.state.selectedProduct,
                        products: Object.values(store.state.products),
                        planCreatedAt: new Date().getTime(),
                      });
                    } else {
                      console.log(response);
                    }
                  }
                );
              } else {
                console.log(response);
              }
            }
          );
        }
      }
    }
  }

  store.updateBGStore('autoConnect', store.state.autoConnect);
  console.log('store app', store.state.user, store.state.wsConnected);
};

onBeforeMount(() => init());

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type } = message;
  if (type == 'requestError') {
    console.log(`${getError(message.response)}, url: ${message.url}`);
  } else if (type === 'wsClosed') {
    store.setValue('wsConnected', false, true);
  } else if (type === 'wsDataUpdated') {
    console.log('new data from WS', message.data);
    const { action, model, data } = message.data;
    if (model === 'User' && action === 'updated') {
      const oldUser = store.state.user;
      store.setValue('user', deleteConfidentialUserData(data), true);
      if (oldUser && !oldUser.activated && data.activated) {
        router.push('main');
      }
    } else if (model === 'Subscription' && action === 'updated') {
      store.setValue('subscription', data, true);
      getMembershipInfo(store.state.user, data);
    }
  } else if (type === 'loggedIn') {
    store.setValue('user', deleteConfidentialUserData(message.storeBG.user), true);
    ['signin', 'get-started', 'email-verify'].includes(route.name) && router.push({ name: 'main' }).then(() => store.setValue('overlayLoader', false));
  } else if (type === 'loggedOut') {
    route.name !== 'get-started' && logout(router, { name: 'signin' });
  } else if (type === 'bgStoreUpdated') {
    for (const key in message.storeBG) {
      store.setValue(key, message.storeBG[key], false);
    }
  }
});

setTimeout(() => {
  store.getBGStore().then((e) => console.log('getBGStore in 7s', e));
}, 7000);
</script>

<style scoped lang="scss">
@font-face {
  font-family: 'GraphikRegular';
  font-style: normal;
  font-weight: 400;
  src: url('chrome-extension://__MSG_@@extension_id__/fonts/GraphikRegular.ttf') format('truetype');
}

@font-face {
  font-family: 'GraphikBold';
  font-style: normal;
  font-weight: bold;
  src: url('chrome-extension://__MSG_@@extension_id__/fonts/GraphikBold.ttf') format('truetype');
}

@font-face {
  font-family: 'GraphikMedium';
  font-style: normal;
  font-weight: normal;
  src: url('chrome-extension://__MSG_@@extension_id__/fonts/GraphikMedium.ttf') format('truetype');
}
.error-alert {
  display: block;
  position: fixed;
  width: 80%;
  margin: auto;
  top: 50vh;
  transform: translateY(-50%);
  right: 10%;
  text-align: center;
  background-color: black;
  z-index: 3;
  color: white;
  padding: 20px 20px 40px;
}
.error-alert a {
  padding: 10px 20px;
  background-color: brown;
  color: white;
  margin: 20px 0;
  border-radius: 20px;
  text-decoration: none;
  cursor: pointer;
}
.error-alert.hidden {
  display: none;
}
</style>
