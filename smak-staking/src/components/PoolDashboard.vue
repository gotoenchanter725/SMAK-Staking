<template>
  <DefaultLayout class="token-dashboard-wrapper mb-14">
    <v-row>
      <v-col cols="12" sm="3" class="d-flex align-center">
        <router-link :to="{ name: 'Charts' }" class="d-block bg-secondary-4500 px-4 py-1 rounded-10px font-semibold whitespace-nowrap hover:opacity-90">
          <BackArrowRight class="transform rotate-180 h-10px"/> Back to charts
        </router-link>
      </v-col>
      <v-col cols="12" sm="9">
        <CopyTextBar class="ml-auto" v-model="address" label="Contract" />
      </v-col>
    </v-row>

      <v-row class="token-dashboard-header-wrapper">
        <v-col cols="12" md="7" class="d-flex flex-wrap">
        <div class="token-name mr-6">
          <TokenImage
            :src="xtzMetadata.thumbnailUri"
            class="xtz-thumbnail"
            alt="xtz logo"
            width="30px"
            height="30px"
          />
          <TokenImage
            :src="getTokenMetadata().thumbnailUri"
            class="token-thumbnail"
            alt="xtz logo"
            width="30px"
            height="30px"
          />
          <h3>XTZ - {{ getTokenMetadata().symbol }}</h3>
          <span class="token-fee">
            <span class="token-fee-text">0.25%</span>
          </span>
        </div>
          <div class="token-dashboard-header">
            <div class="token-figures">
              <div class="market-rate">
                <TokenImage
                  :src="xtzMetadata.thumbnailUri"
                />
                1 XTZ = {{ (getPool().token_pool / getPool().xtz_pool) | readableNumber }}
                {{ getTokenMetadata().symbol }}
              </div>
              <div class="market-rate">
                <TokenImage
                  :src="getTokenMetadata().thumbnailUri"
                />
                1 {{ getTokenMetadata().symbol }} =
                {{ getPool().last_price_xtz | readableNumber }} XTZ
              </div>
            </div>
          </div>
        </v-col>
        <v-col md="5" class="d-flex">
          <SearchOverlayWrapper />
        </v-col>
      </v-row>

    <div class="token-dashboard-top-content mb-6">
      <div class="pannel token-informations">
        <div class="tokens-locked align-start justify-start pt-2">
          <h3 class="mb-4">Total Tokens Locked</h3>
          <div class="d-flex flex-column">
            <div class="token-locked-info mb-1">
              <TokenImage
                :src="xtzMetadata.thumbnailUri"
              />
              {{ getPool().xtz_pool | shortNumber }}
              XTZ
            </div>
            <div class="token-locked-info">
              <TokenImage
                :src="getTokenMetadata().thumbnailUri"
              />
              {{ getPool().token_pool | shortNumber }}
              {{ getTokenMetadata().symbol }}
            </div>
          </div>
        </div>
        <div class="token-tvl">
          <h3>TVL</h3>
          <h4 class="text-20px">${{ getCurrentTvl() | readableNumber(null, 0) }}</h4>
          <h4
            class="data-evolution"
            :class="{
              negative: valueLockedTimeSeries.isNegativePriceVariation('day'),
            }"
          >
            <img
              :src="
                require(`@/assets/${
                  valueLockedTimeSeries.isNegativePriceVariation('day') ? 'arrow-down' : 'arrow-up'
                }.svg`)
              "
              alt=""
            />
            {{ getTvlChange24h() | readableNumber(null, 0) }}%
          </h4>
        </div>
        <div class="token-v24">
          <h3>24h Trading Volume</h3>
          <h4 class="text-23px">${{ getVolume24h() | readableNumber(null, 0) }}</h4>
          <h4
            class="data-evolution"
            v-bind:class="{
              negative: Number(getVolumeChange24h()) < 0,
            }"
          >
            <img
              :src="
                require(`@/assets/${
                  Number(getVolumeChange24h()) < 0 ? 'arrow-down' : 'arrow-up'
                }.svg`)
              "
              alt=""
            />
            {{ getVolumeChange24h() | readableNumber(null, 0) }}%
          </h4>
        </div>
        <div class="token-v7d">
          <h3>7d Trading Volume</h3>
          <h4 class="text-20px">${{ getVolume7d() | readableNumber(null, 0) }}</h4>
        </div>
      </div>
      <div class="pannel token-graph-wrapper">
        <div class="d-flex flex-wrap align-center w-full">
          <div class="figures mr-4">
              <h3 id="graphAmount" class="text-27px">$0.00</h3>
              <p id="graphDate" class="whitespace-nowrap">--</p>
          </div>

          <div class="d-flex flex-column-reverse flex-lg-row pl-lg-0 ml-sm-auto">
            <div class="labels mb-3">
              <WatchlistButton class="mr-4" :address="address" is-pool />
              <div
                @click="onChangeTimeSeriesType('tvl')"
                class="label"
                v-bind:class="{
                  active: timeSeriesType == 'tvl',
                }"
              >
                TVL
              </div>
              <div
                @click="onChangeTimeSeriesType('volume')"
                class="label"
                v-bind:class="{
                  active: timeSeriesType == 'volume',
                }"
              >
                Volume
              </div>
            </div>

            <div class="d-flex align-center mb-3 mr-4">
              <div class="add-liquidity-btn">
                <router-link to="/swap" class="link-button" @click.native="goToAddLiquidity()">
                  Add liquidity
                </router-link>
              </div>

              <div class="trade-btn">
                <router-link to="/swap" class="link-button" @click.native="goToSwap()">
                  Trade
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="graph-wrapper" id="tvl-graph-pannel">
          <LineGraph
            v-if="!isLoading"
            :timeSeries="getTimeSeries()"
            parentId="tvl-graph-pannel"
            containerId="graph-container"
            :showTooltip="false"
            :isBarGraph="timeSeriesType == 'volume' ? true : false"
            :crosshairMovedCallback="updateGraphInfo"
          />
          <div class="graph-loader" v-else>
            <img
              v-if="theme === 'dark'"
              class="graph-loader__image"
              src="@/assets/vortex-logo.svg"
            />
            <img v-else class="graph-loader__image" src="@/assets/vortex-logo--white.svg" />
          </div>
        </div>
      </div>
    </div>

    <Card>
      <TopPools />
    </Card>
  </DefaultLayout>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from 'vuex'
