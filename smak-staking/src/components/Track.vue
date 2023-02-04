<template>
  <DefaultLayout class="pool">
    <div class="your-open-positions-wrapper">
      <remove-liquidity-dialog></remove-liquidity-dialog>
      <PoolLiquidityRemoveDialog />

      <div class="d-flex flex-wrap align-center mb-6">
        <h4 class="text-19px ml-3 mb-4 mb-sm-0">Your open positions</h4>

        <div class="ml-auto d-flex align-center flex-wrap justify-end">
          <SearchInput class="mb-4 mb-lg-0" placeholder="Search positions" v-model="searchText"/>
          <button v-if="isWalletConnected" @click="collapseAll = !collapseAll" class="ml-4 whitespace-nowrap">
            {{ collapseAll ? 'Close all' : 'Open all' }}
          </button>
          <router-link
            v-if="isWalletConnected"
            :to="{ name: 'Dex', query: { tab: 'liquidity' } }"
            class="add-liquidity-button ml-4"
          >
            <h4 class="whitespace-nowrap">+ Add Liquidity</h4>
          </router-link>
        </div>
      </div>
      <div v-if="positions.length && isWalletConnected" class="grid grid-flow-row gap-1rem pb-10">
        <PositionAccordion
          v-for="item in rowIterator()"
          :key="item"
          v-bind="item"
          :is-collapsed="collapseAll"
          :tokenMetadata="item.metadata"
          :position="item"
        />
        
        <p v-if="!rowIterator().length" class="no-open-positions__label">
          No liquidity found.
        </p>
      </div>
      <div v-else class="pannel no-open-positions">
        <template v-if="!isLoading">
          <p class="no-open-positions__label">
            No liquidity found. <br />
            Add liquidity to receive LP tokens. <br />
            Your liquidity positions will appear here.
          </p>
          <div class="no-open-positions__image-container">
            <img
              class="no-open-positions__image"
              :src="require('@/assets/no-open-positions.png')"
            />
          </div>
          <div class="connect-wallet-btn-wrapper">
            <button
              v-if="!isWalletConnected"
              @click="connectWallet()"
              class="connect-wallet-btn"
            >
              Connect wallet
            </button>
            <router-link
              v-else
              :to="{ name: 'Dex', query: { tab: 'liquidity' } }"
              class="connect-wallet-btn"
            >
              Add Liquidity
            </router-link>
          </div>
        </template>
        <div class="graph-loader" v-else>
          <img v-if="theme === 'dark'" class="graph-loader__image" src="@/assets/vortex-logo.svg" />
          <img v-else class="graph-loader__image" src="@/assets/vortex-logo--white.svg" />
        </div>
      </div>
    </div>
    <AddLiquiditySuccessDialog />
  </DefaultLayout>
</template>

<script lang="ts">
// Vuex
import { mapState, mapGetters } from 'vuex'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import RemoveLiquidityDialog from './RemoveLiquidityDialog.vue'
import PoolLiquidityRemoveDialog from './PoolLiquidityRemoveDialog.vue'
import SearchInput from '@/components/shared/SearchInput.vue'
import OverlayDialog from '@/components/OverlayDialog.vue'
import PositionAccordion from '@/components/pool/PositionAccordion.vue'
import AddLiquiditySuccessDialog from '@/components/AddLiquiditySuccessDialog.vue'
import { swapContractFactory } from '@/modules/contractInterfaces/swap'


// Display
import { Component, Vue, Watch } from 'vue-property-decorator'
import { ISwapContracts } from '@/store/dexContracts'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { SwapContract } from '@/modules/contractInterfaces/swap'
import { TimeSeries } from '@/modules/timeSeries'
import { InvestorPositionsEntry } from '@/modules/dexIndexer'
import { IPool } from '@/interfaces/smartlink.interface'
import { tokenIdentifier } from '../helpers/token.helper';

const PoolRowProps = Vue.extend({
  props: {},
})

interface IRowInformation extends Partial<InvestorPositionsEntry> {
  metadata: ITokenMetadata
  xtzPooled: string
  tokensPooled: string
  lpTokens: number
  poolShare: string
  swapContract: SwapContract
  currentValue: string
  initialValue: string
}

