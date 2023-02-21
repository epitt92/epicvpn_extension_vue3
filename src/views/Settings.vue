<template>
    <Header :backLink="{ name: 'main' }">
        <template v-slot:title> Settings </template>
    </Header>
    <main class="main">
        <div class="container">
            <div class="head" v-if="user">
                <div class="avatar mb-14px">
                    <IconAvatarPlaceHolder class="avatar__placeholder" />
                    <img :src="`${env.VITE_WEBSITE_URL}/${user.photo}`" v-if="user.photo" />
                </div>
                <p class="font-medium mb-2px">{{ user.name }}</p>
                <p class="font-medium font-size-small color-dark-grey-secondary mb-0px">{{ user.email }}</p>
            </div>

            <p class="settings-title">Auto Connect</p>

            <ToggleButton :checkedValue="isAutoConnect" id="tog_button_autoconnect" :onClickHandler="onClickAutoConnect" />

            <p class="settings-title">WebRTC</p>

            <ToggleButton :checkedValue="isWebRTC" id="tog_button_webrtc" :onClickHandler="onClickWebRtc" />

            <p class="settings-title">Account</p>

            <div class="settings-list">
                <router-link to="account" class="item">
                    <div class="item__icon">
                        <IconAccount />
                    </div>
                    <div class="">
                        <p class="item__title">Account</p>
                        <p class="item__desc">My account and subscription.</p>
                    </div>
                    <IconArrowRight class="item__arrow" />
                </router-link>
            </div>

            <Button
                :label="'Log out'"
                type="button"
                size="s"
                widthType="auto"
                class="btn--blue mt-20px"
                :borderRadius="4"
                loaderColor="#fff"
                :disabled="false"
                :loading="false"
                @click="logout(router, { name: 'signin' })"
            />
        </div>
    </main>
</template>

<script setup>
import { inject, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '@/actions.js';
import IconAccount from '@/components/icons/IconAccount.vue';
import IconAvatarPlaceHolder from '@/components/icons/IconAvatarPlaceHolder.vue';
import IconArrowRight from '@/components/icons/IconArrowRight.vue';
import ToggleButton from '@/views/ToggleButton.vue'

const env = import.meta.env;
const store = inject('store');
const router = useRouter();
const user = computed(() => store.state.user);

const isAutoConnect = computed(() => !!store.state.autoConnect);
const isWebRTC = computed(() => !!store.state.isWebRtc);

const onClickAutoConnect = () => {
    let autoConnect = !store.state.autoConnect;
    store.setValue("autoConnect", autoConnect, true);
}
const onClickWebRtc = () => {
    let isWebRtc = !store.state.isWebRtc;
    if(!isWebRtc){
        console.log("WebRTC is enabled", isWebRtc)
        chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: 'default' });
    } else {
        console.log("WebRTC is disabled")
        chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: 'disable_non_proxied_udp' });
    }
    chrome.storage.local.set({ isWebRtc });
    store.setValue("isWebRtc", isWebRtc, true);
}
</script>

<style lang="scss" scoped>
.head {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0 40px;
}
.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;

    img,
    &__placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
</style>