import dayjs from 'dayjs'
import { Component, Vue, Watch } from 'vue-property-decorator'
import LineGraph from './LineGraph.vue'
import { xtzMetadata } from '@/store/dexContracts'

import { TimeSeries, TimeSeriesData } from '@/modules/timeSeries'
import { SwapContract } from '@/modules/contractInterfaces/swap'

import TopPools from '@/components/charts/TopPools.vue'
import Card from '@/components/shared/Card.vue'
import SearchOverlayWrapper from '@/components/SearchOverlayWrapper.vue'
import CopyTextBar from '@/components/shared/CopyTextBar.vue'
import TokenImage from '@/components/shared/TokenImage.vue'
import WatchlistButton from '@/components/shared/WatchlistButton.vue'

import BackArrowRight from '@/components/svgs/BackArrowRight.vue'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { numberMixin } from '@/mixins/number.mixin'

import { IPool, ITopToken, IValueLocked, IVolume } from '@/interfaces/smartlink.interface'
import { ITokenMetadata } from '@/interfaces/token.interface'
import { tokenIdentifier } from '@/helpers/token.helper'
import { EMPTY_METADATA } from '@/constants/tokens.const'

const TokenDashboardProps = Vue.extend({
  props: {},
})

type TimeSeriesType = 'tvl' | 'volume'

