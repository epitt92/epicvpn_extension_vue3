<template>
  <Header :backLink="{ name: 'main' }">
    <template v-slot:title><h3 class="h3 mb-0px">Refer a friend</h3></template></Header
  >
  <main class="main">
    <div class="container">
      <ImgReferPartial class="partial" />

      <div class="block mb-10px">
        <div class="clipboard">
          <span class="color-dark-grey-secondary font-size-small">{{ referrelLink }}</span>
          <IconClipboard class="clipboard__icon" @click.native="copyToClipboard(referrelLink)" />
        </div>
      </div>

      <template v-if="store.state.referralProgram">
        <div class="row">
          <div class="col">
            <h5 class="h5 text-align-center">REFERRED FRIENDS</h5>
            <div class="block">
              <div class="block__value">{{ store.state.referralProgram.referrals_count }}</div>
              <div class="block__desc">Referrals</div>
            </div>
          </div>
          <div class="col">
            <h5 class="h5 text-align-center">BONUS DAYS</h5>
            <div class="block">
              <div class="block__value">{{ store.state.referralProgram.bonus_days_left }}</div>
              <div class="block__desc">Days Remaining</div>
            </div>
          </div>
        </div>

        <h5 class="h5 text-align-center">HOW IT WORKS</h5>
        <p class="mb-0px color-dark-grey-secondary text-align-center font-size-small">
          For every friend that you refer and subscribes using your link, you'll get 30 days of premium service. It's easy to refer your friends - just share your unique referral link with
          them.
        </p>
      </template>
    </div>
  </main>
  <Footer class="footer text-align-center font-size-small">
    <template v-slot:content>
      <a class="link link--paragraph text-underline font-medium" :href="env.VITE_SIGNUP_URL" target="_blank">Terms and conditions</a>
    </template>
  </Footer>
</template>

<script setup>
import { inject, computed } from 'vue';
import IconClipboard from '@/components/icons/IconClipboard.vue';
import ImgReferPartial from '@/components/ImgReferPartial.vue';

const env = import.meta.env;
const store = inject('store');
const referrelLink = computed(() => `${env.VITE_WEBSITE_URL}/r/${store.state.user.referral_program_token}`);
const copyToClipboard = async (text) => {
  const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
  try {
    const copyText = text;
    navigator.clipboard.writeText(copyText);
  } catch (error) {
    const permissionStatus = await navigator.permissions.query(queryOpts);
    console.log(permissionStatus.state);
    console.log(error);
  }
};
</script>

<style scoped lang="scss">
.main {
  padding-top: 30px;
}

.partial {
  width: 90%;
  height: auto;
  margin-bottom: 20px;
}

.block {
  background: $colorLightGrey;
  border-radius: 16px;
  padding: 18px;
  flex-grow: 1;
  text-align: center;

  &__value {
    font-size: 30px;
    color: $colorBlue;
    font-family: $fontM;
    margin-bottom: 6px;
  }

  &__desc {
    font-size: 12px;
    line-height: 14px;
    color: $colorDarkGreySecondary;
  }
}
.clipboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $colorWhite;
  border-radius: $borderRadiusPrimary;
  min-height: 28px;
  padding: 0 10px;
}

.h5 {
  color: $colorParagraph;
  font-family: $fontM;
  margin-bottom: 6px;
}

.row {
  display: flex;
  margin: 0 -10px 10px -10px;

  .col {
    margin: 10px;
    width: calc(50% - 20px);
    display: flex;
    flex-direction: column;
  }
}
</style>

<style lang="scss">
.clipboard {
  &__icon {
    cursor: pointer;

    &:hover {
      path {
        fill: $colorGrey;
        transition: $transitionPrimary;
      }
    }

    &:active {
      path {
        fill: #e2e5e9;
      }
    }
  }
}
</style>