@Component({
  components: {
    DefaultLayout,
    PoolLiquidityRemoveDialog,
    PositionAccordion,
    AddLiquiditySuccessDialog,
    SearchInput,
    RemoveLiquidityDialog: Vue.extend(RemoveLiquidityDialog),
    OverlayDialog: Vue.extend(OverlayDialog),
  },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'userAddress', 'tk']),
    ...mapState('pool', ['positions']),
    ...mapState(['theme']),
    ...mapState('notificationCenter', ['isConfirmed']),
    ...mapState('dexContracts', ['areContractsLoaded', 'xtzPriceHistory']),
    ...mapGetters('wallet', ['walletInUse']),
    ...mapGetters('pools', ['pools']),
    ...mapGetters('tokens', ['tokensMetadata']),
  },
})
export default class PoolBody extends PoolRowProps {
  isWalletConnected!: boolean
  userAddress!: string
  isLoading = true
  collapseAll = true
  searchText = ''
  private xtzPriceHistory!: TimeSeries
  private walletInUse!: any
  private positions!: Array<InvestorPositionsEntry>
  pools!: { [key: string]: IPool }
  tokensMetadata!: { [key: string]: ITokenMetadata }

  async beforeMount() {
    await this.$store.dispatch('pool/fetchPositions')
  }

  async connectWallet(wallet = 'beacon'): Promise<void> {
    this.$store.commit('wallet/updateWalletType', wallet)
    await this.walletInUse
      .setupWallet()
      .then(() => this.$store.dispatch('wallet/loadWallet'))
    await this.$store.dispatch('dexContracts/reloadBalances')
  }

  @Watch('areContractsLoaded')
  hideLoading(val: boolean): void {
    if (val) {
      this.isLoading = false
    }
  }

  @Watch('isWalletConnected', { immediate: true })
  async loadContracts(newVal: boolean, val: boolean): Promise<void> {
    if (val !== newVal && newVal) {
      this.isLoading = true
      await this.$store.dispatch('pool/fetchPositions')
      //await this.$store.dispatch('wallet/loadWallet')
      //await this.$store.dispatch('dexContracts/loadDexContractData')
    } else {
      this.isLoading = false
    }
  }

  get swapContracts(): ISwapContracts {
    return this.$store.state.dexContracts.swapContracts
  }

  rowIterator(): Array<IRowInformation> {
    const rows: Array<IRowInformation> = []
    for (const position of this.positions) {
      const isPoolExists = this.pools[position.pool_address]

      if(!isPoolExists) {
        continue
      }

      const identifier = tokenIdentifier({ address: this.pools[position.pool_address].token_address, tokenId: this.pools[position.pool_address].token_id })
      const metadata = this.tokensMetadata[identifier]

      const swapContract = swapContractFactory(
        position.pool_address,
        this.$store.state.wallet.tk
      )

      rows.push({
        ...position,
        metadata: metadata || {},
        xtzPooled: position.pooled_xtz.toString(),
        tokensPooled: position.pooled_token.toString(),
        currentValue: position.current_value.toString(),
        initialValue: position.amount_invested.toString(),
        lpTokens: position.lp_qty,
        poolShare: (position.pool_share * 100).toString(),
        swapContract,
      })
    }

    return rows.filter(pool => {
      const { name, symbol } = pool.metadata

      return [name.toLowerCase(), symbol.toLowerCase()].some(criteria => criteria.includes(this.searchText.toLowerCase()))
    })
  }
}
</script>

<style lang="scss" scoped>
.your-open-positions-wrapper {

  .your-open-positions-header-spacer {
    flex: 1;
  }

  .add-liquidity-button {
    display: block;
    background-color: #5e54d0;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    color: white;
    cursor: pointer;
  }

  .your-open-positions-header-spacer {
    flex: 1;
  }

}

.your-open-positions-table {
  width: 100%;
  margin-bottom: 3rem;
  margin-top: -1rem;
}

.no-open-positions {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 1rem;
  padding: 1rem 2rem;
  align-items: center;
  min-height: 624px;

  &__image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  &__image {
    height: 400px;
    max-height: 100%;
    width: auto;
  }

  &__label {
    color: var(--text2);
    font-weight: 600;
    font-size: 17px;
    line-height: 35px;
    margin: 0 auto;
  }

  .connect-wallet-btn-wrapper {
    display: flex;
    justify-content: center;

    .connect-wallet-btn {
      width: 250px;
      background: var(--active);
      color: var(--menu-btn);
      margin: 0 auto;
    }
  }
}

// Responsive
@media only screen and (max-width: 700px) {
  .no-open-positions {
    grid-auto-flow: row;

    &__image {
      height: 200px;
    }
  }
}

@media only screen and (max-width: 1000px) {
  .no-open-positions {
    flex-direction: column;

    img {
      max-width: 100%;
    }
  }
}

.graph-loader {
  position: absolute;
  top: 0;
  left: 0;

  height: 100%;
  max-height: 100%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  &__image {
    height: 60px;
    animation: pulse 1.2s linear infinite;
  }
}
</style>