@Component({
  mixins: [numberMixin],
  components: {
    DefaultLayout,
    SearchOverlayWrapper,
    CopyTextBar,
    TokenImage,
    WatchlistButton,
    TopPools,
    Card,
    LineGraph,
    BackArrowRight,
  },
  computed: {
    ...mapState('graph', ['graphLoading', 'graph', 'tokenA', 'tokenB']),
    ...mapState(['theme']),
    ...mapState('dashboard', ['totalValueLockedTimeSeriesPerToken', 'volumeTimeSeriesPerToken']),
    ...mapState('dexContracts', ['areContractsLoaded']),
    ...mapGetters('pools', ['poolValueLocked', 'poolVolume', 'pools']),
    ...mapGetters('tokens', ['tokensMetadata']),
  },
  methods: {
    ...mapActions('pools', ['getValueLockedByPoolAddress', 'getVolumeByPoolAddress']),
    ...mapActions('tokens', ['getTopTokens']),
  },
})
export default class TokenDashboard extends TokenDashboardProps {
  getValueLockedByPoolAddress!: (poolAddress: string) => Promise<IValueLocked[]>
  getVolumeByPoolAddress!: (poolAddress: string) => Promise<IVolume[]>
  getTopTokens!: (params?: { isPriceLoaded: boolean }) => Promise<ITopToken[]>

  poolValueLocked!: { [key: string]: IValueLocked[] }
  poolVolume!: { [key: string]: IVolume[] }
  pools!: { [key: string]: IPool }
  tokensMetadata!: { [key: string]: ITokenMetadata }
  timeSeriesType: TimeSeriesType = 'tvl'
  swapContract?: SwapContract

  isLoading = true

  get address() {
    return this.$route.query.address || (this.swapContract ? this.swapContract.address : '')
  }

  get xtzMetadata(): ITokenMetadata {
    return xtzMetadata
  }

  get valueLockedTimeSeries(): TimeSeries {
    const { address: poolAddress } = this.$route.query
    const valueLocked = this.poolValueLocked[poolAddress as string] || []
    const timeSeries = new TimeSeries()
    timeSeries.setData(
      valueLocked.map((vl) => {
        return new TimeSeriesData(dayjs(vl.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), vl.vl_usd)
      })
    )
    return timeSeries
  }

  get volumeTimeSeries(): TimeSeries {
    const { address: poolAddress } = this.$route.query
    const volume = this.poolVolume[poolAddress as string] || []
    const timeSeries = new TimeSeries()
    timeSeries.setData(
      volume.map((v) => {
        return new TimeSeriesData(dayjs(v.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), v.usd_volume)
      })
    )
    return timeSeries
  }

  mounted() {
    this.initialize()

    /** for search tokens */
    this.getTopTokens()
  }

  @Watch('$route')
  async initialize() {
    this.setGraphDisplayData(0, new Date().toLocaleString('fr-FR'))

    const { address: poolAddress } = this.$route.query

    const isPoolValueLockedLoaded = !!this.poolValueLocked[poolAddress as string]
    const isPoolVolumeLoaded = !!this.poolVolume[poolAddress as string]
    this.isLoading = !isPoolValueLockedLoaded || !isPoolVolumeLoaded

    await Promise.all([
      this.getValueLockedByPoolAddress(poolAddress as string),
      this.getVolumeByPoolAddress(poolAddress as string),
    ])

    this.setGraphDisplayData(this.getTimeSeries().lastValue, new Date().toLocaleString('fr-FR'))
    this.isLoading = false
  }

  setGraphDisplayData(amount: number, date: string) {
    document.getElementById('graphAmount')!.innerHTML = `$${this.numberFormat(amount)}`
    document.getElementById('graphDate')!.innerHTML = this.formatDate(date)
  }

  goToAddLiquidity(): void {
    this.$store.commit('swap/updateTokenAddress', {
      whichToken: 'tokenA',
      address: 'XTZ',
      tokenId: 0,
    })
    this.$store.commit('swap/updateTokenAmount', {
      whichToken: 'tokenA',
      amount: '0',
    })
    this.$store.dispatch('swap/updateTokenAddress', {
      whichToken: 'tokenB',
      address: this.getPool().token_address,
      tokenId: this.getPool().token_id,
    })
    this.$store.dispatch('swap/updateDexAction', 'liquidity')
  }

