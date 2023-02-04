<template>
  <div>
    <v-dialog
      v-model="showSwapConfirmationDialog"
      :content-class="theme"
      @click:outside="close"
      :max-width="447"
      class="swap-confirmation-dialog"
      transition="fade-transition"
    >
      <div class="swap-confirmation-dialog__container">
        <div class="swap-confirmation-dialog__header">
          <div class="swap-confirmation-dialog__header-title">Confirm Swap</div>
          <div
            class="swap-confirmation-dialog__header-close"
            @click="$store.commit('swap/updateShowSwapConfirmationDialog', false)"
          >
            &times;
          </div>
        </div>

        <div class="swap-confirmation-dialog__swap">
          <div class="swap-confirmation-dialog__group" :key="tokenMetaDataA.symbol">
            <div class="swap-confirmation-dialog__top-area">
              <p class="swap-confirmation-dialog__group-label">From</p>
              <p class="swap-confirmation-dialog__group-value">
                ~${{ totalPriceA | readableNumber }}
              </p>
            </div>

            <div class="swap-confirmation-dialog__token">
              <TokenImage
                :src="tokenMetaDataA.thumbnailUri"
                class="swap-confirmation-dialog__token-image"
                :alt="tokenMetaDataA.symbol"
              />
              <p class="swap-confirmation-dialog__token-symbol">
                {{ tokenMetaDataA.symbol }}
              </p>
              <p class="swap-confirmation-dialog__token-value">
                {{ tokenA.amount | readableNumber(tokenMetaDataA.decimals) }}
              </p>
            </div>
          </div>

          <button class="swap-confirmation-dialog__swap-button" @click="inverseTokens">
            <img v-if="theme === 'dark'" src="@/assets/swap-icon.svg" alt="" />
            <img v-else src="@/assets/swap-icon--black.svg" alt="" />
          </button>

          <div class="swap-confirmation-dialog__group" :key="tokenMetaDataB.symbol">
            <div class="swap-confirmation-dialog__top-area">
              <p class="swap-confirmation-dialog__group-label">To</p>
              <p class="swap-confirmation-dialog__group-value">
                ~${{ totalPriceB | readableNumber }}
              </p>
              <p
                class="swap-confirmation-dialog__group-percentage"
                :class="{
                  'swap-confirmation-dialog__group-percentage--negative': isBPercentageNegative,
                }"
              >
                ({{ isBPercentageNegative ? '' : '+'
                }}{{ priceDifferencePercentage | readableNumber }}%)
              </p>
            </div>

            <div class="swap-confirmation-dialog__token">
              <TokenImage
                :src="tokenMetaDataB.thumbnailUri"
                class="swap-confirmation-dialog__token-image"
                :alt="tokenMetaDataB.symbol"
              />
              <p class="swap-confirmation-dialog__token-symbol">
                {{ tokenMetaDataB.symbol }}
              </p>
              <p class="swap-confirmation-dialog__token-value">
                {{ tokenB.amount | readableNumber(tokenMetaDataB.decimals) }}
              </p>
            </div>
          </div>
        </div>

        <div class="swap-confirmation-dialog__price">
          <p class="swap-confirmation-dialog__price-label">Price</p>
          <p class="swap-confirmation-dialog__price-value">
            1 {{ tokenMetaDataA.symbol }} = {{ tokenExchangeRate | readableNumber }}
            {{ tokenMetaDataB.symbol }}
          </p>
        </div>

        <div class="swap-confirmation-dialog__details">
          <div class="swap-confirmation-dialog__details-header">Transaction Details</div>
          <div class="swap-confirmation-dialog__details-body">
            <div class="swap-confirmation-dialog__details-group">
              <p class="swap-confirmation-dialog__details-label">Liquidity Provider Fee</p>
              <p class="swap-confirmation-dialog__details-value">{{ liquidityProviderFee }}</p>
            </div>
            <div class="swap-confirmation-dialog__details-group">
              <p class="swap-confirmation-dialog__details-label">Price Impact</p>
              <p class="swap-confirmation-dialog__details-value">
                {{ priceImpact | readableNumber }}%
              </p>
            </div>
            <div class="swap-confirmation-dialog__details-group">
              <p class="swap-confirmation-dialog__details-label">Allowed Slippage</p>
              <p class="swap-confirmation-dialog__details-value">
                {{ config.slippage | readableNumber }}%
              </p>
            </div>
            <div class="swap-confirmation-dialog__details-group">
              <p class="swap-confirmation-dialog__details-label">Minimum sent</p>
              <p class="swap-confirmation-dialog__details-value">
                {{ minimumReceived }} {{ tokenMetaDataB.symbol }}
              </p>
            </div>
          </div>
        </div>

        <p class="swap-confirmation-dialog__helper-text">
          Your transaction will revert if there is a large, unfavorable price movement before it is
          confirmed.
        </p>

        <button
          class="swap-confirmation-dialog__confirm-button"
          @click="$store.dispatch('swap/swapTokens', userAddress)"
        >
          Confirm
        </button>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import { tokenAddressToMetadata } from '@/store/dexContracts'
