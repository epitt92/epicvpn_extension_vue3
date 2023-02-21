<template>
    <Header :backLink="{ name: 'main' }">
        <template v-slot:title> Virtual locations </template>
    </Header>
    <main class="main">
        <div class="container">
            <Input v-model="state.search" type="text" placeholder="Search location" :isPassword="false" autocomplete="off">
                <template v-slot:icon>
                    <IconSearch />
                </template>
            </Input>

            <div :class="['content', state.loading && 'content--loading']">
                <Loader v-if="state.loading" :type="2" :width="24" :height="24" :borderWidth="2" />
                <template v-else>
                    <div class="group" v-if="Object.keys(filteredFree).length || filteredFreeServers.length">
                        <h4 class="h4 color-paragraph mb-10px">Free locations</h4>
                        <Country :country="{ name, servers }" :class="['mb-20px']" v-for="(servers, name, i) in filteredFree" />
                        <template v-if="!Object.keys(filteredFree).length">
                            <Server :countryCode="server.country_code" :server="server" :class="['mb-20px']" v-for="(server, i) in filteredFreeServers" />
                        </template>
                    </div>

                    <div class="group" v-if="Object.keys(filteredPaid).length || filteredPaidServers.length">
                        <h4
                            class="h4 color-paragraph mb-10px"
                            v-if="store.state.user && store.state.user.subscription_id && sub && ['active', 'paused', 'canceled'].includes(store.state.subscription.status)"
                        >
                            All locations
                        </h4>
                        <h4 class="h4 color-paragraph mb-10px" v-else>Premium locations</h4>
                        <Country :country="{ name, servers }" :class="['mb-20px']" v-for="(servers, name, i) in filteredPaid" />
                        <template v-if="!Object.keys(filteredPaid).length">
                            <Server :countryCode="server.country_code" :server="server" :class="['mb-20px']" v-for="(server, i) in filteredPaidServers" />
                        </template>
                    </div>
                    <p
                        class="color-dark-grey-secondary font-medium text-align-center"
                        v-if="!Object.keys(filteredFree).length && !filteredFreeServers.length && !Object.keys(filteredPaid).length && !filteredPaidServers.length"
                    >
                        Nothing found
                    </p>
                </template>
            </div>
        </div>
    </main>
</template>

<script setup>
import { inject, reactive, computed } from 'vue';
import Country from '@/components/Country.vue';
import Server from '@/components/Server.vue';
import IconSearch from '@/components/icons/IconSearch.vue';

const store = inject('store');
const sub = computed(() => store.state.subscription);
const state = reactive({
    loading: true,
    search: '',
    freeCountries: {},
    freeServers: [],
    paidCountries: {},
    paidServers: [],
});

const filteredFree = computed(() => {
    if (state.search) {
        let filtered = {};
        for (let property in state.freeCountries) {
            if (property.toLocaleLowerCase().substring(0, 1) === state.search.toLocaleLowerCase().substring(0, 1) && property.toLowerCase().includes(state.search.toLowerCase())) {
                filtered[property] = state.freeCountries[property];
            }
        }
        return filtered;
    } else {
        return state.freeCountries;
    }
});

const filteredPaid = computed(() => {
    if (state.search) {
        let filtered = {};
        for (let property in state.paidCountries) {
            if (property.toLocaleLowerCase().substring(0, 1) === state.search.toLocaleLowerCase().substring(0, 1) && property.toLowerCase().includes(state.search.toLowerCase())) {
                filtered[property] = state.paidCountries[property];
            }
        }
        return filtered;
    } else {
        return state.paidCountries;
    }
});

const filteredFreeServers = computed(() =>
    state.freeServers.filter(
        (el) => String(el.city).toLowerCase().substring(0, 1) === state.search.toLowerCase().substring(0, 1) && String(el.city).toLowerCase().includes(state.search.toLowerCase())
    )
);
const filteredPaidServers = computed(() =>
    state.paidServers.filter(
        (el) => String(el.city).toLowerCase().substring(0, 1) === state.search.toLowerCase().substring(0, 1) && String(el.city).toLowerCase().includes(state.search.toLowerCase())
    )
);
const handleServers = (free, paid) => {
    const groupBy = function (xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };
    const paidGroupedObj = groupBy(paid, 'country');
    const freeGroupedObj = groupBy(free, 'country');

    for (const key in paidGroupedObj) {
        if (paidGroupedObj[key].findIndex((el) => !el.is_paid) >= 0) {
            if (freeGroupedObj[key]) {
                freeGroupedObj[key] = [...freeGroupedObj[key], ...paidGroupedObj[key]];
            } else {
                freeGroupedObj[key] = paidGroupedObj[key];
            }
            delete paidGroupedObj[key];
        }
    }

    state.paidCountries = Object.keys(paidGroupedObj)
        .sort()
        .reduce((accumulator, key) => {
            accumulator[key] = paidGroupedObj[key];
            paidGroupedObj[key].forEach((el) => state.paidServers.push(el));
            return accumulator;
        }, {});
    state.freeCountries = Object.keys(freeGroupedObj)
        .sort()
        .reduce((accumulator, key) => {
            accumulator[key] = freeGroupedObj[key];
            freeGroupedObj[key].forEach((el) => state.freeServers.push(el));
            return accumulator;
        }, {});
}
const getServers = async () => {
    if (store.state.paidServers || store.state.freeServers){
        console.log(store.state.paidServers)
        handleServers(store.state.freeServers, store.state.paidServers);
        state.loading = false;
    } 
};

getServers();
</script>

<style lang="scss" scoped>
.main {
    padding-bottom: 0;
}

.container {
    display: flex;
    flex-direction: column;
}

.content {
    &:not(.content--loading) {
        margin-top: 30px;
    }

    &--loading {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
    }
}
</style>
