<template>
  <div :id="containerId" style="width: 100%; min-height: 250px"></div>
</template>

<script lang="ts">
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { numberMixin } from '@/mixins/number.mixin'
import { ISmartlinkIndexerParams } from '@/interfaces/smartlink.interface'
import { IEChartsChartDataMultiValue } from '@/interfaces/echarts.interface'

@Component({
  computed: {
    ...mapState(['theme']),
  },
})
export default class LiquidityLineChart extends Vue {
  @Prop({ type: String, default: 'fee-deistribution-chart' }) containerId!: string
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

  get lpHoldersList(): number[] {
    return this.chartData.map(data => data.value[2])
  }

  get treasuryList(): number[] {
    return this.chartData.map(data => data.value[1])
  }

  get buybackBurnList(): number[] {
    return this.chartData.map(data => data.value[0])
  }

  get maxValue() {
    return Math.max(...this.lpHoldersList, ...this.treasuryList, ...this.buybackBurnList)
  }

  get option() {
    return {
      grid: {
        top: '10%',
        bottom: '7.5%',
        left: '4%',
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
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex

          const { shortNumber } = numberMixin.filters

          return `
            <p class="font-semibold mb-2">${this.dateList[dataIndex]}</p>
            ${params.map((param: any) => {
              return `
                <div class="d-flex align-center font-bold font-ssp">
                  ${param.marker}
                  <p class="mb-0 text-14px mr-4">${param.seriesName}</p> 
                  <p class="text-primary-2600 mb-0 text-14px ml-auto">${shortNumber(param.value)}</p>
                </div>
              `
            }).join('')}
          `
        },
      },
      axisPointer: {
        lineStyle: {
          color: '#30DAFF',
        },
      },
      xAxis: [
        {
          data: this.shortDateList,
          axisLine: {
            lineStyle: {
              color: this.theme === 'light' ? '#0D0D14' : '#4B4FA1',
            },
          },
          axisLabel: {
            color: this.theme === 'light' ? '#0D0D14' : '#FFF',
            interval: 1,
          },
          boundaryGap: false
        },
      ],
      yAxis: [
        {
          axisLine: {
            lineStyle: {
              color: this.theme === 'light' ? '#0D0D14' : '#4B4FA1',
            },
          },
          axisLabel: {
            color: this.theme === 'light' ? '#0D0D14' : '#FFF',
            formatter: function (value: number) {
              return numberMixin.filters.shortNumber(value)
            }
          },
          splitLine: {
            show: false,
          },
          splitNumber: 3,
          scale: true,
        },
      ],
      series: [
        {
          name: 'SMAK Buyback & Burn',
          type: 'line',
          stack: 'Total',
          data: this.buybackBurnList,
          symbolSize: 8,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: '#30DAFF',
          },
          emphasis: {
            focus: 'series',
          },
          areaStyle: {
            color: this.theme === 'light' ? '#9EB5D0' : '#2E4157',
          }
        },
        {
          name: 'Treasury',
          type: 'line',
          stack: 'Total',
          data: this.treasuryList,
          symbolSize: 8,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: '#FF3389',
          },
          emphasis: {
            focus: 'series',
          },
          areaStyle: {
            color: this.theme === 'light' ? '#D2BCE4' : '#4E3463',
          }
        },
        {
          name: 'LP Holders',
          type: 'line',
          stack: 'Total',
          data: this.lpHoldersList,
          symbolSize: 8,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: '#6473FF',
          },
          emphasis: {
            focus: 'series',
          },
          areaStyle: {
            color: this.theme === 'light' ? '#C4C5E4' : '#31335E',
          }
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
    this.chart.setOption(this.option)
  }
}
</script>