  goToSwap(): void {
    this.$store.commit('swap/updateTokenAddress', {
      whichToken: 'tokenA',
      address: this.getPool().token_address,
      tokenId: this.getPool().token_id,
    })
    this.$store.commit('swap/updateTokenAmount', {
      whichToken: 'tokenA',
      amount: '0',
    })
    this.$store.dispatch('swap/updateTokenAddress', {
      whichToken: 'tokenB',
      address: 'XTZ',
      tokenId: 0,
    })
    this.$store.dispatch('swap/updateDexAction', 'swap')
  }

  formatDate(date: string): string {
    const dayjsDate = dayjs(date, 'DD/MM/YYYY, HH:mm:ss')
    return dayjsDate.format('MMM D, YYYY, h:mmA')
  }

  getVolume7d(): number {
    return this.volumeTimeSeries.cummulativeSum('week')
  }

  getVolume24h(): number {
    return this.volumeTimeSeries.cummulativeSum('day')
  }

  getVolumeChange24h(): number {
    return this.volumeTimeSeries.getCummulativeVariationPercentage('day')
  }

  getCurrentTvl(): number {
    return this.valueLockedTimeSeries.lastValue
  }

  getTvlChange24h(): number {
    return this.valueLockedTimeSeries.getVariationPercentage('day')
  }

  numberFormat(num: number): string {
    return this.timeSeriesType === 'tvl' ? numberMixin.filters.readableNumber(num, null, 0) : numberMixin.filters.readableNumber(num)
  }


  updateGraphInfo(amount?: number, date?: string): void {
    if (amount == undefined || date == undefined) {
      this.setGraphDisplayData(this.getTimeSeries().lastValue, new Date().toLocaleString('fr-FR'))
    } else {
      this.setGraphDisplayData(amount, date)
    }
  }

  getTokenMetadata(): ITokenMetadata {
    if (!this.getPool().token_address) return EMPTY_METADATA

    const identifier = tokenIdentifier({
      address: this.getPool().token_address as string,
      tokenId: this.getPool().token_id as number,
    })

    if (this.tokensMetadata[identifier]) return this.tokensMetadata[identifier]

    return EMPTY_METADATA
  }

  getPool(): IPool {
    const { address: poolAdress } = this.$router.currentRoute.query
    const pool = this.pools[poolAdress as string]

    if (!pool)
      return {
        token_address: '',
        pool_address: '',
        token_id: 0,
        symbol: '',
        name: '',
        decimals: 0,
        last_price_xtz: 0,
        last_price_usd: 0,
        contract_format: 0,
        icon: '',
        pool_address_1: '',
        lqt_address: '',
        lqt_total_supply: 0,
        xtz_pool: 0,
        token_pool: 0,
        lp_xtz: 0,
        lp_usd: 0,
      }

    return pool
  }

  getTimeSeries(): TimeSeries {
    if (this.timeSeriesType == 'tvl') {
      return this.valueLockedTimeSeries
    }
    return this.volumeTimeSeries
  }

  onChangeTimeSeriesType(type: TimeSeriesType) {
    this.timeSeriesType = type
    this.setGraphDisplayData(this.getTimeSeries().lastValue, new Date().toLocaleString('fr-FR'))
  }

}
</script>

<style lang="scss" scoped>
.graph-wrapper {
  height: 20rem;
  display: flex;
}

.link-button {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  color: white;
}

