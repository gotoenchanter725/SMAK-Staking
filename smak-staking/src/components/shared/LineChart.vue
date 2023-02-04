<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  mounted() {
    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: -8,
          bottom: -8,
        },
      },
      tooltips: {
        enabled: false,
      },
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      scales: {
        gridLines: {
          showBorder: false,
        },
        xAxes: [
          {
            ticks: {
              display: false,
            },
            gridLines: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              display: false,
            },
            gridLines: {
              display: false,
            },
          },
        ],
      },
      elements: {
        point: {
          radius: 0,
        },
      },
    })
  },
}
</script>
