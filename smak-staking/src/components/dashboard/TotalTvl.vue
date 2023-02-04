<template>
  <div class="total-tvl">
    <div class="total-tvl__header">
      <p class="total-tvl__title">
        <span class="order-0 mr-1">SMARTLINK TVL</span>
        <span
          class="total-tvl__amount order-2 order-sm-1 mr-sm-1"
          >$ {{ appTotalValueLockedAmount | readableNumber(null, 0) }}</span
        >
        <InfoTooltip class="order-1 order-sm-2"> Including staked SMAK and Vortex liquidity </InfoTooltip>
      </p>
      <router-link :to="{ name: 'Analytics' }">
        <button class="total-tvl__button" :class="{ selected: $route.path === '/dashboard' }">
          Go to analytics
        </button>
      </router-link>
    </div>
    <div class="total-tvl__tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="total-tvl__tab"
        :class="{
          'total-tvl__tab--active': tab.value === selectedTab.value,
        }"
        @click="onTabClick(tab)"
      >
        {{ tab.display }}
      </button>
    </div>
    <LineChart v-if="!isChartsLoading" class="total-tvl__line-chart" :chart-data="chartData" />
    <div class="graph-loader" v-else>
      <VortexLogo class="graph-loader__image" />
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs'
import { mapActions, mapGetters, mapState } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import LineChart from './LineChart.vue'
import InfoTooltip from '@/components/shared/InfoTooltip.vue'
import VortexLogo from '@/components/shared/VortexLogo.vue'
import { numberMixin } from '@/mixins/number.mixin'
import {
  IAppTotalValueLocked,
  IFarm,
  ISmartlinkIndexerParams,
  ITotalStaking,
} from '@/interfaces/smartlink.interface'

const tabs = [
  {
    display: '1d',
    value: {
      start: dayjs().subtract(1, 'day').unix(),
      end: dayjs().unix(),
      rate: 'H',
    },
  },
  {
    display: '1w',
    value: {
      start: dayjs().subtract(1, 'week').unix(),
      end: dayjs().unix(),
      rate: 'D',
    },
  },
  {
    display: '1m',
    value: {
      start: dayjs().subtract(1, 'month').unix(),
      end: dayjs().unix(),
      rate: 'D',
    },
  },
]

@Component({
  mixins: [numberMixin],
  components: {
    InfoTooltip,
    LineChart,
    VortexLogo,
  },
  computed: {
    ...mapState(['theme']),
    ...mapState('dashboard', ['stakingValueLocked', 'tvlInfo']),
    ...mapState('dexContracts', ['areContractsLoaded']),
    ...mapGetters('smak', ['appTotalValueLocked', 'appTotalValueLockedAmount', 'totalSmakStaked']),
    ...mapGetters('farms', ['farmsTvlUsd']),
    ...mapState('wallet', ['smakPrice']),
  },
  methods: {
    ...mapActions('smak', ['getAppTotalValueLocked', 'getTotalStakingPrograms']),
    ...mapActions('farms', ['getFarms']),
  },
})
export default class TotalTvl extends Vue {
  getFarms!: () => Promise<IFarm[]>
  getAppTotalValueLocked!: (params?: Partial<ISmartlinkIndexerParams>) => Promise<IAppTotalValueLocked[]>
  getTotalStakingPrograms!: (
    params?: Partial<ISmartlinkIndexerParams>
  ) => Promise<ITotalStaking[]>

  areContractsLoaded!: boolean
  appTotalValueLockedAmount!: number
  smakPrice!: number
  totalSmakStaked!: number
  farmsTvlUsd!: number
  appTotalValueLocked!: IAppTotalValueLocked[]
  isChartsLoading = false
  tabs = tabs
  selectedTab = tabs[2]

  mounted() {
    this.requestSmakValueLocked()
    this.getTotalStakingPrograms()
    this.getFarms()
  }

  requestSmakValueLocked() {
    this.isChartsLoading = true
    this.getAppTotalValueLocked(this.selectedTab.value).then((_) => {
      this.isChartsLoading = false
    })
  }

  get chartData() {
    return {
      labels: this.appTotalValueLocked.map((appTotalValueLocked) => appTotalValueLocked.timestamp),
      datasets: [
        {
          label: 'Total Value Locked',
          data: this.appTotalValueLocked.map((appTotalValueLocked) => appTotalValueLocked.global_tvl),
          backgroundColor: 'transparent',
          borderColor: '#7C83FF',
        },
      ],
    }
  }

  onTabClick(tab: { display: string; value: ISmartlinkIndexerParams }) {
    this.selectedTab = tab
    this.requestSmakValueLocked()
  }
}
</script>

<style lang="scss" scoped>
.total-tvl {
  display: flex;
  flex-direction: column;

  padding: 1.5rem;
  background-color: var(--pannel-dashboard);

  width: 100%;
  height: 220px;

  border: 0.5px solid var(--pannel-border);
  border-radius: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 16px;
    margin: 0;
    white-space: nowrap;
  }

  &__amount {
    color: #4ebf53;
  }

  &__line-chart {
    margin-top: auto;
    display: flex;
    width: 100%;
    height: 100px;
  }

  &__tabs {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    gap: 0.5rem;
  }

  &__tab {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    background-color: #5e5f7a;
    color: var(--active-btn-text);
    width: 40px;
    height: 25px;
    border-radius: 8px;
    text-align: center;

    &--active {
      background-color: #5e54d0;
    }

    &:hover {
      opacity: 0.9;
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }
  }

  &__button {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    background-color: #5e5f7a;
    color: var(--active-btn-text);
    height: 27px;
    width: 117px;
    border-radius: 9px;
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

.graph-loader {
  height: 100%;
  max-height: 100%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  &__image {
    margin-top: 1.5rem;
    height: 40px;
    animation: pulse 1.2s linear infinite;
  }
}

@media only screen and (max-width: 700px) {
  .total-tvl {
    height: 203px;
  }
}
</style>
