<template>
  <DefaultLayout>
    <div class="analytics mb-14">
      <v-row>
        <v-col cols="12" lg="6" class="d-flex">
          <ChartTabs />
        </v-col>
        <v-col cols="12" lg="6" class="d-flex">
          <SearchOverlayWrapper />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800 class="analytics__card">
            <div class="analytics__card-header">
              <h3 class="analytics__card-title">Smartlink TVL</h3>
              <SelectSettings
                class="ml-auto"
                :value="chartLength.appTotalValueLocked"
                :options="chartLengthOptions"
                @input="(e) => onTotalValueLockedChange(e, 'appTotalValueLocked')"
              />
            </div>
            <TotalValueLockedChart
              :settings="chartLength.appTotalValueLocked.value"
              :chart-data="totalValueLockedChartData"
            />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800>
            <TopPoolByFees />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800 class="analytics__card">
            <div class="analytics__card-header">
              <h3 class="analytics__card-title">LP Fees received (USD)</h3>
              <SelectSettings
                class="ml-auto"
                :value="chartLength.lpfees"
                :options="chartLengthOptions"
                @input="(e) => onLpFeesReceivedChange(e, 'lpfees')"
              />
            </div>
            <FeesReceivedChart
              :settings="chartLength.lpfees.value"
              :chart-data="lpFeesReceivedChartData"
            />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800 class="analytics__card">
            <div class="analytics__card-header">
              <h3 class="analytics__card-title">Staking Program</h3>
              <SelectSettings
                class="ml-auto"
                :value="chartLength.stakingPrograms"
                :options="chartLengthOptions"
                @input="(e) => onStakingProgramsChange(e, 'stakingPrograms')"
              />
            </div>
            <StakingProgramsChart
              :settings="chartLength.stakingPrograms.value"
              :chart-data="totalStakingProgramsChartData"
            />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800 class="analytics__card">
            <div class="analytics__card-header">
              <h3 class="analytics__card-title">SMAK Burned vs Staking Rewards</h3>
              <div class="analytics__card-legends">
                <div class="d-flex align-center mr-4">
                  <div class="analytics__legend mr-2"></div>
                  <p class="analytics__card-title">SMAK Burned</p>
                </div>
                <div class="d-flex align-center">
                  <div class="analytics__legend analytics__legend--flexible mr-2"></div>
                  <p class="analytics__card-title">Staking Rewards</p>
                </div>
              </div>
              <SelectSettings
                class="ml-auto"
                :value="chartLength.smakBurnedVsRedeem"
                :options="chartLengthOptions"
                @input="(e) => onSmakBurnedVsRedeemChange(e, 'smakBurnedVsRedeem')"
              />
            </div>
            <SmakBurnedVsRewardChart
              :settings="chartLength.smakBurnedVsRedeem.value"
              :chart-data="smakBurnedVsRewardChartData"
            />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800 class="analytics__card">
            <div class="analytics__card-header">
              <h3 class="analytics__card-title">SMAK Price (USD)</h3>
              <SelectSettings
                class="ml-auto"
                :value="chartLength.smakPrices"
                :options="chartLengthOptions"
                @input="(e) => onSmakPriceChange(e, 'smakPrices')"
              />
            </div>
            <SmakPriceChart
              :settings="chartLength.smakPrices.value"
              :chart-data="smakPriceDataChart"
            />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800 class="analytics__card">
            <div class="analytics__card-header">
              <h3 class="analytics__card-title">Fee Distribution</h3>
              <SelectSettings
                class="ml-auto"
                :value="chartLength.feeDistribution"
                :options="chartLengthOptions"
                @input="(e) => onFeesDistributionChange(e, 'feeDistribution')"
              />
            </div>
            <FeeDistributionChart
              :settings="chartLength.feeDistribution.value"
              :chart-data="feeDistributionChartData"
            />
          </Card>
        </v-col>
      </v-row>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import Card from '@/components/shared/Card.vue'
import SelectSettings from '@/components/shared/SelectSettings.vue'

import ChartTabs from '@/components/charts/ChartTabs.vue'
import SearchOverlayWrapper from '@/components/SearchOverlayWrapper.vue'
import TotalValueLockedChart from '@/components/charts/TotalValueLockedChart.vue'
import FeesReceivedChart from '@/components/charts/FeesReceivedChart.vue'
import StakingProgramsChart from '@/components/charts/StakingProgramsChart.vue'
import SmakBurnedVsRewardChart from '@/components/charts/SmakBurnedVsRewardChart.vue'
import SmakPriceChart from '@/components/charts/SmakPriceChart.vue'
import FeeDistributionChart from '@/components/charts/FeeDistributionChart.vue'
import TopPoolByFees from '@/components/charts/TopPoolByFees.vue'
import { mapActions, mapGetters } from 'vuex'
import {
  IAppTotalValueLocked,
  IFeeDistribution,
  ILpFeesReceived,
  ISmakBurned,
  ISmartlinkIndexerParams,
  ITokenPrice,
  ITotalStaking,
  ITotalVolume,
} from '@/interfaces/smartlink.interface'
import dayjs from 'dayjs'
import { IEChartsChartData, IEChartsChartDataMultiValue } from '@/interfaces/echarts.interface'

