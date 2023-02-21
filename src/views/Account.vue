<template>
    <Header :backLink="{ name: 'settings' }">
        <template v-slot:title> Account </template>
    </Header>
    <main class="main">
        <div class="container">
            <p class="settings-title">Account info</p>
            <div class="settings-list">
                <div class="item">
                    <div class="item__icon">
                        <IconAccountName />
                    </div>
                    <div class="item__row">
                        <p class="item__title">Name</p>
                        <p class="item__value">{{ user.name }}</p>
                    </div>
                </div>
                <div class="item">
                    <div class="item__icon">
                        <IconAccountEmail />
                    </div>
                    <div class="item__row">
                        <p class="item__title">Email</p>
                        <p class="item__value">{{ user.email }}</p>
                    </div>
                </div>
            </div>

            <div class="settings-list">
                <a :href="env.VITE_ACCOUNT_PROFILE_URL" target="_blank" class="item">
                    <div class="item__row">
                        <p class="item__title color-blue">Manage Account</p>
                        <div class="item__icon mr-0px ml-10px">
                            <IconAccountExtUrl />
                        </div>
                    </div>
                </a>
            </div>

            <p class="settings-title">Subscription</p>
            <div class="settings-list">
                <div :class="['item', !sub && 'single']">
                    <div class="item__icon">
                        <IconAccountSubStatus />
                    </div>
                    <div class="item__row">
                        <p class="item__title">Account status</p>
                        <Status :status="sub ? sub.status : 'inactive'" />
                    </div>
                </div>
                <div class="item" v-if="sub">
                    <div class="item__icon">
                        <component :is="subIconComponent"></component>
                    </div>
                    <div class="item__row">
                        <p class="item__title">{{ subEndDateLabel(sub) }}</p>
                        <p class="item__value">{{ dateParse(subEndDate(sub)) }}</p>
                    </div>
                </div>
            </div>

            <div class="settings-list mb-0px" v-if="sub">
                <a :href="env.VITE_BILLING_MEMBERSHIP_URL" target="_blank" class="item">
                    <div class="item__row">
                        <p class="item__title color-blue">Manage Subscription</p>
                        <div class="item__icon mr-0px ml-10px">
                            <IconAccountExtUrl />
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </main>
</template>

<script setup>
import { inject, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { subEndDateLabel, subEndDate } from '@/helpers/mixins.js';
import { dateParse } from '@/helpers/converters.js';
import Status from '@/components/Status.vue';
import IconAccountName from '@/components/icons/IconAccountName.vue';
import IconAccountEmail from '@/components/icons/IconAccountEmail.vue';
import IconAccountExtUrl from '@/components/icons/IconAccountExtUrl.vue';
import IconAccountSubStatus from '@/components/icons/IconAccountSubStatus.vue';
import IconAccountSubExpireOn from '@/components/icons/IconAccountSubExpireOn.vue';
import IconAccountSubExpiredOn from '@/components/icons/IconAccountSubExpiredOn.vue';
import IconAccountSubRenewOn from '@/components/icons/IconAccountSubRenewOn.vue';
import IconAccountSubFailedOn from '@/components/icons/IconAccountSubFailedOn.vue';
import IconAccountSubRefundedOn from '@/components/icons/IconAccountSubRefundedOn.vue';

const env = import.meta.env;
const store = inject('store');
const user = computed(() => store.state.user);
const sub = computed(() => store.state.subscription);
const subIconComponent = computed(() => {
    const status = String(sub.value.status).toLocaleLowerCase();
    if (['active'].includes(status)) {
        return IconAccountSubRenewOn;
    } else if (['paused', 'canceled'].includes(status)) {
        return IconAccountSubExpireOn;
    } else if (['expired'].includes(status)) {
        return IconAccountSubExpiredOn;
    } else if (['failed'].includes(status)) {
        return IconAccountSubFailedOn;
    } else if (['refunded'].includes(status)) {
        return IconAccountSubRefundedOn;
    }
});
</script>

<style lang="scss" scoped></style>
