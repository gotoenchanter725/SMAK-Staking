<template>
  <div class="graph-container" :id="containerId"></div>
</template>

<script lang="ts">
/* eslint-disable */

import { mapState } from 'vuex'
import { Component, Vue, Watch } from 'vue-property-decorator'
//import { tokenAddressToMetadata } from "@/store/dexContracts";
import { createChart } from 'lightweight-charts'
import dayjs from 'dayjs'
import { TimeSeries } from '@/modules/timeSeries'

const LineGraphProps = Vue.extend({
  props: {
    height: {
      type: Number,
      default: 0,
    },
    timeSeries: TimeSeries,
    isBarGraph: {
      type: Boolean,
      default: false,
    },
    showTooltip: {
      type: Boolean,
      default: true,
    },
    crosshairMovedCallback: {
      type: Function,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => (price: number, date: string) => {},
    },
    containerId: {
      type: String,
      default: 'graph-container',
    },
    parentId: {
      type: String,
      default: 'graph-container',
    },
    paddingX: {
      type: Number,
      default: 0
    },
    fitContent: {
      type: Boolean,
    },
    decimals: {
      type: Number,
      default: 2
    }
  },
})

@Component({
  components: {},
  computed: {
    ...mapState('graph', ['graphLoading', 'graph', 'tokenA', 'tokenB']),
    ...mapState(['theme']),
  },
})
export default class LineGraph extends LineGraphProps {
  chart: any
  series: any
  private theme!: 'dark' | 'light'

  created() {
    window.addEventListener('resize', this.resize)
  }
  destroyed() {
    window.removeEventListener('resize', this.resize)
  }
  resize() {
    const parent = document.getElementById(this.parentId)
    const container = document.getElementById(this.containerId)

    if (!parent || !container) return

    const width = parent.offsetWidth - this.paddingX
    const height = container.offsetHeight

    this.chart.resize(width, height)
  }

  formatTime(timestamp: number) {
    const date = new Date(timestamp * 1000)
    return date
  }

  @Watch('isBarGraph')
  updateBarGraph() {
    if (this.series) {
      this.chart.removeSeries(this.series)
    }
    if (this.isBarGraph) {
      this.series = this.chart.addHistogramSeries({
        base: 0,
        color: 'rgba(140, 227, 255, 1)',
      })
    } else {
      this.series = this.chart.addAreaSeries({
        topColor: 'rgba(75, 48, 88, 1)',
        bottomColor: 'rgba(108, 106, 215, 0)',
        lineColor: '#A090FF',
        lineWidth: 2,
      })
    }
    this.series.setData(this.timeSeries.resample())
  }

  mounted() {
    const graphContainer = document.getElementById(this.containerId)!
    var width = graphContainer.offsetWidth
    var height = this.height ? this.height : graphContainer.offsetHeight

    var chart = createChart(graphContainer, {
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: true,
      },
      timeScale: {
        borderVisible: false,
        tickMarkFormatter: (time: string) => {
          const d = dayjs(time)
          if (!d.hour() && !d.minute() && !d.second()) {
            return d.format('DD/MM/YYYY')
          } else {
            return d.hour() + 'h'
          }
        },
      },
      layout: {
        backgroundColor: 'transparent',
        textColor: this.$store.state.theme == 'dark' ? 'white' : 'rgba(13, 13, 20, 1)',
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      crosshair: {
        vertLine: {
          labelVisible: false,
        },
      },
    })
    this.chart = chart

    chart.resize(width, height)

    if (this.isBarGraph) {
      this.series = chart.addHistogramSeries({
        base: 0,
        color: 'rgba(140, 227, 255, 1)',
        priceFormat: {
            type: 'custom',
            minMove: 0.0001,
            formatter: (price: number) => price.toFixed(this.decimals)
        },
      })
    } else {
      this.series = chart.addAreaSeries({
        topColor: 'rgba(75, 48, 88, 1)',
        bottomColor: 'rgba(108, 106, 215, 0)',
        lineColor: '#A090FF',
        lineWidth: 2,
        priceFormat: {
            type: 'custom',
            minMove: 0.0001,
            formatter: (price: number) => price.toFixed(this.decimals)
        },
      })
    }
    this.series.setData(this.timeSeries.resample())

    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > graphContainer.clientWidth ||
        param.point.y < 0 ||
        param.point.y > graphContainer.clientHeight
      ) {
        this.crosshairMovedCallback(undefined, undefined)
      } else {
        const dateStr = new Date(Number(param.time)).toLocaleString('fr-FR')
        const price = param.seriesPrices.get(this.series)
        const formattedPrice = (100 * Number(price)) / 100
        this.crosshairMovedCallback(formattedPrice, dateStr)
      }
    })

    if(this.fitContent) chart.timeScale().fitContent()
  }

  @Watch('theme', { immediate: true })
  updateGraphAxisColor(): void {
    if (this.chart) {
      if (this.$store.state.theme == 'light') {
        this.chart.applyOptions({ layout: { textColor: 'rgba(13, 13, 20, 1)' } })
      } else {
        this.chart.applyOptions({ layout: { textColor: 'white' } })
      }
    }
  }

  @Watch('timeSeries', { immediate: true })
  renderGraph() {
    if (this.series) {
      this.series.setData(this.timeSeries.resample())
    }
  }

  getGraphData() {
    return this.$store.state.graph.graph.timeSeries.data
  }
}
</script>

<style lang="scss" scoped>
.graph-container {
  display: flex;
  flex: 1;
}
</style>
