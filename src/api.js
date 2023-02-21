import axios from 'axios';
import router from './router/router.js';
import pckg from './../package.json';

const api = axios.create({
    timeout: 10000,
    baseURL: import.meta.env.VITE_API_URL,
});

// include cookies
api.defaults.withCredentials = true;

// Add a user-agent header to each request
axios.interceptors.request.use(function (config) {
    config.headers['User-Agent'] = `EpicVPNExtension/${pckg.version} (PC; ${window.navigator.userAgentData.platform};  ) ${window.navigator.userAgent}`;

    return config;
});

// process response errors
api.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        // Do something with response errors

        if (error.toJSON().message === 'Network Error') {
            localStorage.removeItem('connectionStarted');
            chrome.runtime.sendMessage({ type: 'disconnectProxy' });
            router.push('main');
        } else if (error.response && error.response.status) {
            switch (error.response.status) {
                case 401:
                    // show login to user when response has 401 status code
                    console.log('401 caught');
                    localStorage.removeItem('token');
                    router.push('get-started');
                    break;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
