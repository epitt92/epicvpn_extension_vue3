<template>
    <Header :backLink="{ name: 'main' }">
        <template v-slot:title> Features </template>
    </Header>
    <main class="main">
        <div class="container">
            <div class="head">
                <IconIllustrationPlace class="illustration-place" />
            </div>

            <p class="settings-title">Extra Features</p>

            <div class="settings-list">
                <router-link to="breach-monitor" class="item disabled mb-20px">
                    <div class="item__icon">
                        <IconMonitor />
                    </div>
                    <div>
                        <div class="flex">
                            <p class="item__title">Data breach monitor</p>
                            <div class="status-info ml-10px">Soon</div>
                        </div>
                        <p class="item__desc">Find out whether your personal <br> data is safe.</p>
                    </div>
                    <IconArrowRight class="item__arrow" />
                </router-link>

                <router-link to="breach-monitor" class="item disabled">
                    <div class="item__icon">
                        <IconStopHand />
                    </div>
                    <div>
                        <div class="flex">
                            <p class="item__title">Tracker blocker</p>
                            <div class="status-info ml-10px">Soon</div>
                        </div>
                        <p class="item__desc">Browse safely by blocking trackers <br> on the web.</p>
                    </div>
                    <IconArrowRight class="item__arrow" />
                </router-link>
            </div>
        </div>
    </main>
</template>

<script setup>
import IconMonitor from '@/components/icons/IconMonitor.vue';
import IconStopHand from '@/components/icons/IconStopHand.vue';
import IconArrowRight from '@/components/icons/IconArrowRight.vue';
import IconIllustrationPlace from '@/components/icons/IconIllustrationPlace.vue';
</script>

<style lang="scss" scoped>
.head {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0 44px 0;
}
</style>
