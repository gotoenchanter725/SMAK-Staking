<template>
  <div class="d-flex">
    <Chart class="lottery-chart" :chart-data="chartData" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Chart from './Chart.vue'
import lotteryData from '@/modules/lottery-data'

@Component({ components: { Chart } })
export default class LotteryChart extends Vue {
  @Prop({ type: Number, default: 15 }) showLast!: number

  lotteryData = lotteryData

  get chartData() {
    return {
      labels: this.labels,
      datasets: this.datasets,
    }
  }

  get labels() {
    const labels = this.historyToShow.map(
      (round) => '#' + round.roundNumber.toString().padStart(2, '0')
    )

    while (labels.length < 10) labels.push('')

    return labels
  }

  get datasets() {
    return [this.participantsCountDataset, this.averageSpentPerRoundDataset]
  }

  get historyToShow() {
    const data = lotteryData.winningHistory
    
    if (this.showLast === 0) return data
    
    const start = data.length - this.showLast - 1
    const end = data.length - 1

    const startIndex = start >= 0 ? start : 0
    const endIndex = end >= 0 ? end : 0

    return data.slice(startIndex, endIndex)
  }

  get participantsCountDataset() {
    const data = this.historyToShow.map((round) => round.users)

    return {
      label: 'Average no. of participants',
      backgroundColor: '#7B78FF',
      borderRadius: 5,
      borderSkipped: false,
      yAxisID: 'A',
      data,
    }
  }

  get averageSpentPerRoundDataset() {
    const allTicketsPrice = lotteryData.ticketPrice * lotteryData.ticketsPerRound

    const data = this.historyToShow.map((round) => Math.round(allTicketsPrice / round.users))

    return {
      label: 'Average spent per round',
      backgroundColor: '#FD86FF',
      yAxisID: 'B',
      data,
    }
  }
}
</script>

<style scoped>
.lottery-chart {
  width: 100%;
}
</style>
