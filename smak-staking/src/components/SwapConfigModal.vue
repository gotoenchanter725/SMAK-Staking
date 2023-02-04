<template>
  <div class="pannel swap-config-modal"
    v-if="showSwapConfigModal"
    v-click-outside="
      () => {
        showSwapConfigModal = false
      }
    ">
    <p class="swap-config-title" style="margin-bottom: 12px">Trade setting</p>
    <p class="slippage-tolerance-label">Slippage tolerance</p>
    <div class="slippage-tolerance-settings-wrapper">
      <button
        :class="
          configSlippagePercentage == 0.5
            ? 'slippage-tolerance-button active-button'
            : 'slippage-tolerance-button'
        "
        @click="configSlippagePercentage = 0.5"
      >
        0.5%
      </button>
      <button
        :class="
          configSlippagePercentage == 1
            ? 'slippage-tolerance-button active-button'
            : 'slippage-tolerance-button'
        "
        @click="configSlippagePercentage = 1"
      >
        1%
      </button>
      <button
        :class="
          configSlippagePercentage == 3
            ? 'slippage-tolerance-button active-button'
            : 'slippage-tolerance-button'
        "
        @click="configSlippagePercentage = 3"
      >
        3%
      </button>
      <div class="slippage-tolerance-input-wrapper">
        <input
          type="number"
          min="0.1"
          step="0.1"
          placeholder="0.10"
          v-on:keypress="isNumber($event)"
          v-model="customSlippage"
        />
        <p style="position: relative; right: 7px">%</p>
      </div>
    </div>
    <p style="font-family: 'Source Sans Pro'; margin-bottom: 7px">Transaction timeout</p>
    <div class="transaction-timeout-input">
      <input 
        type="number"
        min="0"
        v-model="deadlineDelta"
        placeholder="20"
        v-on:keypress="isNumber($event)"
      />

      <p>min</p>
    </div>
  </div>
</template>

<script lang="ts">
// Vuex
import { mapState } from 'vuex'

// Display
import { Component, Vue } from 'vue-property-decorator'
import { ISwapConfig } from '@/store/swap'
import { numberMixin } from '@/mixins/number.mixin'

const SwapConfigModalProps = Vue.extend({
  props: {},
})

@Component({
  mixins: [numberMixin],
  components: {},
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'tk']),
    ...mapState(['theme']),
    ...mapState('swap', ['showSwapConfigModal', 'configSlippagePercentage', 'config']),
  },
})
export default class SwapConfigModal extends SwapConfigModalProps {
  isNumber!: (element: HTMLElement) => boolean
  private config!: ISwapConfig

  get deadlineDelta(): string {
    return this.config.deadlineDelta
  }

  set deadlineDelta(deadlineDelta: string) {
    this.$store.commit('swap/updateDeadlineDelta', deadlineDelta)
  }

  get customSlippage(): string {
    return this.config.customSlippage
  }

  set customSlippage(slippage: string) {
    this.$store.commit('swap/updateCustomSlippage', slippage)
  }

  get configSlippagePercentage(): number {
    return this.$store.state.swap.config.slippage
  }

  set configSlippagePercentage(pct: number) {
    this.$store.commit('swap/updateSlippagePercentage', pct)
  }

  get showSwapConfigModal() {
    return this.$store.state.swap.showSwapConfigModal
  }

  set showSwapConfigModal(show: boolean) {
    this.$store.commit('swap/updateShowSwapConfigModal', show)
  }
}
</script>

<style lang="scss" scoped>
.swap-config-modal {
  z-index: 10;
  position: absolute;
  top: 30px;
  right: 20px;
  max-width: 250px;
  padding: 1rem;

  .swap-config-title {
    font-weight: 600;
    font-family: 'Source Sans Pro';
    margin-top: 6px;
  }

  .slippage-tolerance-label {
    margin-bottom: 0.4rem;
    font-family: 'Source Sans Pro';
  }

  .slippage-tolerance-settings-wrapper {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    margin: 0.6rem 0;

    > * {
      flex: 1;
      border-radius: 7px;
    }

    .slippage-tolerance-button {
      background-color: var(--slippage-percent);
      font-family: 'Source Sans Pro';
      font-weight: 600;

      &.active-button {
        background-color: var(--slippage-btn);
      }
    }

    .slippage-tolerance-input-wrapper {
      display: flex;
      align-items: center;
      border: 1px solid var(--pannel-border);
      background-color: var(--background);
      padding: 0 0.2rem;
      font-family: 'Source Sans Pro';

      input {
        flex: 1;
        color: var(--text);
        max-width: 45px;
        padding-left: 1px;
      }
      /* Chrome, Safari, Edge, Opera */
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type='number'] {
        -moz-appearance: textfield;
      }

      p {
        margin-bottom: 0;
        font-weight: 900;
      }
    }
  }

  .transaction-timeout-input {
    display: flex;

    input {
      flex: 1;
      color: var(--text);
      max-width: 50px;
      border: 1px solid var(--pannel-border);
      background-color: var(--background);
      text-align: center;
      border-radius: 7px;
      font-family: 'Source Sans Pro';
      font-size: 15px;
    }
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type='number'] {
      -moz-appearance: textfield;
    }

    p {
      flex: 1;
      margin-bottom: 0;
      margin-left: 0.2rem;
      font-size: 15px;
      font-family: 'Source Sans Pro';
    }
  }
}

// Responsive
@media only screen and (max-width: 950px) {
  .swap-config-modal {
    top: 10px;
    right: 35px;
  }
}
</style>
