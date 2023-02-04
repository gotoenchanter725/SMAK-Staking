<template>
  <v-dialog
    v-model="showLiquidityInfoDialog"
    @click:outside="$store.commit('swap/updateShowLiquidityInfoDialog', false)"
    class="swap-liquidity-info-dialog"
    transition="fade-transition"
  >
    <div class="swap-liquidity-info-dialog__container">
      <div class="swap-liquidity-info-dialog__header">
        <div class="swap-liquidity-info-dialog__header-title">You will receive</div>
        <div
          class="swap-liquidity-info-dialog__header-close"
          @click="$store.commit('swap/updateShowLiquidityInfoDialog', false)"
        >
          &times;
        </div>
      </div>

      <div class="swap-liquidity-info-dialog__amount">
        <h6 class="swap-liquidity-info-dialog__amount-receive">
          {{ getLiquidityCreated() | readableNumber(6) }}
        </h6>
        <TokenImage
          class="swap-liquidity-info-dialog__amount-token"
          :src="getTokenMetadata('tokenA').thumbnailUri"
          alt="xtz thumbnail"
        />
        <TokenImage
          class="swap-liquidity-info-dialog__amount-token"
          :src="getTokenMetadata('tokenB').thumbnailUri"
          alt="token thumbnail"
        />
      </div>
      <h5 class="swap-liquidity-info-dialog__title">
        {{ getTokenMetadata('tokenB').symbol }} / XTZ Pool Tokens
      </h5>
      <p class="swap-liquidity-info-dialog__description">
        Output is estimated. If the price changes by more <br />
        than {{ config.slippage }}% your transaction will revert.
      </p>

      <div class="swap-liquidity-info-dialog__deposited">
        <p class="swap-liquidity-info-dialog__deposited-caption">
          {{ getTokenMetadata('tokenB').symbol }} deposited
        </p>
        <TokenImage
          class="swap-liquidity-info-dialog__deposited-image"
          :src="getTokenMetadata('tokenB').thumbnailUri"
          alt="token thumbnail"
        />
        <p class="swap-liquidity-info-dialog__deposited-value">
          {{ $store.state.swap.tokenB.amount | readableNumber(6) }}
        </p>

        <p class="swap-liquidity-info-dialog__deposited-caption">XTZ deposited</p>
        <TokenImage
          class="swap-liquidity-info-dialog__deposited-image"
          :src="getTokenMetadata('tokenA').thumbnailUri"
          alt="xtz thumbnail"
        />
        <p class="swap-liquidity-info-dialog__deposited-value">
          {{ $store.state.swap.tokenA.amount | readableNumber(6) }}
        </p>
      </div>

      <div class="swap-liquidity-info-dialog__rates">
        <p class="swap-liquidity-info-dialog__rates-caption">Rates</p>
        <p class="swap-liquidity-info-dialog__rates-value">
          1 {{ getTokenMetadata('tokenB').symbol }} = {{ getTokenToXtzMarketRate() }} XTZ <br />
          1 XTZ = {{ getXtzToTokenMarketRate() }} {{ getTokenMetadata('tokenB').symbol }}
        </p>
      </div>

      <div class="swap-liquidity-info-dialog__shares">
        <p class="swap-liquidity-info-dialog__shares-caption">Pool share</p>
        <p class="swap-liquidity-info-dialog__shares-value">{{ poolShare | readableNumber(4) }}%</p>
      </div>

      <button
        @click="$store.dispatch('swap/addLiquidity')"
        class="swap-liquidity-info-dialog__button"
      >
        Confirm
      </button>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import {
  ISwapTokenInfo,
  getTokenToXtzMarketRate,
  getPoolXtzToTokenMarketRate,
  getPoolTokenMetadata,
  ISwapConfig,
  getLiquidityCreated,
} from '@/store/swap'
import { TEZ_DECIMALS } from '@/constants'
import { numberMixin } from '@/mixins/number.mixin'
import TokenImage from '@/components/shared/TokenImage.vue'
import { IFarm } from '@/interfaces/farm.interface'
import { tokenIdentifier } from '../helpers/token.helper';
import { EMPTY_METADATA } from '@/constants/tokens.const'

