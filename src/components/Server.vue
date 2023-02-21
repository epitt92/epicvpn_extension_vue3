<template>
    <label class="server" :for="`server_radio_button_${id}`">
        <div class="server__left">
            <Flag class="mr-10px flag--size-s" :code="props.countryCode" :premium="premium" />
            <p class="font-medium mb-0px">{{ props.server.city }}</p>
        </div>
        <div class="server__right">
            <Signal :quality="props.server.quality" class="mr-10px" />
            <input type="radio" :id="`server_radio_button_${id}`" name="server_radio_button" :value="props.server" v-model="server" @click="serverOnClick" />
            <span class="server__checkmark"></span>
        </div>
    </label>
</template>

<script setup>
import { inject, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { proxyConnect } from '@/actions.js';
import Flag from '@/components/Flag.vue';
import Signal from '@/components/Signal.vue';

const store = inject('store');
const router = useRouter();
const props = defineProps({
    countryCode: {
        type: String,
        default: 'us',
    },
    server: {
        type: Object,
    },
});
const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const server = computed({
    get: () => store.state.server,
    set: (val) => {
        if (!userFree.value || (userFree.value && !props.server.is_paid)) {
            store.setValue('server', val, true);
            chrome.storage.local.set( {server: val} );
        } else {
            router.push('premium');
        }
    },
});
const premium = computed(() => {
    return !store.state.subscription || (store.state.subscription && ['expired', 'failed', 'refunded'].includes(store.state.subscription.status)) ? props.server.is_paid : false;
});
const userFree = computed(() => {
    return (
        store.state.user &&
        (!store.state.user.subscription_id || (store.state.subscription && ['failed', 'expired', 'refunded'].includes(store.state.subscription.status)) || !store.state.subscription)
    );
});

const proxyConnectHandler = () => {
    router.push('main').then(() => {
        proxyConnect({
            port: store.state.port,
            domain: store.state.server ? store.state.server.domain : props.server.domain,
        });
    });
};

const serverOnClick = () => {
    store.state.server && store.state.server.city === props.server.city && proxyConnectHandler();
};

watch(server, (currentValue, oldValue) => {
    currentValue && ((userFree.value && !currentValue.is_paid) || !userFree.value) && proxyConnectHandler();
});
</script>

<style lang="scss" scoped>
.server {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    position: relative;
    min-height: 32px;

    &:not(:last-child) {
        margin-bottom: 20px;
    }

    &__left,
    &__right {
        display: flex;
        align-items: center;
    }

    &__checkmark {
        width: 14px;
        height: 14px;
        border: 2px solid $colorGrey;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &::before {
            content: '';
            flex-shrink: 0;
            width: 6px;
            height: 6px;
            background: #12a2f6;
            border-radius: 50%;
            opacity: 0;
        }
    }

    input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;

        &:checked {
            & + .server__checkmark {
                border-color: #12a2f6;

                &::before {
                    opacity: 1;
                }
            }
        }
    }

    &:hover {
        .server__checkmark {
            border-color: #12a2f6;

            &::before {
                opacity: 1;
            }
        }
    }
}
</style>
