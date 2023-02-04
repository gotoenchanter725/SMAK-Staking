<template>
  <DefaultLayout class="token-dashboard-wrapper mb-14">
    <v-row>
      <v-col cols="12" sm="3" class="d-flex align-center">
        <router-link :to="{ name: 'Charts' }" class="d-block bg-secondary-4500 px-4 py-1 rounded-10px font-semibold whitespace-nowrap hover:opacity-90">
          <BackArrowRight class="transform rotate-180 h-10px"/> Back to charts
        </router-link>
      </v-col>
      <v-col cols="12" lg="9">
        <CopyTextBar class="ml-auto" v-model="tokenAddress" label="Contract" />
      </v-col>
    </v-row>

    <div class="token-dashboard-header-wrapper">
      <v-row>
        <v-col order="2" order-md="2" cols="12" md="7" class="d-flex">
          <div class="token-dashboard-header whitespace-nowrap mt-3 mt-lg-auto">
            <div class="token-name">
              <TokenImage
                v-if="getTokenMetadata().thumbnailUri"
                :src="getTokenMetadata().thumbnailUri"
                alt="token logo"
                width="30px"
                height="30px"
              />
              <img
                v-else
                :src="require(`@/assets/token-placeholder.svg`)"
                alt="token logo"
                width="30px"
                height="30px"
              />
              <h3 v-if="getTokenMetadata().name">{{ getTokenMetadata().name }}</h3>
              <p v-if="getTokenMetadata().symbol" class="token-abreviation">
                ({{ getTokenMetadata().symbol }})
              </p>
              <h3>&bull;</h3>
            </div>
            <div class="token-figures">
              <h3>${{ getCurrentPrice() | readableNumber(getTokenMetadata().decimals) }}</h3>
              <h3
                class="price-evolution"
                v-bind:class="{
                  negative: priceTimeSeries.isNegativePriceVariation(),
                }"
              >
                (<img
                  :src="
                    require(`@/assets/${
                      priceTimeSeries.isNegativePriceVariation('day') ? 'arrow-down' : 'arrow-up'
                    }.svg`)
                  "
                  alt=""
                />
                {{ getPriceChange24h() }}%)
              </h3>
            </div>
          </div>
        </v-col>
        <v-col order="1" order-md="2" cols="12" md="5">
          <SearchOverlayWrapper />
        </v-col>
      </v-row>
    </div>

    <div class="token-dashboard-top-content mb-6">
      <div class="pannel token-informations">
        <div class="token-tvl">
          <h3>TVL</h3>
          <h4 class="text-23px">${{ getCurrentTvl() | readableNumber(null, 0) }}</h4>
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
          <h4 class="text-23px">${{ getVolume7d() | readableNumber(null, 0) }}</h4>
        </div>
      </div>
      <div class="pannel token-graph-wrapper">
        <div class="d-flex align-center">
          <div class="token-graph-header-figures">
            <div class="figures mr-4">
              <h3 id="graphAmount" class="text-27px">$0.00</h3>
              <p id="graphDate" class="whitespace-nowrap">--</p>
            </div>
          </div>

          <div
            class="
              d-flex
              align-lg-center
              mx-auto mx-sm-0
              ml-sm-auto
              flex-column-reverse flex-lg-row
            "
          >
            <div class="labels d-flex">
              <WatchlistButton class="mr-4" :address="tokenAddress" :tokenId="tokenId" />
              <div
                @click="onChangeTimeSeriesType('price')"
                class="label"
                v-bind:class="{
                  active: timeSeriesType == 'price',
                }"
              >
                Price
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
              <div
                @click="onChangeTimeSeriesType('tvl')"
                class="label"
                v-bind:class="{
                  active: timeSeriesType == 'tvl',
                }"
              >
                TVL
              </div>
            </div>

            <div class="d-flex align-center">
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
            :decimals="getTokenMetadata().decimals"
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
      <TopTokens />
    </Card>
  </DefaultLayout>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from 'vuex'
import dayjs from 'dayjs'
import { Component, Vue, Watch } from 'vue-property-decorator'
import TopTokens from '@/components/charts/TopTokens.vue'
import Card from '@/components/shared/Card.vue'
import SearchModal from './SearchModal.vue'
import LineGraph from './LineGraph.vue'
import { TimeSeries, TimeSeriesData } from '@/modules/timeSeries'

