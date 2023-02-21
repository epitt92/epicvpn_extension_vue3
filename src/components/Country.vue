<template>
    <div class="country" @click="saveCountry">
        <div class="country__left">
            <Flag class="mr-10px flag--size-s" :code="country.servers[0].country_code" />
            <div>
                <p class="font-medium mb-0px">{{ country.name }}</p>
                <p class="mb-0px font-size-small">{{ country.servers.length }} {{ pluralize(country.servers.length, 'location') }}</p>
            </div>
        </div>
        <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="transition-primary" d="M0.859009 1.91715L2.80252 0.0160065L11.8025 9.01601L2.80252 18.016L0.859009 16.1149L8.00024 9.01601L0.859009 1.91715Z" fill="#C5CFDF" />
        </svg>
    </div>
</template>
<script setup>
import { computed, defineEmits, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Flag from '@/components/Flag.vue';
import { pluralize } from '@/helpers/mixins.js';

const store = inject('store');
const router = useRouter();
const props = defineProps({
    country: {
        type: Object,
        default: () => {
            return {
                name: '',
                servers: [],
            };
        },
    },
});

const saveCountry = () => {
    store.setValue('serversCountry', props.country);
    router.push({ name: 'servers-country' });
};
</script>

<style lang="scss" scoped>
.country {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    min-height: 32px;

    &__left {
        display: flex;
        align-items: center;
    }

    &:hover {
        svg path {
            fill: darken($color: #c5cfdf, $amount: 10);
        }
    }

    &:active {
        svg path {
            fill: #c5cfdf;
        }
    }
}
</style>
