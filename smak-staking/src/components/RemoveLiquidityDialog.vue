<template>
  <v-dialog
    v-model="showRemoveLiquidityDialog"
    :content-class="theme"
    :max-width="350"
    transition="fade-transition"
    @click:outside="closeRemoveDialog"
  >
    <div class="pannel remove-liquidity-dialog">
      <div class="remove-liquidity-header">
        <h4 style="margin-top: 3px">Remove liquidity</h4>
        <h3 style="margin-right: 3px" @click="closeRemoveDialog">&#x2715;</h3>
      </div>
      <h6 style="font-size: 17px; color: #ffffff54">Amount</h6>
      <div class="remove-slider-wrapper">
        <p class="remove-slider-label" id="slider-label">{{ removeAmount }}%</p>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          v-model="removeAmount"
          class="remove-slider"
          id="slider"
        />
      </div>

      <div class="range-setters-wrapper">
        <div @click="removeAmount = '25'">
          <p>25%</p>
        </div>
        <div @click="removeAmount = '50'">
          <p>50%</p>
        </div>
        <div @click="removeAmount = '75'">
          <p>75%</p>
        </div>
        <div @click="removeAmount = '100'">
          <p>MAX</p>
        </div>
      </div>
      <div class="pannel remove-exchange-amounts-wrapper">
        <div class="remove-exchange-amount">
          <h4>{{ getTokenMetadata().symbol }}</h4>
          <div class="remove-token-logo">
            <img :src="getTokenMetadata().thumbnailUri" width="24px" />
          </div>
          <p>{{ getTokenOut() }}</p>
        </div>
        <div class="remove-exchange-amount">
          <h4>XTZ</h4>
          <div class="remove-token-logo">
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png" width="20px" />
          </div>
          <p>{{ getXtzOut() }}</p>
        </div>
      </div>
      <div class="remove-exchange-rates-wrapper">
        <h5>Price :</h5>
        <div class="remove-exchange-rates">
          <h5>1 {{ getTokenMetadata().symbol }} = {{ getTokenToXtzMarketRate() }} XTZ</h5>
          <h5>1 XTZ = {{ getXtzToTokenMarketRate() }} {{ getTokenMetadata().symbol }}</h5>
        </div>
      </div>
      <!-- Remove upon Integration with PoolLiquidityRemoveDialog -->
      <!-- <div class="remove-liquidity-actions">
        <div class="btn" @click="$store.dispatch('pool/removeLiquidity')">Remove</div>
      </div> -->
      <div class="remove-liquidity-actions">
        <div class="btn" @click="$store.commit('pool/updateShowConfirmRemoveDialog', true)">
          Remove
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
// Vuex
import { mapState, mapGetters } from 'vuex'

// Display
import { Component, Vue } from 'vue-property-decorator'
import { SwapContract } from '@/modules/contractInterfaces/swap'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import {
  getTokenToXtzMarketRate,
  getXtzToTokenMarketRate,
  getTokenMetadata,
  getXtzOut,
  getTokenOut,
} from '@/store/pool'

const RemoveLiquidityDialogProps = Vue.extend({
  props: {},
})

@Component({
  components: {},
  computed: {
    ...mapState(['theme']),
    ...mapState('pool', ['showRemoveLiquidityDialog', 'currentlyModifiedPool']),
    ...mapGetters('pool', ['lqtBurned']),
  },
})
export default class RemoveLiquidityDialog extends RemoveLiquidityDialogProps {
  private currentlyModifiedPool!: SwapContract
  private lqtBurned!: number

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

  get removeAmount(): string {
    return this.$store.state.pool.removeAmount
  }

  set removeAmount(amount: string) {
    this.$store.commit('pool/updateRemoveAmount', amount)
  }

  closeRemoveDialog(): void {
    this.$store.commit('pool/updateShowRemoveLiquidityDialog', false)
  }
}
</script>

<style lang="scss" scoped>
.remove-liquidity-dialog {
  color: var(--text);

  .remove-liquidity-header {
    display: flex;
    font-size: 18px;
    font-weight: 600;
    margin-top: -0.5rem;
    margin-bottom: 0.8rem;
    h4 {
      flex: 1;
    }

    h3:hover {
      cursor: pointer;
    }
  }

  .remove-slider-wrapper {
    .remove-slider-label {
      font-size: 3rem;
      font-weight: 900;
    }

    .remove-slider {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
      position: relative;
      top: -11px;
    }

    // Chrome
    .remove-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 20px;
      background-color: gray;
      border-radius: 50%;
      margin-top: -8px;
    }

    .remove-slider::-webkit-slider-runnable-track {
      width: 100%;
      cursor: pointer;
      background: linear-gradient(0.25turn, var(--active), var(--pannel));
      height: 3px;
    }

    // Mozilla

    .remove-slider::-moz-range-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 20px;
      background-color: gray;
      border-radius: 50%;
      margin-top: -8px;
    }

    .remove-slider::-moz-range-track {
      width: 100%;
      cursor: pointer;
      background: linear-gradient(0.25turn, var(--active), var(--pannel));
      height: 3px;
    }

    // IE

    .remove-slider::-ms-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 20px;
      background-color: gray;
      border-radius: 50%;
      margin-top: -8px;
    }

    .remove-slider::-ms-track {
      width: 100%;
      cursor: pointer;
      background: linear-gradient(0.25turn, var(--active), var(--pannel));
      height: 3px;
    }

    .remove-slider:focus {
      outline: none;
    }

    .remove-slider::-ms-track {
      width: 100%;
      cursor: pointer;
      background: transparent;
      border-color: transparent;
      color: transparent;
    }
  }

  .range-setters-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin: 1rem 0;

    div {
      flex: 1;
      text-align: center;
      background: var(--signout);
      color: var(--signout-font);
      padding: 0.2rem;
      border-radius: 10px;

      p {
        margin: auto;
      }
    }

    div:hover {
      cursor: pointer;
      opacity: 0.7;
    }
  }

  .remove-exchange-amounts-wrapper {
    width: 100%;
    padding: 16px;
    line-height: 28px;
    .remove-exchange-amount {
      display: flex;
      align-items: center;

      .remove-token-logo {
        flex: 1;
        text-align: right;
        padding-right: 0.4rem;

        img {
          vertical-align: middle;
        }
      }

      p {
        margin: auto;
        font-weight: 900;
      }
    }

    > p {
      margin: auto;
      font-weight: 900;
      font-size: 0.8rem;
      color: var(--total-locked-amount);
    }
  }

  .remove-exchange-rates-wrapper {
    display: flex;
    padding: 16px;

    .remove-exchange-rates {
      flex: 1;
      text-align: right;
    }
  }

  .remove-liquidity-actions {
    display: flex;
    gap: 0.5rem;

    div {
      flex: 1;
      text-align: center;
      //cursor: pointer;
      padding: 1.1rem;
      margin-top: 1px;
      background-color: var(--active);
      font-weight: 600;
      border-radius: 15px;
    }

    .remove-btn {
      background-color: var(--btn-disabled);
      color: var(--wallet-connection-text);
    }
  }
}

// Responsive
@media only screen and (max-width: 700px) {
}
</style>
