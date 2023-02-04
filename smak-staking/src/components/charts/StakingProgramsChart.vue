<template>
  <div :id="containerId" style="width: 100%; min-height: 250px"></div>
</template>

<script lang="ts">
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { numberMixin } from '@/mixins/number.mixin'
import { IEChartsChartDataMultiValue } from '@/interfaces/echarts.interface'
import { ISmartlinkIndexerParams } from '@/interfaces/smartlink.interface'

@Component({
  computed: {
    ...mapState(['theme']),
  },
})
export default class StakingProgramsChart extends Vue {
  @Prop({ type: String, default: 'staking-programs-chart' }) containerId!: string
  @Prop({ type: Object, default: [] }) chartData!: IEChartsChartDataMultiValue[]
  @Prop({ type: Object, default: {} }) settings!: ISmartlinkIndexerParams

  theme!: string
  chart!: echarts.ECharts

  dateFormats: { [key: string]: string } = {
    D: 'ddd',
    M: 'MMM',
  }

  datePrefix: { [key: string]: string } = {
    D: '',
    M: '',
  }

  get dateList(): string[] {
    return this.chartData.map((data) => data.label)
  }

  get shortDateList(): string[] {
    return this.chartData.map((data) => {

      const dateFormat = dayjs(data.label).format(this.dateFormats[this.settings.rate])
      const prefix = this.datePrefix[this.settings.rate]

      return `${prefix} ${dateFormat}`
    })
  }

  get lockedValueList(): number[] {
    return this.chartData.map(data => data.value[0])
  }

  get flexValueList(): number[] {
    return this.chartData.map(data => data.value[1])
  }

  get totalValueList(): number[] {
    return this.chartData.map(data => data.value[2])
  }

  get maxValue() {
    return Math.max(...this.totalValueList)
  }

  get option() {
    return {
      grid: {
        top: '10%',
        bottom: '7.5%',
        left: '3.5%',
        right: '1%',
      },
      tooltip: {
        trigger: 'axis',
        borderColor: this.theme === 'light' ? '#E9EAF8' : '#3E4364',
        backgroundColor: this.theme === 'light' ? '#E9EAF8' : '#2C2C46',
        textStyle: {
          color: this.theme === 'light' ? '#0D0D14' : '#FFFFFF',
        },
        shadowColor: 'rgba(0,0,0,0.0)',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const label = params[0].axisValue
          const dataIndex = params[0].dataIndex

          const { shortNumber } = numberMixin.filters
          const lockedValue = shortNumber(this.lockedValueList[dataIndex])
          const flexValue = shortNumber(this.flexValueList[dataIndex])
          const totalValue = shortNumber(this.totalValueList[dataIndex])

          return `
            <p class="font-semibold mb-2">${label}</p>
            <div class="d-flex align-center font-bold font-ssp">
              <div class="bg-primary-2300 h-14px w-14px rounded-circle mr-2"></div> 
              <p class="mb-0 text-14px mr-4">Locked:</p> 
              <p class="text-primary-2600 mb-0 text-14px ml-auto">${lockedValue}</p>
            </div>
            <div class="d-flex align-center font-bold font-ssp">
              <div class="bg-primary-2400 h-14px w-14px rounded-circle mr-2"></div> 
              <p class="mb-0 text-14px mr-4">Flexible:</p> 
              <p class="text-primary-2600 mb-0 text-14px ml-auto">${flexValue}</p>
            </div>
            <div class="d-flex align-center font-bold font-ssp">
              <div class="bg-primary-2500 h-14px w-14px rounded-circle mr-2"></div> 
              <p class="mb-0 text-14px mr-4">Total:</p> 
              <p class="text-primary-2600 mb-0 text-14px ml-auto">${totalValue}</p>
            </div>
          `
        },
      },
      xAxis: {
        data: this.shortDateList,
        axisLine: {
          lineStyle: {
            color: this.theme === 'light' ? '#0D0D14' : '#4B4FA1',
          },
        },
        axisLabel: {
          color: this.theme === 'light' ? '#0D0D14' : '#FFF',
        },
        boundaryGap: false
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: this.theme === 'light' ? '#0D0D14' : '#4B4FA1',
          },
        },
        axisLabel: {
          color: this.theme === 'light' ? '#0D0D14' : '#FFF',
          formatter: function (value: number) {
            return numberMixin.filters.shortNumber(value)
          },
        },
        splitLine: {
          show: this.theme !== 'light',
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.06)',
          },
        },
        splitNumber: 3,
        scale: true,
      },
      series: [
        {
          name: 'Locked and Flexible',
          type: 'bar',
          barWidth: 8,
          itemStyle: {
            borderRadius: 5,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#C487FF' },
              { offset: 1, color: '#2BC2B9' },
            ]),
          },
          data: this.totalValueList,
        },
        {
          name: 'Total',
          type: 'pictorialBar',
          symbol: 'rect',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0.15, color: '#FFE68C26' },
              { offset: 1, color: '#313246' },
            ]),
          },
          symbolRepeat: true,
          symbolSize: [8, 4],
          symbolMargin: 1,
          z: -10,
          data: this.totalValueList,
        },
        {
          name: 'Total',
          type: 'line',
          smooth: true,
          showAllSymbol: true,
          symbolSize: 17,
          symbol:
            'path://M 8 0 C 0 0 0 11 8 11 L 8 9 C 3 9 3 2 8 2 L 8 0 C 16 0 16 11 8 11 L 8 9 C 13 9 13 2 8 2',
          showSymbol: false,
          data: this.totalValueList,
          itemStyle: {
            color: '#3CDCFF',
          },
        },
      ],
    }
  }

  mounted() {
    const chartDom = document.getElementById(this.containerId)
    this.chart = echarts.init(chartDom as HTMLElement)
    this.chart.setOption(this.option)

    window.addEventListener('resize', this.chart.resize as any)
  }

  destroyed() {
    window.removeEventListener('resize', this.chart.resize as any)
  }

  @Watch('theme')
  onThemeChanged() {
    this.chart.setOption(this.option)
  }

  @Watch('option')
  onChartDataChange() {
    this.chart.setOption(this.option);
  }
}
</script>