const SwapDialogProps = Vue.extend({
  props: {},
})

@Component({
  mixins: [numberMixin],
  components: {
    TokenImage
  },
  computed: {
    ...mapState(['theme']),
    ...mapState('swap', ['showLiquidityInfoDialog', 'poolShare', 'config']),
    ...mapState('farms', ['farmAddress', 'farmList']),
    ...mapGetters('tokens', ['tokensMetadata'])
  },
})
export default class SwapLiquidityInfoDialog extends SwapDialogProps {
  theme!: boolean
  private poolShare!: string
  private config!: ISwapConfig
  farmList!: IFarm[]
  farmAddress!: string
  tokensMetadata!: { [key: string]: ITokenMetadata }


  getCurrentFarm() {
    for (const farm of this.farmList) {
      if (farm.contractAddress === this.farmAddress) return farm
    }
    return {tokenA:undefined, tokenB:undefined}
  }

  getLiquidityCreated(): number {
    return (
      getLiquidityCreated(this.$store.state.swap, this.$store.state.dexContracts) *
      10 ** -TEZ_DECIMALS
    )
  }

  getTokenMetadata(token: 'tokenA' | 'tokenB'): ITokenMetadata {
    const farmToken = this.getCurrentFarm()[token]
    if (farmToken) {
      const identifier = tokenIdentifier({ address: farmToken.address, tokenId: farmToken.metadata.tokenId || 0 })

      return this.tokensMetadata[identifier] || farmToken.metadata || EMPTY_METADATA
    }

    return getPoolTokenMetadata(token, this.$store.state.swap, this.$store.state.dexContracts)
  }

  getXtzToTokenMarketRate(): string {
    return getPoolXtzToTokenMarketRate(this.$store.state.swap, this.$store.state.dexContracts)
  }

  getTokenToXtzMarketRate(): string {
    return getTokenToXtzMarketRate(this.$store.state.swap, this.$store.state.dexContracts)
  }

  hideDialog(): void {
    this.$store.commit('swap/updateShowLiquidityInfoDialog', false)
  }
}
</script>

<style lang="scss" scoped>
.swap-liquidity-info-dialog {
  &__container {
    display: grid;
    grid-auto-flow: row;
    gap: 1rem;

    overflow: hidden;
    background-color: var(--pannel);
    border: 1px solid #484d5f;
    color: var(--text);
    border-radius: 20px;
    padding: 2rem 1.5rem 1.5rem;
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

  &__amount {
    position: relative;
    width: max-content;
  }
  &__amount-receive {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 31px;
    font-weight: 600;
    color: var(--text);
    margin: 0.5rem 0;
    position: relative;
    z-index: 10;
  }
  &__amount-token {
    width: 28px;
    height: 28px;
    position: absolute;
    bottom: 0;
    right: -2rem;
    z-index: 2;
  }
  &__amount-token + &__amount-token {
    right: -3.25rem;
    z-index: 1;
  }

  &__title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
  }

  &__description {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    opacity: 0.57;
    margin: 0;
  }

  &__deposited {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.75rem 0.5rem;

    align-items: center;
  }
  &__deposited-caption {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  &__deposited-image {
    width: 20px;
    height: 20px;
  }
  &__deposited-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    text-align: right;
  }

  &__rates {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.75rem 0.5rem;
  }
  &__rates-caption {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  &__rates-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--swap-secondary-text);
    margin: 0;
    text-align: right;
  }

  &__shares {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.75rem 0.5rem;
  }
  &__shares-caption {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  &__shares-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--swap-secondary-text);
    margin: 0;
    text-align: right;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 600;
    background-color: #5e54d0;
    color: var(--active-btn-text);
    height: 57px;
    width: 100%;
    border-radius: 17px;
    text-align: center;
    transition: all 0.1s ease;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }
  }
}
</style>