import TokenImage from '@/components/shared/TokenImage.vue'
import { numberMixin } from '@/mixins/number.mixin'
import { getPoolXtzToTokenMarketRate } from '@/store/swap'
import { TimeSeries } from '@/modules/timeSeries'
import { tokenIdentifier } from '../helpers/token.helper'
import { EMPTY_METADATA } from '../constants/tokens.const'
import { ITokenMetadata } from '@/interfaces/token.interface'

@Component({
  mixins: [numberMixin],
  components: {
    TokenImage,
  },
  computed: {
    ...mapState('swap', [
      'showSwapConfirmationDialog',
      'tokenA',
      'tokenB',
      'config',
      'priceImpact',
    ]),
    ...mapState('swap', [
      'tokenA',
      'tokenB',
      'graphLoading',
      'graph',
      'config',
      'dexAction',
      'showSwapConfigModal',
      'priceImpact',
    ]),
    ...mapState('wallet', ['userAddress']),
    ...mapState(['theme']),
    ...mapState('dashboard', ['priceTimeSeriesPerToken']),
    ...mapState('dexContracts', ['xtzPriceHistory']),
    ...mapGetters('tokens', ['tokensMetadata']),
  },
})
export default class SwapConfirmationDialog extends Vue {
  showSwapConfirmationDialog!: boolean
  theme!: string
  tokenA!: any
  tokenB!: any
  priceImpact!: number
  config!: any
  userAddress!: string
  priceTimeSeriesPerToken!: { [address: string]: TimeSeries }
  xtzPriceHistory!: TimeSeries
  tokensMetadata!: { [key: string]: ITokenMetadata }

  close() {
    this.$store.commit('swap/updateShowSwapConfirmationDialog', false)
  }

  get tokenMetaDataA() {
    return this.getTokenMetadata('tokenA')
  }

  get tokenMetaDataB() {
    return this.getTokenMetadata('tokenB')
  }

  get tokenPriceA() {
    return this.getTokenPrice(this.tokenA.address, this.tokenA.tokenId)
  }

  get tokenPriceB() {
    return this.getTokenPrice(this.tokenB.address, this.tokenB.tokenId)
  }

  get tokenExchangeRate() {
    return this.tokenB.amount / this.tokenA.amount
  }

  get liquidityProviderFee(): string {
    return (Number(this.tokenB.amount) * 0.0025).toFixed(this.tokenMetaDataB.decimals)
  }

  get isBPercentageNegative() {
    return this.priceDifferencePercentage < 0
  }

  get minimumReceived(): string {
    return ((Number(this.tokenB.amount) * (100 - this.config.slippage)) / 100).toFixed(
      this.tokenMetaDataB.decimals
    )
  }

  get totalPriceA() {
    return this.tokenPriceA.usdPrice * this.tokenA.amount
  }

  get totalPriceB() {
    return this.tokenPriceB.usdPrice * this.tokenB.amount
  }