import SearchOverlayWrapper from '@/components/SearchOverlayWrapper.vue'
import CopyTextBar from '@/components/shared/CopyTextBar.vue'
import TokenImage from '@/components/shared/TokenImage.vue'
import WatchlistButton from '@/components/shared/WatchlistButton.vue'

import BackArrowRight from '@/components/svgs/BackArrowRight.vue'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { ITokenPrice, ITopPool, ITopToken, IValueLocked, IVolume } from '@/interfaces/smartlink.interface'
import { ITokenMetadata } from '@/interfaces/token.interface'
import { tokenIdentifier } from '@/helpers/token.helper';
import { EMPTY_METADATA } from '@/constants/tokens.const';


const TokenDashboardProps = Vue.extend({
  props: {},
})

type TimeSeriesType = 'price' | 'tvl' | 'volume'

@Component({
  mixins: [numberMixin],
  components: {
    DefaultLayout,
    SearchOverlayWrapper,
    CopyTextBar,
    WatchlistButton,
    TopTokens,
    Card,
    TokenImage,
    BackArrowRight,
    SearchModal: Vue.extend(SearchModal),
    LineGraph: Vue.extend(LineGraph),
  },
  computed: {
    ...mapState('graph', ['graphLoading', 'graph', 'tokenA', 'tokenB']),
    ...mapState(['theme']),
    ...mapState('dexContracts', ['areContractsLoaded']),
    ...mapGetters('tokens', ['tokens', 'tokensMetadata', 'tokenPrice', 'topTokens']),
    ...mapGetters('pools', ['poolValueLocked', 'poolVolume', 'pools']),
  },
  methods: {
    ...mapActions('tokens', ['getTopTokens', 'getPriceByPoolAddress']),
    ...mapActions('pools', ['getValueLockedByPoolAddress', 'getVolumeByPoolAddress', 'getTopPools']),
  }
})
export default class TokenDashboard extends TokenDashboardProps {
  getValueLockedByPoolAddress!: (poolAddress: string) => Promise<IValueLocked[]>
  getVolumeByPoolAddress!: (poolAddress: string) => Promise<IVolume[]>
  getPriceByPoolAddress!: (params: { poolAddress: string; tokenAddress: string; tokenId: number }) => Promise<ITokenPrice[]>
  getTopTokens!: () => Promise<ITopToken[]>
  getTopPools!: () => Promise<ITopPool[]>

  topTokens!: ITopToken[]
  tokens!: { [key: string]: ITopToken }
  poolValueLocked!: { [key: string]: IValueLocked[] }
  poolVolume!: { [key: string]: IVolume[] }
  tokenPrice!: { [key: string]: ITokenPrice[] }
  tokensMetadata!: { [key: string]: ITokenMetadata }
  timeSeriesType: TimeSeriesType = 'price'
  isLoading = true

  get tokenAddress(): string {
    const { address: tokenAddress } = this.$route.query
    return String(tokenAddress)
  }

  get tokenId(): number {
    const { tokenId } = this.$route.query
    return +tokenId || 0
  }

  get valueLockedTimeSeries(): TimeSeries {
    const valueLocked = this.poolValueLocked[this.getPoolAddress()] || []
    const timeSeries = new TimeSeries()
    timeSeries.setData(
      valueLocked.map((vl) => {
        return new TimeSeriesData(dayjs(vl.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), vl.vl_usd)
      })
    )
    return timeSeries.scale(.5)
  }

  get volumeTimeSeries(): TimeSeries {
    const volume = this.poolVolume[this.getPoolAddress()] || []
    const timeSeries = new TimeSeries()
    timeSeries.setData(
      volume.map((v) => {
        return new TimeSeriesData(dayjs(v.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), v.usd_volume)
      })
    )
    return timeSeries.scale(.5)
  }

  get priceTimeSeries(): TimeSeries {
    const price = this.tokenPrice[this.tokenIdentifier] || []
    const timeSeries = new TimeSeries()
    timeSeries.setData(
      price.map((p) => {
        return new TimeSeriesData(dayjs(p.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), p.usd_token_price)
      })
    )
    return timeSeries
  }

  get tokenIdentifier(): string {
    const identifier = tokenIdentifier({ address: this.tokenAddress, tokenId: this.tokenId })

    return identifier
  }