.token-dashboard-wrapper {
  .token-name,
  .token-figures {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
  }

  .token-name {
    margin-right: 0.6rem;

    p {
      margin-bottom: 0;
      color: var(--text2);
      font-weight: 500;
    }
  }

  .token-figures {
    .price-evolution {
      color: var(--price-color);
      &.negative {
        color: var(--neg-price-color);
      }
    }
  }

  .token-dashboard-header-wrapper {
    margin-bottom: 1rem;

    .token-dashboard-header {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      align-items: center;

      > * {
        margin: 0.5rem 0;
      }
    }

    .search-token-input-wrapper {
      width: 40%;
    }
  }

  .token-dashboard-top-content {
    display: flex;
    flex-direction: row;

    .token-informations {
      flex: 0 0 281px;
      width: 281px;
      margin-right: 1.5rem;

      &.pannel {
        padding-bottom: 0;
      }

      > div {
        margin-bottom: 1rem;
      }
      & > * {
        & > h3 {
          color: var(--text2);
        }

        &.tokens-locked {
          height: auto;
        }

        .data-evolution {
          color: var(--price-color);
          &.negative {
            color: var(--neg-price-color);
          }
        }
      }
    }

    .token-graph-wrapper {
      width: calc(100% - 281px - 1.5rem);

      .figures {
        p {
          color: var(--text2);
        }
      }

      .labels {
        display: flex;

        .label {
          cursor: pointer;
          background-color: var(--menu-background);
          display: block;
          padding: 2px 20px 27px 20px;
          height: 25px;
          line-height: 25px;
          border-radius: 12px;
          text-align: center;
          margin-right: 8px;
          margin-left: 0;

          &:hover {
            opacity: 0.9;
          }

          &.active {
            background-color: var(--menu-selected);
          }
        }
      }

      .add-liquidity-btn {
        background-color: var(--tertiary);
        height: 32px;
        width: 120px;
        border-radius: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.7rem;
        margin-top: 16px;
        margin-bottom: 16px;

        @media only screen and (min-width: 750px) {
          margin-top: 0;
          margin-bottom: 0;
        }
      }

      .trade-btn {
        background-color: var(--active);
        height: 32px;
        width: 120px;
        border-radius: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 16px;
        margin-bottom: 16px;

        @media only screen and (min-width: 750px) {
          margin-top: 0px;
          margin-bottom: 0;
        }
      }
    }
  }
}

@media only screen and (max-width: 1100px) {
  .token-dashboard-header-wrapper {
    flex-direction: column-reverse !important;

    .token-dashboard-header {
      width: 100% !important;
    }

    .search-token-input-wrapper {
      width: 100% !important;
      margin-bottom: 1rem;
    }
  }
}

@media only screen and (max-width: 1000px) {
  .token-dashboard-top-content {
    flex-direction: column !important;

    .token-informations {
      width: 100% !important;
      margin-bottom: 1rem;
      margin-right: 0;
    }

    .token-graph-wrapper {
      width: 100% !important;
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

.token-fee {
  background: var(--secondary-badge-background);
  padding: 0 0.5rem;
  border-radius: 5px;
}

.token-fee-text {
  display: block;
  margin-top: -2px;
  font-weight: 600;
}

.token-thumbnail {
  transform: translateX(-0.75rem);
}

.dark {
  --bg-market-rate: rgb(60, 61, 83);
  .market-rate {
    background: rgb(60, 61, 83);
  }
}

.market-rate {
  background: white;
  border-radius: 10px;
  font-weight: 600;
  padding: 4px 0.5rem;
  display: flex;
  align-items: center;

  img {
    padding-right: 0.5rem;
    height: 1.25rem;
  }
}
.dark .tokens-locked {
  background: rgba(54, 57, 78, 1);
  border: 1px solid #404258;
}

.tokens-locked {
  height: auto;
  background: rgba(213, 218, 229, 1);
  border-radius: 10px;
  padding: 0 0.5rem 0.8rem 0.5rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;

  h3 {
    margin-bottom: 2px;
  }

  .token-locked-info {
    display: flex;
    align-items: center;
    font-size: 0.9rem;

    img {
      padding-right: 0.5rem;
      height: 1.25rem;
    }
  }
}
</style>
