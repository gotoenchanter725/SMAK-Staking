<template>
  <div class="d-flex flex-column align-center justify-center">
    <h1>Sandbox</h1>
    <TotalValueLockedChart />
    <FeesReceivedChart />
    <StakingProgramsChart />
    <SmakBurnedVsRewardChart />
    <SmakPriceChart />
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import TotalValueLockedChart from '@/components/charts/TotalValueLockedChart.vue'
import FeesReceivedChart from '@/components/charts/FeesReceivedChart.vue'
import StakingProgramsChart from '@/components/charts/StakingProgramsChart.vue'
import SmakBurnedVsRewardChart from '@/components/charts/SmakBurnedVsRewardChart.vue'
import SmakPriceChart from '@/components/charts/SmakPriceChart.vue'

@Component({
  components: {
    TotalValueLockedChart,
    FeesReceivedChart,
    StakingProgramsChart,
    SmakBurnedVsRewardChart,
    SmakPriceChart
  }
})
export default class Sandbox extends Vue {

}
</script>
