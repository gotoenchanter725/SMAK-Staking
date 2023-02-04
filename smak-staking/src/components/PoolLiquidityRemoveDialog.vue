<template>
  <v-dialog
    v-model="showConfirmRemoveDialog"
    class="pool-liquidity-remove-dialog"
    transition="fade-transition"
    @click:outside="$store.commit('pool/updateShowConfirmRemoveDialog', false)"
  >
    <div class="pool-liquidity-remove-dialog__container">
      <div class="pool-liquidity-remove-dialog__header">
        <div
          class="pool-liquidity-remove-dialog__header-back"
          @click="$store.commit('pool/updateShowConfirmRemoveDialog', false)"
        >
          <img src="@/assets/arrow-left.svg" alt="" />
        </div>
        <div
          class="pool-liquidity-remove-dialog__header-close"
          @click="$store.commit('pool/updateShowConfirmRemoveDialog', false)"
        >
          &times;
        </div>
      </div>

      <div class="pool-liquidity-remove-dialog__title">You will receive</div>

      <div class="pool-liquidity-remove-dialog__tokens">
        <div class="pool-liquidity-remove-dialog__token">
          <img
            class="pool-liquidity-remove-dialog__token-image"
            :src="getTokenMetadata().thumbnailUri"
            alt=""
          />
          <p class="pool-liquidity-remove-dialog__token-name">{{ getTokenMetadata().symbol }}</p>
          <p class="pool-liquidity-remove-dialog__token-amount">{{ getTokenOut() }}</p>
        </div>

        <div class="pool-liquidity-remove-dialog__tokens-plus">+</div>

        <div class="pool-liquidity-remove-dialog__token">
          <img
            class="pool-liquidity-remove-dialog__token-image"
            :src="xtzMetadata.thumbnailUri"
            alt="xtz thumbnail"
          />
          <p class="pool-liquidity-remove-dialog__token-name">XTZ</p>
          <p class="pool-liquidity-remove-dialog__token-amount">{{ getXtzOut() }}</p>
        </div>
      </div>

      <h5 class="pool-liquidity-remove-dialog__caption">Contract:</h5>
      <h5 class="pool-liquidity-remove-dialog__caption">
        {{ currentlyModifiedPool ? currentlyModifiedPool.storage.lqtAddress : '' }}
      </h5>
      <p class="pool-liquidity-remove-dialog__description">
        Output is estimated. If the price changes by more than 0.8% your transaction will revert.
      </p>

      <div class="pool-liquidity-remove-dialog__card">
        <div class="pool-liquidity-remove-dialog__burned">
          <p class="pool-liquidity-remove-dialog__burned-caption">
            LP XTZ/{{ getTokenMetadata().symbol }} Burned
          </p>
          <div class="pool-liquidity-remove-dialog__burned-tokens">
            <img
              class="pool-liquidity-remove-dialog__burned-token-image"
              :src="xtzMetadata.thumbnailUri"
              alt="xtz thumbnail"
            />
            <img
              class="pool-liquidity-remove-dialog__burned-token-image"
              :src="getTokenMetadata().thumbnailUri"
              alt="token thumbnail"
            />
          </div>
          <p class="pool-liquidity-remove-dialog__burned-value">{{ calculatedLqtBurned | readableNumber }}</p>
        </div>

        <div class="pool-liquidity-remove-dialog__price">
          <p class="pool-liquidity-remove-dialog__price-caption">Price:</p>
          <p class="pool-liquidity-remove-dialog__price-value">
            1 {{ getTokenMetadata().symbol }} = {{ getTokenToXtzMarketRate() }} XTZ <br />
            1 XTZ = {{ getXtzToTokenMarketRate() }} {{ getTokenMetadata().symbol }}
          </p>
        </div>
      </div>

      <button class="pool-liquidity-remove-dialog__button" @click="hideDialog">Confirm</button>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { mapState, mapGetters } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { SwapContract } from '@/modules/contractInterfaces/swap'