const tabs = [
  {
    display: '1W',
    value: {
      start: dayjs().subtract(1, 'week').unix(),
      end: dayjs().unix(),
      rate: 'D',
    },
  },
  {
    display: '1M',
    value: {
      start: dayjs().subtract(1, 'month').unix(),
      end: dayjs().unix(),
      rate: 'D',
    },
  },
  {
    display: '1Y',
    value: {
      start: dayjs().subtract(1, 'year').unix(),
      end: dayjs().unix(),
      rate: 'M',
    },
  },
]

@Component({
  components: {
    DefaultLayout,
    Card,
    ChartTabs,
    TotalValueLockedChart,
    FeesReceivedChart,
    StakingProgramsChart,
    SmakBurnedVsRewardChart,
    SmakPriceChart,
    FeeDistributionChart,
    TopPoolByFees,
    SelectSettings,
    SearchOverlayWrapper,
  },
  computed: {
    ...mapGetters('smak', [
      'appTotalValueLocked',
      'smakBurned',
      'totalStakingRewards',
      'totalStakingPrograms',
      'smakPrices',
    ]),
    ...mapGetters('pools', ['feeDistribution', 'lpFeesReceived']),
  },
  methods: {
    ...mapActions('smak', [
      'getAppTotalValueLocked',
      'getSmakBurned',
      'getTotalStakingRewards',
      'getTotalStakingPrograms',
      'getSmakPrice',
    ]),
    ...mapActions('pools', [
      'getTotalLiquidity',
      'getTotalVolume',
      'getFeeDistribution',
      'getLpFeesReceived',
    ]),
  },
})
export default class Analytics extends Vue {
  getSmakBurned!: (params: Partial<ISmartlinkIndexerParams>) => Promise<ISmakBurned[]>
  getTotalStakingRewards!: (params: Partial<ISmartlinkIndexerParams>) => Promise<ITotalStaking[]>
  getTotalStakingPrograms!: (params: Partial<ISmartlinkIndexerParams>) => Promise<ITotalStaking[]>
  getAppTotalValueLocked!: (
    params: Partial<ISmartlinkIndexerParams>
  ) => Promise<IAppTotalValueLocked[]>
  getTotalVolume!: (params: Partial<ISmartlinkIndexerParams>) => Promise<ITotalVolume[]>
  getFeeDistribution!: (params: Partial<ISmartlinkIndexerParams>) => Promise<IFeeDistribution[]>
  getLpFeesReceived!: (params: Partial<ISmartlinkIndexerParams>) => Promise<ILpFeesReceived[]>
  getSmakPrice!: (params: Partial<ISmartlinkIndexerParams>) => Promise<ITokenPrice[]>

  smakBurned!: ISmakBurned[]
  totalStakingRewards!: ITotalStaking[]
  totalStakingPrograms!: ITotalStaking[]
  appTotalValueLocked!: IAppTotalValueLocked[]
  feeDistribution!: IFeeDistribution[]
  lpFeesReceived!: ILpFeesReceived[]
  smakPrices!: ITokenPrice[]

  chartLengthOptions = tabs
  chartLength = {
    appTotalValueLocked: { display: undefined, value: {} },
    lpfees: { display: undefined, value: {} },
    stakingPrograms: { display: undefined, value: {} },
    smakBurnedVsRedeem: { display: undefined, value: {} },
    smakBurned: { display: undefined, value: {} },
    smakPrices: { display: undefined, value: {} },
    feeDistribution: { display: undefined, value: {} },
  }

  smakBurnedVsRewardChartData: IEChartsChartDataMultiValue[] = []
  totalValueLockedChartData: IEChartsChartData[] = []
  lpFeesReceivedChartData: IEChartsChartData[] = []
  smakPriceDataChart: IEChartsChartData[] = []
  totalStakingProgramsChartData: IEChartsChartDataMultiValue[] = []
  feeDistributionChartData: IEChartsChartDataMultiValue[] = []

  mounted() {
    this.onSmakPriceChange(tabs[1], 'smakPrices')
    this.onSmakBurnedVsRedeemChange(tabs[1], 'smakBurnedVsRedeem')
    this.onStakingProgramsChange(tabs[1], 'stakingPrograms')
    this.onTotalValueLockedChange(tabs[1], 'appTotalValueLocked')
    this.onLpFeesReceivedChange(tabs[1], 'lpfees')
    this.onFeesDistributionChange(tabs[1], 'feeDistribution')
  }

