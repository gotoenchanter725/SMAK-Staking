<template>
  <DefaultLayout class="dashboard-wrapper mb-14">
    <v-row>
      <v-col cols="12" lg="6" class="d-flex">
        <ChartTabs />
      </v-col>
      <v-col cols="12" lg="6" class="d-flex">
        <SearchOverlayWrapper />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <div id="graph-pannel" class="pannel graph">
          <h5 class="graph-title">TVL</h5>
          <h2 id="tvlAmount" class="graph-figure">
            $0
          </h2>
          <div class="d-flex mb-3">
            <h6 id="tvlDate" class="graph-date">--</h6>
          </div>
          <div class="graph-wrapper">
            <LineGraph
              v-if="isDashboardLoaded"
              :timeSeries="valueLockedTimeSeries"
              parentId="graph-pannel"
              containerId="graph-container"
              :crosshairMovedCallback="updateTvl"
              :showTooltip="false"
              :paddingX="48"
              :decimals="0"
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
      </v-col>

      <v-col cols="12" lg="6">
        <div id="bar-graph-pannel" class="pannel graph">
          <h5 class="graph-title">Volume</h5>
          <h2 id="volumeAmount" class="graph-figure">
            $0
          </h2>
          <div class="d-flex mb-3">
            <h6 id="volumeDate" class="graph-date">--</h6>
          </div>
          <div class="graph-wrapper">
            <LineGraph
              v-if="isDashboardLoaded"
              :timeSeries="volumeTimeSeries"
              parentId="bar-graph-pannel"
              containerId="bar-graph-container"
              :crosshairMovedCallback="updateVolume"
              :showTooltip="false"
              :isBarGraph="true"
              :paddingX="48"
              :fitContent="true"
              :decimals="0"
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
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <div class="pannel d-flex flex-column flex-sm-row flex-wrap py-3">
          <div class="figure mb-3 mb-sm-0 mr-10 pr-4">
            <span>Volume 24H: </span>
            <span> ${{ poolStatistics.volume_24h | readableNumber(null, 0) }} </span>
            <span
              class="data-evolution"
              v-bind:class="{
                negative: poolStatistics.volume_variation < 0,
              }"
            >
              <img
                v-if="poolStatistics.volume_variation != 0"
                :src="
                  require(`@/assets/${
                    poolStatistics.volume_variation > 0 ||
                    isNaN(poolStatistics.volume_variation)
                      ? 'arrow-up'
                      : 'arrow-down'
                  }.svg`)
                "
                alt=""
              />

              {{ poolStatistics.volume_variation * 100 | readableNumber }}%
            </span>
          </div>
          <div class="figure mb-3 mb-sm-0 mr-10 pr-4">
            <span>Fees&nbsp;24H&nbsp;: </span>
            <span> ${{ poolStatistics.fees_24h | readableNumber }} </span>
            <span
              class="data-evolution"
              v-bind:class="{
                negative: poolStatistics.volume_variation < 0,
              }"
            >
              <img
                v-if="poolStatistics.volume_variation != 0"
                :src="
                  require(`@/assets/${
                    poolStatistics.volume_variation > 0 ||
                    isNaN(poolStatistics.volume_variation)
                      ? 'arrow-up'
                      : 'arrow-down'
                  }.svg`)
                "
                alt=""
              />
              {{ poolStatistics.volume_variation * 100 | readableNumber }}%
            </span>
          </div>
          <div class="figure">
            <span>TVL 24H: </span>
            <span>
              ${{ poolStatistics.tvl_24h | readableNumber(null, 0) }}
            </span>
            <span
              class="data-evolution"
              v-bind:class="{
                negative: poolStatistics.tvl_variation < 0,
              }"
            >
              <img
                v-if="poolStatistics.tvl_variation != 0"
                :src="
                  require(`@/assets/${
                    poolStatistics.tvl_variation > 0
                      ? 'arrow-up'
                      : 'arrow-down'
                  }.svg`)
                "
                alt=""
              />
              {{ poolStatistics.tvl_variation * 100 | readableNumber }}%
            </span>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <Card>
          <TopMovers />
        </Card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <Card>
          <TopTokens />
        </Card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <Card>
          <TopPools />
        </Card>
      </v-col>
    </v-row>
  </DefaultLayout>
</template>

<script lang="ts">
// Vue
import { mapActions, mapGetters, mapState } from 'vuex'

