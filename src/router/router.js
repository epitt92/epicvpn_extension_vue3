import { createRouter, createWebHistory } from 'vue-router';

export default createRouter({
    history: createWebHistory('/'),
    routes: [
        {
            name: 'get-started',
            path: '/',
            component: () => import('@/views/GetStarted.vue'),
        },
        {
            name: 'signin',
            path: '/signin',
            component: () => import('@/views/Signin.vue'),
        },
        {
            name: 'email-verify',
            path: '/email-verify',
            component: () => import('@/views/EmailVerify.vue'),
        },
        {
            name: 'password-forgot',
            path: '/password-forgot',
            component: () => import('@/views/PasswordForgot.vue'),
        },
        {
            name: 'password-verify',
            path: '/password-verify',
            component: () => import('@/views/PasswordVerify.vue'),
        },
        {
            name: 'password-reset',
            path: '/password-reset',
            component: () => import('@/views/PasswordReset.vue'),
        },
        {
            name: 'twoFA',
            path: '/twoFA',
            component: () => import('@/views/TwoFA.vue'),
        },
        {
            name: 'twoFArecoveryCode',
            path: '/twoFArecoveryCode',
            component: () => import('@/views/TwoFArecoveryCode.vue'),
        },
        {
            name: 'main',
            path: '/main',
            component: () => import('@/views/Main.vue'),
        },
        {
            name: 'premium',
            path: '/premium',
            component: () => import('@/views/Premium.vue'),
        },
        {
            name: 'features',
            path: '/features',
            component: () => import('@/views/Features.vue'),
        },
        {
            name: 'settings',
            path: '/settings',
            component: () => import('@/views/Settings.vue'),
        },
        {
            name: 'account',
            path: '/account',
            component: () => import('@/views/Account.vue'),
        },
        {
            name: 'servers',
            path: '/servers',
            component: () => import('@/views/Servers.vue'),
        },
        {
            name: 'servers-country',
            path: '/servers-country',
            component: () => import('@/views/ServersCountry.vue'),
        },
        {
            name: 'refer',
            path: '/refer',
            component: () => import('@/views/Refer.vue'),
        },
        // {
        //     path: '/contact',
        //     component: () => import('@/views/Contact.vue'),
        // },
    ],
});
