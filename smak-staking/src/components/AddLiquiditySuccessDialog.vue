<template>
  <v-dialog 
    v-model="isDialogShown"
    :content-class="theme" 
    transition="fade-transition"
    @click:outside="closeDialog"
  >
    <div class="pannel remove-liquidity-dialog">
      <div class="remove-liquidity-header">
        <h4 style="margin-top: 3px">LP tokens in your wallet</h4>
        <h3 style="margin-right: 3px" @click="closeDialog">&#x2715;</h3>
      </div>

      <div class="info-row lp-tokens">
        <div class="description">
          <img :src="xtzMetadata.thumbnailUri" alt="xtz logo" />
          <img :src="getTokenMetadata().thumbnailUri" alt="xtz logo" class="mr-4" />
          XTZ / {{ getTokenMetadata().symbol }}
        </div>
        <div class="result">
          {{ new Intl.NumberFormat('en').format(addLiquiditySuccessModal.liquidityCreated) }}
        </div>
      </div>

      <div class="info-row">
        <div class="description">XTZ deposited</div>
        <div class="result">
          {{ addLiquiditySuccessModal.xtzIn }}
        </div>
      </div>

      <div class="info-row">
        <div class="description">{{ getTokenMetadata().symbol }} deposited</div>
        <div class="result">
          {{ addLiquiditySuccessModal.tokenIn }}
        </div>
      </div>

      <div class="liquidity-token-address-wrapper">
        <h4 class="d-flex align-center" style="position: relative">
          Contract
          <InfoTooltip class="ml-1">
            Add this contract to your wallet <br> in order to see your LP Tokens.
          </InfoTooltip>
        </h4>
        <div>{{ addLiquiditySuccessModal.liquidityTokenAddress || addLiquiditySuccessModal.poolAddress }}</div>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
// Vuex
import { mapState } from 'vuex'

// Display
import { Component, Vue } from 'vue-property-decorator'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { tokenAddressToMetadata, defaultTokenMetadata, xtzMetadata } from '@/store/dexContracts'
import { IAddLiquiditySuccessModal } from '@/store/swap'
import { TEZ_DECIMALS } from '@/constants'
import InfoTooltip from '@/components/shared/InfoTooltip.vue'

const AddLiquiditySuccessDialogProps = Vue.extend({
  props: {},
})

@Component({
  components: { InfoTooltip },
  computed: {
    ...mapState(['theme']),
    ...mapState('swap', ['addLiquiditySuccessModal']),
  },
})
export default class AddLiquiditySuccessDialog extends AddLiquiditySuccessDialogProps {
  private lqtBurned!: number
  private addLiquiditySuccessModal!: IAddLiquiditySuccessModal

  get xtzMetadata(): ITokenMetadata {
    return xtzMetadata
  }

  getTokenMetadata(): ITokenMetadata {
    if (this.addLiquiditySuccessModal.tokenAddress) {
      return tokenAddressToMetadata(
        this.addLiquiditySuccessModal.tokenAddress,
        this.addLiquiditySuccessModal.tokenId,
        this.$store.state.dexContracts
      )
    }

    return this.addLiquiditySuccessModal.tokenMetadata || defaultTokenMetadata
  }

  closeDialog(): void {
    this.$store.commit('swap/updateShowAddLiquiditySuccessModal', false)
  }

  get isDialogShown(): boolean {
    return this.addLiquiditySuccessModal.show
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
    margin: 0 0 22px 0;

    h4 {
      flex: 1;
    }

    h3:hover {
      cursor: pointer;
    }
  }

  .liquidity-token-address-wrapper {
    background: var(--pannel-secondary);
        border-radius: 13px;
    margin-top: 30px;
    font-weight: 600;
    color: var(--slippage-tol);
    padding: 0.8rem 1rem;

    h4 {
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--swap-secondary-text);
    }
  }

  .info-row {
    display: flex;
    margin: 0 0 8px 0;
    font-weight: 600;

    &.lp-tokens {
      font-size: 1.25rem;
      margin: 0 0 35px 0;
    }

    .description {
      display: flex;
      flex: 1;
      align-items: center;
      img {
        height: 1.5rem;
      }
    }
  }
}

// Responsive
@media only screen and (max-width: 700px) {
}
</style>
