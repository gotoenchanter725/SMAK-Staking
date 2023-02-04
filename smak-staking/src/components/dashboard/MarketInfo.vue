<template>
  <div class="market-info">
    <div class="market-info__section market-info__section--gradient">
      <h6 class="market-info__title">Market cap</h6>
      <p class="market-info__value">
        {{ Math.floor(circulatingSupply * smakPrice) | readableNumber(null, 0) }} USD
      </p>
    </div>
    <div class="market-info__section">
      <h6 class="market-info__title">SMAK burned</h6>
      <p class="market-info__value">{{ latestSmakBurned | readableNumber }}</p>
    </div>
    <div class="market-info__section">
      <h6 class="market-info__title">Max supply cap</h6>
      <p class="market-info__value">{{ fullyDillutedSupply | readableNumber(null, 0) }} SMAK</p>
    </div>
    <div class="market-info__section">
      <button class="market-info__button" @click="$router.push({ name: 'Dex' })">
        <div class="market-info__icon">
          <img class="market-info__icon-image" src="@/assets/smak-logo.svg" alt="" />
        </div>
        <span class="market-info__button-text">Buy Smak</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapState, mapGetters, mapActions } from 'vuex'
import VueRouter from 'vue-router'

import { numberMixin } from '@/mixins/number.mixin'

@Component({
  mixins: [ numberMixin ],
  computed: {
    ...mapGetters('smak', [
      'circulatingSupply',
      'fullyDillutedSupply',
      'latestSmakBurned',
    ]),
    ...mapState('wallet', ['smakPrice']),
  },
  methods: {
    ...mapActions('smak', ['getSmakBurned']),
  },
})
export default class MarketInfo extends Vue {
  $router!: VueRouter
  fullyDillutedSupply!: number
  latestSmakBurned!: number
  circulatingSupply!: number
  smakPrice!: number

  getSmakBurned!: () => any

  mounted() {
   this.getSmakBurned()
  }
}
</script>

<style lang="scss" scoped>
.market-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;

  padding: 0.75rem 0.75rem;
  background-color: var(--pannel-dashboard);

  width: 100%;
  height: 220px;

  border: 0.5px solid var(--pannel-border);
  border-radius: 20px;

  &__section {
    background: var(--nested-pannel-dashboard);
    border: 0.5px solid var(--pannel-border);
    border-radius: 14px;
    padding: 0.5rem 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-x: auto;

    &--gradient {
      border: none;
      position: relative;
      z-index: 0;

      &:before {
        content: '';
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1px;
        border-radius: 14px;
        background: var(--primary-gradient);
        mask: linear-gradient(rgb(128, 122, 122) 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
      }
    }
  }

  &__title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 0.5rem;
  }

  &__value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: var(--text2-dashboard);
    margin-bottom: 0;
    white-space: nowrap;
  }

  &__icon {
    background-color: #32324a;
    width: 24px;
    height: 24px;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon-image {
    width: auto;
    height: 15px;
  }

  &__button {
    margin: 0 auto;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    background-color: #5e54d0;
    color: var(--active-btn-text);
    height: 48px;
    width: 130px;
    border-radius: 15px;
    transition: all 0.1s ease;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }
  }

  &__button-text {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    margin-top: -3px;
  }
}

@media only screen and (max-width: 700px) {
  .market-info {
    height: 203px;

    &__value {
      font-size: 14px;
    }
  }
}
</style>