import { xtzMetadata } from '@/store/dexContracts'
import {
  getTokenToXtzMarketRate,
  getXtzToTokenMarketRate,
  getTokenMetadata,
  getXtzOut,
  getTokenOut,
} from '@/store/pool'
import { numberMixin } from '@/mixins/number.mixin'
import { TEZ_DECIMALS } from '@/constants'

const PoolDialogProps = Vue.extend({
  props: {},
})

@Component({
  mixins: [numberMixin],
  computed: {
    ...mapState(['theme']),
    ...mapState('pool', ['showConfirmRemoveDialog', 'currentlyModifiedPool']),
    ...mapGetters('pool', ['lqtBurned']),
  },
})
export default class PoolLiquidityRemoveDialog extends PoolDialogProps {
  theme!: boolean
  private currentlyModifiedPool!: SwapContract
  private lqtBurned!: number

  get calculatedLqtBurned() {
    return this.lqtBurned  * 10 ** -TEZ_DECIMALS
  }

  get xtzMetadata(): ITokenMetadata {
    return xtzMetadata
  }

  getXtzToTokenMarketRate(): string {
    return getXtzToTokenMarketRate(this.$store.state.pool, this.$store.state.dexContracts)
  }

  getTokenToXtzMarketRate(): string {
    return getTokenToXtzMarketRate(this.$store.state.pool, this.$store.state.dexContracts)
  }

  getTokenOut(): string {
    return getTokenOut(this.lqtBurned, this.$store.state.pool, this.$store.state.dexContracts)
  }

  getXtzOut(): string {
    return getXtzOut(this.lqtBurned, this.$store.state.pool, this.$store.state.dexContracts)
  }

  getTokenMetadata(): ITokenMetadata {
    return getTokenMetadata(this.$store.state.pool, this.$store.state.dexContracts)
  }

  hideDialog(): void {
    this.$store.dispatch('pool/removeLiquidity')
    this.$store.commit('pool/updateShowConfirmRemoveDialog', false)
  }
}
</script>

<style lang="scss" scoped>
.pool-liquidity-remove-dialog {
  &__container {
    display: grid;
    grid-auto-flow: row;

    overflow: hidden;
    background-color: var(--pannel);
    border: 1px solid #484d5f;
    color: var(--text);
    border-radius: 20px;
    padding: 2rem;

    width: 420px;
    max-width: 100vw;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  &__header-back {
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
  &__header-close {
    font-size: 2.25rem;
    margin: -1.25rem 0;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }

  &__title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 1.5rem;
  }

  &__tokens {
    margin-bottom: 1rem;
  }
  &__tokens-plus {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 1;
    color: var(--text);
    text-align: right;
  }
  &__token {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: auto auto 1fr;
    gap: 0.5rem;

    align-items: center;
  }
  &__token-image {
    height: 20px;
    width: 20px;
  }
  &__token-name {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  &__token-amount {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    text-align: right;
  }

  &__caption {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.5rem;
    word-break: break-all;
  }

  &__description {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 14px;
    color: var(--text);
    opacity: 0.57;
    margin-bottom: 1rem;
  }

  &__card {
    padding: 1rem;
    border: 0.566282px solid var(--inside-dialog-card-border);
    border-radius: 17px;
    margin: 0 -1rem 1rem;
  }

  &__burned {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }
  &__burned-caption {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  &__burned-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 21px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  &__burned-tokens {
    display: flex;
    align-items: center;
  }
  &__burned-token-image {
    height: 20px;
    width: 20px;
    position: relative;
    z-index: 2;
  }
  &__burned-token-image + &__burned-token-image {
    margin-left: -0.25rem;
    z-index: 1;
  }

  &__price {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.75rem 0.5rem;
  }
  &__price-caption {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  &__price-value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--pool-secondary-text);
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
    color: var(--pool-secondary-text);
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
    width: calc(100% + 2rem);
    border-radius: 17px;
    text-align: center;
    transition: all 0.1s ease;
    margin: 0 -1rem 0;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }
  }
}
</style>
