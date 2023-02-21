<template>
    <main class="main">
        <div class="container">
            <div class="header">
                <IconLogo class="header__logo" />
                <router-link class="refer-link" to="refer">
                    <IconGift class="refer-link__icon" />
                </router-link>
            </div>

            <div class="content">
                <div class="content__up">
                    <p class="color-paragraph mb-0px font-medium">{{ title }}</p>
                    <TurnOnOffButton class="mt-38px mb-38px" ref="button" :on="false" @onClick="onProxyBtnClick" />
                </div>
                <div class="content__down"></div>
                <router-link class="select-location" to="servers">
                    <template v-if="store.state.server">
                        <Flag class="mr-10px" :code="store.state.server.country_code" />
                        <p class="mb-0px font-medium">{{ store.state.server.city }}</p>
                    </template>
                    <template v-else>
                        <IconGlobal class="mr-10px" />
                        <div>
                            <p class="font-size-small font-medium color-grey mb-2px">Select location</p>
                            <p class="mb-0px font-medium">Select Server</p>
                        </div>
                    </template>
                    <IconTriangleRight class="select-location__arrow" />
                </router-link>

                WS connected: {{ store.state.wsConnected }}
            </div>
        </div>

        <Nav :sub="null" />
    </main>
    <Bg class="bg" />
</template>

<script setup>
import { inject, ref, computed, defineAsyncComponent, onBeforeMount } from 'vue';
import IconLogo from '@/components/icons/IconLogo.vue';
import TurnOnOffButton from '@/components/TurnOnOffButton.vue';
import Flag from '@/components/Flag.vue';
import IconGlobal from '@/components/icons/IconGlobal.vue';
import IconGift from '@/components/icons/IconGift.vue';
import IconTriangleRight from '@/components/icons/IconTriangleRight.vue';
import Nav from '@/components/Nav.vue';
import { proxyConnect } from '@/actions.js';
import { useRouter } from 'vue-router';

const Bg = defineAsyncComponent(() => import('@/components/Bg.vue'));
const router = useRouter();
const store = inject('store');
const button = ref(null);
const disconnecting = computed(() => store.state.disconnecting);
const connecting = computed(() => store.state.connecting);
const connected = computed(() => store.state.connected);

const title = computed(() => {
    if (disconnecting.value) {
        return 'DISCONNECTING...';
    } else if (connecting.value) {
        return 'CONNECTING...';
    } else if (connected.value) {
        return 'CONNECTED';
    } else if (!connected.value) {
        return 'DISCONNECTED';
    }
});

const onProxyBtnClick = () => {
    const { port, server } = store.state;

    if (connected.value) {
        chrome.runtime.sendMessage({ type: 'disconnectProxy' });
        store.setValue('connected', false, true);
        store.setValue('connecting', true);
        store.setValue('disconnecting', true);
        setTimeout(() => {
            store.setValue('connecting', false);
            store.setValue('disconnecting', false);
        }, 1000);
    } else if (!connected.value && server) {
        proxyConnect({ port, domain: server.domain });
    } else if (!connected.value && !server) {
        router.push('servers');
    }
};
</script>

<style lang="scss" scoped>
.main {
    padding: 0;
}

.header {
    margin-top: 36px;
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    min-height: 42px;

    &__logo {
        position: absolute;
        left: 50%;
        top: 6%;
        transform: translate(-50%, 0);
    }
}

.refer-link {
    width: 20px;
    height: 20px;

    &__icon {
        width: inherit;
        height: inherit;
    }
}

.container {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.content {
    flex-grow: 1;
    margin-bottom: 100px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 40px 0;

    &__up {
        width: 100%;
        display: flex;
        align-items: center;
        flex-flow: column;
    }
}
</style>
