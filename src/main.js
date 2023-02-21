import { createApp, defineAsyncComponent } from 'vue';
import './styles/app.scss';
import App from './App.vue';
import router from './router/router';
import store from './store.js';
import api from './api.js';

import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import Loader from '@/components/Loader.vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

router.beforeEach((to, from, next) => {
    const lastRoute = localStorage.getItem('lastRoute') && JSON.parse(localStorage.getItem('lastRoute'));
    console.log('lastRoute', lastRoute);

    const cachedRoute = (name) => {
        return lastRoute && lastRoute.name === name && to.name !== name && from.name !== name;
    };

    if (cachedRoute('email-verify')) {
        next({ name: 'email-verify' });
    } else if (cachedRoute('twoFA')) {
        next({ name: 'twoFA' });
    } else if (cachedRoute('password-verify')) {
        next({ name: 'password-verify' });
    } else if (cachedRoute('twoFArecoveryCode')) {
        next({ name: 'twoFArecoveryCode' });
    } else if (cachedRoute('signin')) {
        next({ name: 'signin' });
    } else {
        next();
    }

    next();
    localStorage.setItem('lastRoute', JSON.stringify({ name: to.name, query: to.query }));
});

const app = createApp(App);
app.provide('$api', api);
app.component('Button', Button);
app.component('Loader', Loader);
app.component('Input', Input);
app.component('Header', Header);
app.component('Footer', Footer);
app.use(router);
app.provide('vm', app);
//get store from worker.js, update current store, then mount app
store.getBGStore().then((storeBG) => {
    for (const key in storeBG) {
        console.log('app init storeBG', storeBG);
        store.setValue(key, storeBG[key], false);
    }
    app.provide('store', store);
    router.isReady().then(() => app.mount('#app'));
});
