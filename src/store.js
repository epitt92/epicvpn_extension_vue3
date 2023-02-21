import { reactive, readonly } from 'vue';

const initialState = {
    isProxyError: false,
    isNetworkError: false,
    isError: false,
    overlayLoader: false,
    user: null,
    userPassword: null,
    userEmail: null,
    subscription: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    connectionStarted: null,
    port: 8089,
    serversCountry: null,
    server: null,
    wsConnected: false,
    autoConnect: true,
    isWebRtc: false,
    paidServers: null,
    freeServers: null,
    currency : '$',
    currencySymbol : 'usd',
    monthlyPrice : null,
    selectedProduct : null,
    products : []
};

const state = reactive({ ...initialState });

const getBGStore = () => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'getBGStore' }, (response) => {
            resolve(response);
        });
    });
};

const updateBGStore = (key, value) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'updateBGStore', key, value }, (response) => {
            resolve(response);
        });
    });
};

const setValue = (key, value, saveToBackgroundStore) => {
    state[key] = value;

    saveToBackgroundStore &&
        chrome.runtime.sendMessage(
            {
                type: 'updateBGStore',
                value,
                key,
            },
            (store) => console.log('store updated', store)
        );
};

const resetStore = (keys) => {
    if (keys && keys.length) {
        keys.forEach((key) => {
            if (initialState.hasOwnProperty(key)) {
                state[key] = initialState[key];
                updateBGStore(key, initialState[key]);
            }
        });
    } else {
        for (const key in state) {
            state[key] = initialState[key];
            updateBGStore(key, initialState[key]);
            localStorage.clear();
        }
    }
};

export default {
    state: readonly(state),
    setValue,
    resetStore,
    getBGStore,
    updateBGStore,
};
