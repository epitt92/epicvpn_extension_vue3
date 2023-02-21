<template>
    <main class="main">
        <div class="container">
            <div id="upperPart">
                <IconLogo class="logo" />
                <IconIllustrationPlace class="illustration-place mt-20px mb-20px" />
                <h1 class="h1 font-bold">Let's get started</h1>
                <p class="title-subtext">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            </div>
            <div id="lowerPart">
                <div class="buttons">
                    <Button :label="'Get Started'" type="button" size="m" widthType="fluid" class="btn--blue mb-24px" loaderColor="#fff" :borderRadius="4" @click.native="goToEpic" />
                    <Button :label="'Sign in'" type="link" size="m" widthType="fluid" class="btn--border-blue" :borderRadius="4" :to="{ name: 'signin' }" />
                </div>
            </div>
        </div>
    </main>
    <Bg class="bg" />
</template>

<script setup>
import { inject, defineAsyncComponent } from 'vue';
import IconLogo from '@/components/icons/IconLogo.vue';
import IconIllustrationPlace from '@/components/icons/IconIllustrationPlace.vue';

const Bg = defineAsyncComponent(() => import('@/components/Bg.vue'));

function goToEpic() {
    window.open(import.meta.env.VITE_SIGNUP_URL, '_blank');
}
</script>

<style scoped>
.container {
    text-align: center;
    display: flex;
    flex-direction: column;
    height: 100%;
}

#upperPart {
    text-align: center;
    background-size: cover;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
}

#lowerPart {
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    background-size: cover;
    margin-top: auto;
    padding-bottom: 30px;
}

.buttons {
    align-self: flex-end;
    justify-content: center;
    width: 100%;
}

p {
    max-width: 200px;
}
</style>