  async onSmakPriceChange(
    data: { display: string; value: Partial<ISmartlinkIndexerParams> },
    chartName: string
  ) {
    if (data.display === this.chartLength.smakPrices.display) return

    this.onLengthInput(data, chartName)
    await this.getSmakPrice(data.value)

    this.smakPriceDataChart = this.smakPrices.map((price) => {
      return {
        label: dayjs(price.timestamp).format('YYYY-MM-DD'),
        value: price.usd_token_price,
      }
    })
  }

  async onSmakBurnedVsRedeemChange(
    data: { display: string; value: Partial<ISmartlinkIndexerParams> },
    chartName: string
  ) {
    if (data.display === this.chartLength.smakBurnedVsRedeem.display) return

    this.onLengthInput(data, chartName)
    await Promise.all([this.getTotalStakingRewards(data.value), this.getSmakBurned(data.value)])

    const smakBurnedTimestamps = this.smakBurned.map((burned) => burned.timestamp)
    const smakRedeemTimestamps = this.totalStakingRewards.map((reward) => reward.timestamp)
    const timestamps = [...new Set([...smakBurnedTimestamps, ...smakRedeemTimestamps])]

    const smakBurned = this.smakBurned.reduce((acc, cur) => {
      acc[cur.timestamp] = cur.balance
      return acc
    }, {} as { [key: string]: number })
    const smakRedeem = this.totalStakingRewards.reduce((acc, cur) => {
      acc[cur.timestamp] = cur.redeem_total
      return acc
    }, {} as { [key: string]: number })

    const result = timestamps.reduce((acc, cur, index, arr) => {
      acc[cur] = {
        label: dayjs(cur).format('YYYY-MM-DD'),
        value: [smakBurned[cur] || acc[arr[index - 1]]?.value[0] || 0, smakRedeem[cur] || 0],
      }

      return acc
    }, {} as { [key: string]: { label: string; value: number[] } })

    this.smakBurnedVsRewardChartData = Object.values(result)
  }

  async onFeesDistributionChange(
    data: { display: string; value: Partial<ISmartlinkIndexerParams> },
    chartName: string
  ) {
    if (data.display === this.chartLength.feeDistribution.display) return

    this.onLengthInput(data, chartName)
    await this.getFeeDistribution(data.value)

    this.feeDistributionChartData = this.feeDistribution.map((tv) => {
      return {
        label: dayjs(tv.timestamp).format('YYYY-MM-DD'),
        value: [tv.usd_buyback, tv.usd_treasury, tv.usd_lp_fees],
      }
    })
  }

  async onTotalValueLockedChange(
    data: { display: string; value: Partial<ISmartlinkIndexerParams> },
    chartName: string
  ) {
    if (data.display === this.chartLength.appTotalValueLocked.display) return

    this.onLengthInput(data, chartName)
    await this.getAppTotalValueLocked(data.value)

    this.totalValueLockedChartData = this.appTotalValueLocked.map((appTotalValueLocked) => {
      return {
        label: dayjs(appTotalValueLocked.timestamp).format('YYYY-MM-DD'),
        value: appTotalValueLocked.global_tvl,
      }
    })
  }

  async onLpFeesReceivedChange(
    data: { display: string; value: Partial<ISmartlinkIndexerParams> },
    chartName: string
  ) {
    if (data.display === this.chartLength.lpfees.display) return

    this.onLengthInput(data, chartName)
    await this.getLpFeesReceived(data.value)

    this.lpFeesReceivedChartData = this.lpFeesReceived.map((tv) => {
      return {
        label: dayjs(tv.timestamp).format('YYYY-MM-DD'),
        value: tv.usd_lp_fees,
      }
    })
  }

  async onStakingProgramsChange(
    data: { display: string; value: Partial<ISmartlinkIndexerParams> },
    chartName: string
  ) {
    if (data.display === this.chartLength.stakingPrograms.display) return

    this.onLengthInput(data, chartName)
    await this.getTotalStakingPrograms(data.value)

    this.totalStakingProgramsChartData = this.totalStakingPrograms.map((program) => {
      return {
        label: dayjs(program.timestamp).format('YYYY-MM-DD'),
        value: [program.lock_total, program.flex_total, program.lock_total + program.flex_total],
      }
    })
  }

  onLengthInput(
    data: { display: string; value: Partial<ISmartlinkIndexerParams> },
    chartName: string
  ) {
    this.chartLength = {
      ...this.chartLength,
      [chartName]: data,
    }
  }
}
</script>

<style lang="scss" scoped>
.analytics {
  display: flex;
  flex-direction: column;

  &__card {
    display: flex;
    flex-direction: column;
    padding: 2rem;
  }
  &__card-header {
    display: flex;
    margin-bottom: 1rem;
  }
  &__card-title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 128%;
    white-space: nowrap;
    margin: 0;
  }
  &__card-legends {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 10rem;
    width: 100%;
  }

  &__legend {
    width: 64px;
    height: 23px;
    background: #8692ff;
    border: 1px solid #3e4364;
    border-radius: 9px;

    &--flexible {
      background: #f474ff;
    }
  }
}
</style>