  getPoolAddress(): string {
    if (!this.tokens[this.tokenIdentifier]) return ''

    const poolAddress = this.tokens[this.tokenIdentifier].pool_address

    return poolAddress
  }

  get token(): ITopToken {
    return this.tokens[this.tokenIdentifier] || {}
  }

  mounted() {
    this.initialize()

    /** for search pools */
    this.getTopPools()
  }

  @Watch('$route')
  async initialize() {
    this.setGraphDisplayData(0, new Date().toLocaleString('fr-FR'))

    if(!this.topTokens.length) await this.getTopTokens()
    const poolAddress = this.tokens[this.tokenIdentifier].pool_address

    const isPoolValueLockedLoaded = !!this.poolValueLocked[poolAddress]
    const isPoolVolumeLoaded = !!this.poolVolume[poolAddress]
    const isTokenPriceLoaded = !!this.tokenPrice[this.tokenIdentifier]
    this.isLoading = isPoolValueLockedLoaded && isPoolVolumeLoaded && isTokenPriceLoaded

    await Promise.all([
      this.getValueLockedByPoolAddress(poolAddress),
      this.getVolumeByPoolAddress(poolAddress),
      this.getPriceByPoolAddress({
        poolAddress,
        tokenAddress: this.tokenAddress,
        tokenId: this.tokenId
      }),
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
      address: this.tokenAddress,
      tokenId: this.tokenId,
    })
    this.$store.dispatch('swap/updateDexAction', 'liquidity')
  }

  goToSwap(): void {
    this.$store.commit('swap/updateTokenAddress', {
      whichToken: 'tokenA',
      address: this.tokenAddress,
      tokenId: this.tokenId,
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

  getVolumeChange24h(): string {
    return this.volumeTimeSeries.getCummulativeVariationPercentage('day').toFixed(2)
  }

  getCurrentTvl(): string {
    return this.valueLockedTimeSeries.lastValue.toFixed(2)
  }

  getTvlChange24h(): string {
    return this.valueLockedTimeSeries.getVariationPercentage('day').toFixed(2)
  }

  getCurrentPrice(): number {
    return this.priceTimeSeries.lastValue
  }

  getPriceChange24h(): string {
    return this.priceTimeSeries.getVariationPercentage('day').toFixed(2)
  }

  numberFormat(num: number): string {
    return this.timeSeriesType !== 'price' ? numberMixin.filters.readableNumber(num, null, 0) : numberMixin.filters.readableNumber(num, this.getTokenMetadata().decimals)
  }

  updateGraphInfo(amount?: number, date?: string): void {
    if (amount == undefined || date == undefined) {
      this.setGraphDisplayData(this.getTimeSeries().lastValue, new Date().toLocaleString('fr-FR'))
    } else {
      this.setGraphDisplayData(amount, date)
    }
  }

  getTokenMetadata(): ITokenMetadata {
    if (this.tokensMetadata[this.tokenIdentifier]) return this.tokensMetadata[this.tokenIdentifier]

    return EMPTY_METADATA
  }

  getTimeSeries(): TimeSeries {
    if (this.timeSeriesType == 'tvl') {
      return this.valueLockedTimeSeries
    } else if (this.timeSeriesType == 'volume') {
      return this.volumeTimeSeries
    } else {
      return this.priceTimeSeries
    }
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
  .token-dashboard-header-wrapper {
    width: 100%;
    margin-bottom: 1rem;

    .token-dashboard-header {
      display: flex;
      flex-direction: row;
      align-items: center;

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

      & > * {
        height: 33%;
        display: flex;
        flex-direction: column;
        justify-content: center;

        & > h3 {
          color: var(--text2);
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

      .token-graph-header-figures {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .figures {
          p {
            color: var(--text2);
          }
        }
      }

      .labels {
        .label {
          cursor: pointer;
          background-color: var(--menu-background);
          display: block;
          padding: 2px 20px 27px 20px;
          height: 25px;
          line-height: 25px;
          border-radius: 12px;
          text-align: center;
          margin-right: 16px;

          @media only screen and (min-width: 750px) {
            padding: 2px 10px 27px 10px;
          }

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
        margin-bottom: 16px;
        margin-top: 16px;
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
      }
    }
  }
}

@media only screen and (max-width: 1000px) {
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
</style>