  get priceDifferencePercentage() {
    return ((this.totalPriceB - this.totalPriceA) / this.totalPriceA) * 100
  }

  getTokenPrice(address: string, tokenId: number) {
    const identifier = tokenIdentifier({ address, tokenId })
    return {
      usdPrice: this.tokensMetadata[identifier]?.usdPrice || 0,
    }
  }

  inverseTokens() {
    this.$store.dispatch('swap/inverseTokens')
  }

  getTokenMetadata(token: 'tokenA' | 'tokenB') {
    const tokenAddress = this.$store.state.swap[token].address
    const tokenId = this.$store.state.swap[token].tokenId
    const identifier = tokenIdentifier({ address: tokenAddress, tokenId: tokenId })

    return this.tokensMetadata[identifier] || EMPTY_METADATA
  }
}
</script>

<style lang="scss" scoped>
.swap-confirmation-dialog {
  &__container {
    display: grid;
    grid-auto-flow: row;
    gap: 1rem;

    overflow: hidden;
    background-color: var(--pannel);
    border: 1px solid #484d5f;
    color: var(--text);
    border-radius: 20px;
    padding: 1.3rem 1.5rem 1.5rem;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__header-title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
  }
  &__header-close {
    font-size: 2.25rem;
    margin: -1.25rem 0;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }

  &__swap {
    display: grid;
    grid-auto-flow: row;
    gap: 0.5rem;
    position: relative;
  }
  &__swap-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 2.5px solid var(--pannel);
    background-color: var(--nested-pannel);
    height: 28px;
    width: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      height: 18px;
      width: 18px;
      transition: all 0.3s ease;
    }

    &:hover {
      img {
        transform: rotate(180deg);
      }
    }
  }

  &__group {
    background: var(--nested-pannel);
    border: 1px solid var(--nested-pannel-border);
    padding: 1rem;
    border-radius: 14px;
    max-width: 100%;
    overflow-x: hidden;
  }
  &__group-label {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: var(--primary-200);
    margin-bottom: 0;
  }
  &__group-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 11px;
    color: var(--primary-200);
    margin-left: auto;
    margin-bottom: 0;
  }
  &__group-percentage {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 11px;
    color: var(--positive);
    margin-bottom: 0;
    margin-left: 0.5rem;

    &--negative {
      color: var(--negative);
    }
  }

  &__top-area {
    display: flex;
    align-items: center;
    margin-top: -3px;
    margin-bottom: 1rem;
  }

  &__token {
    display: flex;
    align-items: center;
  }
  &__token-image {
    height: 28px;
    width: 28px;
    margin-right: 0.5rem;
  }
  &__token-symbol {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 20px;
    color: var(--text);
    margin-bottom: 0;
  }
  &__token-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 22px;
    line-height: 1;
    color: var(--text);
    margin-left: auto;
    margin-bottom: 0;
    max-width: 100%;
    word-break: break-all;
    padding-left: 1rem;
  }

  &__price {
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
  }
  &__price-label,
  &__price-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: var(--primary-200);
    margin-bottom: 0;
  }
  &__price-value {
    margin-left: auto;
  }

  &__details {
    background: var(--nested-pannel);
    border: 1px solid var(--nested-pannel-border);
    border-radius: 14px;
  }
  &__details-header {
    padding: 0.75rem;
    border-bottom: 1px solid var(--nested-pannel-border);
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: var(--text);
  }
  &__details-body {
    padding: 0.75rem;
    display: grid;
    grid-auto-flow: row;
    gap: 0.5rem;
  }
  &__details-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__details-label {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 14px;
    color: var(--text);
    margin-bottom: 0;
  }
  &__details-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
    margin-bottom: 0;
  }

  &__helper-text {
    padding: 0 0.75rem;
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 13px;
    color: var(--primary-300);
    margin-bottom: 0;
  }

  &__confirm-button {
    height: 57px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 18px;
    background: var(--primary);
    color: var(--text);
    border-radius: 16px;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }
  }
}
</style>
