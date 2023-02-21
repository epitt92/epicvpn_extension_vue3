import store from '@/store.js';
import { deleteConfidentialUserData } from '@/helpers/mixins.js';

export const myWorker = new Worker('web_worker.js');
myWorker.onmessage = (e) => {
  if (e.data[0] === 'connected') {
    console.log('connected--');
    // store.setValue('isNetworkError', false);
  }
  if (e.data[0] === 'not_connected') {
    console.log('disconnected--');
    // store.setValue('isNetworkError', true);
  }
};

export const getCurrentSub = (token) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'request',
        url: `${import.meta.env.VITE_API_URL}/account/v1/subscriptions/current`,
        method: 'get',
        params: { token },
      },
      async (response) => {
        if (!response.error) {
          store.setValue('subscription', response.data, true);
          response.data && chrome.storage.local.set({ subscription: { status: response.data.status } });
          resolve(response);
        } else {
          reject(response);
        }
      }
    );
  });
};

export const authCheck = (token) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'request',
        url: `${import.meta.env.VITE_API_URL}/auth/v1/auth-check`,
        method: 'get',
        params: { token },
      },
      async (response) => {
        if (response && !response.error) {
          store.setValue('user', deleteConfidentialUserData(response.data.user), true);
          resolve(response);
        } else {
          reject(response);
        }
      }
    );
  });
};

export const getReferralProgram = () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'request',
        url: `${import.meta.env.VITE_API_URL}/account/v1/referral-program/view`,
        method: 'get',
      },
      async (response) => {
        if (response && !response.error) {
          store.setValue('referralProgram', response.data, true);
          resolve(response);
        } else {
          reject(response);
        }
      }
    );
  });
};

export const logout = (router, redirectTo) => {
  store.state.connected && chrome.runtime.sendMessage({ type: 'disconnectProxy' });
  chrome.runtime.sendMessage({ type: 'deleteCookies' }, () => {});
  chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: 'default' });
  store.resetStore();

  router.push(redirectTo);
};

export const proxyConnect = ({ port, domain }) => {
  store.setValue('connected', false, true);
  store.setValue('connecting', true);

  return new Promise(async (resolve, reject) => {
    const details = await chrome.proxy.settings.get({ incognito: false });
    const { levelOfControl } = details;

    if (levelOfControl === 'not_controllable' || levelOfControl === 'controlled_by_other_extensions') {
      store.setValue('isError', true);
      resolve('Please disable other proxy.');
    } else {
      store.setValue('isError', false);

      //fist do auth check and get user data (api_token, vpn_name, vpn_password) for vpn connection
      chrome.runtime.sendMessage(
        {
          type: 'request',
          url: `${import.meta.env.VITE_API_URL}/auth/v1/auth-check`,
          method: 'get',
          params: null,
        },
        async (response) => {
          if (!response.error && response.data && response.data.auth) {
            const {
              data: {
                user: { api_token, vpn_name, vpn_password },
              },
            } = response;

            // then check connections
            chrome.runtime.sendMessage(
              {
                type: 'request',
                url: `${import.meta.env.VITE_API_URL}/account/v1/connections/check`,
                method: 'get',
                params: { token: api_token, vpn_name, vpn_password },
              },
              async (response) => {
                if (!response.error) {
                  chrome.runtime.sendMessage({ type: 'setProxy', domain, port, vpn_name, vpn_password }, (response) => {
                    setTimeout(() => {
                      store.setValue('connecting', false);
                      store.setValue('connected', response.isConnected, true);
                    }, 400);

                    response.isConnected && myWorker.postMessage(['get_ip']);

                    response.isConnected && store.setValue('connectionStarted', Date.now(), true);
                    resolve('proxy connected');
                  });
                } else {
                  store.setValue('connected', false, true);
                  store.setValue('connecting', false);
                  resolve('/account/v1/connections/check failed, proxy NOT connected');
                }
              }
            );
          } else {
            store.setValue('connected', false, true);
            store.setValue('connecting', false);
            resolve('/auth/v1/auth-check failed, proxy NOT connected');
          }
        }
      );
    }
  });
};

export const initWS = ({ userId }) => {
  console.log('Call WS');
  chrome.runtime.sendMessage(
    {
      type: 'initWS',
      userId,
    },
    async ({ wsConnected, error }) => {
      if (!error) {
        store.setValue('wsConnected', wsConnected, true);
      }
    }
  );
};

export const getMembershipInfo = (user, subscription) => {
  const isHidden = user.subscription_id && subscription && ['active', 'paused', 'canceled'].includes(subscription.status);
  console.log('Login User Info:', isHidden, user, subscription);
  if (isHidden) {
    const userInfo = {
      subscription_id: user.subscription_id,
    };
    console.log('Visible data in popup');
    chrome.storage.local.set({ subscription: { status: subscription.status } });
    chrome.storage.local.set({ user: userInfo });
    chrome.storage.local.remove(['currency', 'currencySymbol', 'monthlyPrice', 'selectedProduct', 'products', 'planCreatedAt']);
  } else {
    chrome.storage.local.remove(['subscription']);
    const userInfo = {
      traffic_limit: user.traffic_limit,
      monthly_all_used_traffic: user.monthly_all_used_traffic,
      monthly_free_used_traffic: user.monthly_free_used_traffic,
    };
    chrome.storage.local.set({ user: userInfo });
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
                console.log('GREEET:', typeof store.state.products);
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
};
