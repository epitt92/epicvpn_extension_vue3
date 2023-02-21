<template>
  <Header :backLink="{ name: 'main' }">
    <template v-slot:title><h3 class="h3 mb-0px">Get Premium Now</h3></template>
  </Header>
  <main class="main">
    <div class="container">
      <ul class="list">
        <li>Ultra fast connection speed</li>
        <li>200+ virtual locations</li>
        <li>Ad-free experience</li>
        <li>Connect up to 5 devices</li>
      </ul>

      <Loader v-if="state.loading" :type="2" :width="24" :height="24" :borderWidth="2" />
      <template v-else>
        <template v-if="store.state.products.length">
          <div
            class="product"
            :class="{ 'most-selected': product.product_id == store.state.selectedProduct.product_id }"
            v-for="product in store.state.products"
            :key="product.product_id"
            @click="store.setValue('selectedProduct', product, true)"
          >
            <div v-if="product.discounted_badge" class="product__badge">Save {{ planSavePercent(product.plan) }}%</div>
            <div>
              <p class="font-medium mb-2px">{{ product.name }}</p>
              <p class="color-paragraph mb-0px font-size-small">Total Billed {{ store.state.currencySymbol }}{{ (product.plan.amount / 100).toFixed(2) }}</p>
            </div>
            <div class="text-align-right">
              <p class="font-medium mb-2px">{{ store.state.currencySymbol }}{{ planMainPrice({ product, plan: product.plan }) }}</p>
              <template v-if="product.as_monthly_rate">
                <p class="color-paragraph mb-0px font-size-small" v-if="['year', 'month'].includes(product.plan.interval)">Monthly</p>
                <p class="color-paragraph mb-0px font-size-small" v-else-if="['day'].includes(product.plan.interval)">Daily</p>
              </template>
            </div>
          </div>

          <a class="btn btn-size--s width-auto br-24px btn--blue font-size-small mt-10px" :href="href" target="blank">Upgrade to Premium</a>
        </template>
        <span v-else>No products.</span>
      </template>
    </div>
  </main>
</template>

<script setup>
import { inject, onBeforeMount, reactive, computed } from 'vue';
import { parsePrice } from '@/helpers/mixins.js';

const store = inject('store');
const state = reactive({
  loading: false,
});

const planSavePercent = (plan) => {
  let res = 0;
  let planPrice = parsePrice(plan.amount, 'get');
  console.log('CALC:', planPrice, store.state.monthlyPrice, plan.interval_count);
  if (['month'].includes(plan.interval)) {
    res = Math.ceil(((store.state.monthlyPrice * plan.interval_count - planPrice) / (store.state.monthlyPrice * plan.interval_count)) * 100);
  } else if (['year'].includes(plan.interval)) {
    res = Math.ceil(((store.state.monthlyPrice * 12 - planPrice) / (store.state.monthlyPrice * 12)) * 100);
  }

  return res;
};

const planMainPrice = ({ product, plan }) => {
  const { as_monthly_rate } = product;
  let result;
  let amount = parsePrice(plan.amount, 'get');
  const { interval, interval_count } = plan;

  switch (interval) {
    case 'month':
      if (as_monthly_rate) {
        result = (amount / interval_count).toFixed(2);
      } else {
        result = amount;
      }
      break;
    case 'year':
      if (as_monthly_rate) {
        result = (amount / (12 * interval_count)).toFixed(2);
      } else {
        result = amount;
      }
      break;
    case 'day':
      if (as_monthly_rate) {
        result = (amount / interval_count).toFixed(2);
      } else {
        result = amount;
      }
      break;
    default:
      break;
  }
  return result;
};

const href = computed(() => {
  if (!store.subscription) {
    return store.state.selectedProduct && `https://epicvpn.net/en/order?currency=${store.state.currency}&service_id=1&product_id=${store.state.selectedProduct.product_id}`;
  } else {
    return store.state.selectedProduct && `https://epicvpn.net/en/billing/reactivate?currency=${store.state.currency}&service_id=1&product_id=${store.state.selectedProduct.product_id}`;
  }
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.list {
  list-style: none;
  padding: 0;
  margin: 10px 0 30px;

  li {
    position: relative;
    padding-left: 28px;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translate(0, -50%);
      width: 18px;
      height: 18px;
      background: url('chrome-extension://__MSG_@@extension_id__/images/icons/check-circle.svg') no-repeat center/contain;
    }

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
}

.product {
  border: 2px solid $colorLightGrey;
  border-radius: 6px;
  background-color: $colorLightGrey;
  padding: 10px;
  margin: 10px 0;
  width: 100%;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__badge {
    position: absolute;
    background-color: #e4e5e9;
    color: $colorBlue;
    border-radius: 12px;
    padding: 4px 10px;
    font-size: 10px;
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
    line-height: 1;
  }

  &.most-selected {
    border: 2px solid $colorBlue;
    background-color: $colorWhite;

    .product__badge {
      background: $colorBlue;
      color: $colorWhite;
    }
  }
}
</style>
