<template>
    <Header :backLink="{ name: 'servers' }">
        <!-- <template v-slot:title> Virtual locations </template> -->
    </Header>
    <main class="main">
        <div class="container">
            <div class="head">
                <Flag class="mb-10px flag--size-l" :code="serversCountry.servers[0].country_code" />
                <h3 class="font-medium h3 mb-4px">{{ serversCountry.name }}</h3>
                <p class="mb-0px">{{ serversCountry.servers.length }} {{ pluralize(serversCountry.servers.length, 'location') }}</p>
            </div>

            <h4 class="h4 color-paragraph mb-10px">All locations</h4>
            <div class="servers">
                <template v-for="(server, i) in serversCountry.servers" :key="i">
                    <Server :countryCode="serversCountry.servers[0].country_code" :server="server" />
                </template>
            </div>
        </div>
    </main>
</template>

<script setup>
import { computed, inject } from 'vue';
import { pluralize } from '@/helpers/mixins.js';
import Flag from '@/components/Flag.vue';
import Server from '@/components/Server.vue';

const store = inject('store');
const serversCountry = computed(() => store.state.serversCountry);
</script>

<style lang="scss" scoped>
.main {
    padding-bottom: 0;
}

.container {
    display: flex;
    flex-direction: column;
}

.head {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: 18px;
    text-align: center;
    position: relative;
    margin-bottom: 20px;

    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 0);
        height: 2px;
        width: 70%;
        background: $colorLightGrey;
    }
}
.servers {
    padding-bottom: 20px;
}
</style>