// Display
import { Component, Vue, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { TimeSeries, TimeSeriesData } from '@/modules/timeSeries'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import { numberMixin } from '@/mixins/number.mixin'
import TopPools from '@/components/charts/TopPools.vue'
import TopTokens from '@/components/charts/TopTokens.vue'
import Card from '@/components/shared/Card.vue'
import TopMovers from '@/components/charts/TopMovers.vue'

import SearchOverlayWrapper from '@/components/SearchOverlayWrapper.vue'
import ChartTabs from '@/components/charts/ChartTabs.vue'
import LineGraph from '@/components/LineGraph.vue'
import { IPoolStatistics, ISmartlinkIndexerParams, ITotalValueLocked, ITotalVolume, IVolume } from '@/interfaces/smartlink.interface'

dayjs.extend(customParseFormat)

@Component({
  mixins: [numberMixin],
  components: {
    Card,
    TopMovers,
    ChartTabs,
    DefaultLayout,
    SearchOverlayWrapper,
    TopTokens,
    TopPools,
    LineGraph,
  },
  computed: {
    ...mapState(['theme']),
    ...mapGetters('pools', ['totalValueLocked', 'totalVolume', 'poolStatistics']),
  },
  methods: {
    ...mapActions('pools', ['getTotalValueLocked', 'getTotalVolume', 'getPoolStatistics']),
  },
})
export default class ChartsPage extends Vue {
  getPoolStatistics!: () => Promise<IPoolStatistics>
  getTotalValueLocked!: () => Promise<ITotalValueLocked>
  getTotalVolume!: (params: Partial<ISmartlinkIndexerParams>) => Promise<ITotalVolume>

  currentTvl!: number
  currentVolume!: number
  poolStatistics!: IPoolStatistics
  totalValueLocked!: ITotalValueLocked[]
  totalVolume!: ITotalVolume[]
  tvlInfo = { amount: 0, date: '' }
  volumeInfo = { amount: 0, date: '' }
  isDashboardLoaded = false
  valueLockedTimeSeries = new TimeSeries()
  volumeTimeSeries = new TimeSeries()
  feesTimeSeries = new TimeSeries()

  async mounted() {
    this.isDashboardLoaded = !!this.totalValueLocked.length && !!this.totalVolume.length
    if (this.isDashboardLoaded) {
      this.setTotalValueLockedTimeSeries(this.totalValueLocked)
      this.setVolumeTimeSeries(this.totalVolume)
      this.setFeesTimeSeries(this.totalVolume)
    }

    await Promise.all([
      this.getTotalValueLocked(), 
      this.getTotalVolume({ rate: 'D' }), 
      this.getPoolStatistics()
    ])

    this.setTotalValueLockedTimeSeries(this.totalValueLocked)
    this.setVolumeTimeSeries(this.totalVolume)
    this.setFeesTimeSeries(this.totalVolume)

    this.updateVolume()
    this.updateTvl()
    this.isDashboardLoaded = true
  }

  formatDate(date: string): string {
    const dayjsDate = dayjs(date, 'DD/MM/YYYY, HH:mm:ss')
    return dayjsDate.format('MMM D, YYYY, h:mmA')
  }

  updateVolume(amount?: number, date?: string): void {
    if (amount == undefined || date == undefined) {
      document.getElementById('volumeAmount')!.innerHTML = `$${numberMixin.filters.readableNumber(this.currentVolume, null, 0)}`
      document.getElementById('volumeDate')!.innerHTML = this.formatDate(new Date().toLocaleString('fr-FR'))
    } else {
      document.getElementById('volumeAmount')!.innerHTML = `$${numberMixin.filters.readableNumber(amount, null, 0)}`
      document.getElementById('volumeDate')!.innerHTML =  this.formatDate(date)
    }
  }

  updateTvl(amount?: number, date?: string): void {
    if (amount == undefined || date == undefined) {
      document.getElementById('tvlAmount')!.innerHTML = `$${numberMixin.filters.readableNumber(this.currentTvl, null, 0)}`
      document.getElementById('tvlDate')!.innerHTML = this.formatDate(new Date().toLocaleString('fr-FR'))
    } else {
      document.getElementById('tvlAmount')!.innerHTML = `$${numberMixin.filters.readableNumber(amount, null, 0)}`
      document.getElementById('tvlDate')!.innerHTML =  this.formatDate(date)
    }
  }

  showSearchModal($event: any): void {
    this.$store.commit('dashboard/updateShowSearchModal', true)

    setTimeout(() => {
      $event.target.focus()
    }, 500)
  }

  setFeesTimeSeries(totalVolume: ITotalVolume[]) {
    this.feesTimeSeries.setData(
      totalVolume.map((v) => {
        return new TimeSeriesData(dayjs(v.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), v.usd_fees)
      })
    )
  }

  setVolumeTimeSeries(totalVolume: ITotalVolume[]) {
    this.volumeTimeSeries.setData(
      totalVolume.map((v) => {
        return new TimeSeriesData(dayjs(v.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), v.tvol)
      })
    )

    const tsData = this.volumeTimeSeries.getData()
    const tsLength = tsData.length
    if (!tsLength) this.currentTvl = 0

    const { value } = tsData[tsLength - 1]
    this.currentVolume = value
  }

  setTotalValueLockedTimeSeries(totalValueLocked: ITotalValueLocked[]) {
    this.valueLockedTimeSeries.setData(
      totalValueLocked.map((vl) => {
        return new TimeSeriesData(dayjs(vl.timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]'), vl.tvl)
      })
    )

    const tsData = this.valueLockedTimeSeries.getData()
    const tsLength = tsData.length
    if (!tsLength) this.currentTvl = 0

    const { value } = tsData[tsLength - 1]
    this.currentTvl = value
  }
}
</script>

<style lang="scss" scoped>
.graph-wrapper {
  height: 20rem;
  display: flex;
}

.dashboard-wrapper {
  .figure {
    font-weight: 600;
  }

  .pannel {
    border-radius: 14px !important;
    position: relative;
  }

  .data-evolution {
    margin-left: 0.5rem;
    color: var(--price-color);

    &.negative {
      color: var(--neg-price-color);
    }
  }

  .graphs-wrapper {
    display: flex;
    margin: 1rem 0;
    flex-direction: row;

    .pannel {
      flex: 1;
      padding: 1.5rem;
    }
  }

  .graph-title,
  .graph-date {
    min-height: 16px;
    color: var(--text2);
  }
}

.graph-title {
  color: var(--gray);
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
