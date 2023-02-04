<template>
  <div :id="containerId" style="width: 100%; min-height: 250px"></div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { numberMixin } from '@/mixins/number.mixin'
import { IEChartsChartData } from '@/interfaces/echarts.interface';
import { ISmartlinkIndexerParams } from '@/interfaces/smartlink.interface';

@Component({
  computed: {
    ...mapState(['theme'])
  }
})
export default class TotalValueLockedChart extends Vue {
  @Prop({ type: String, default: 'total-value-locked-line-chart' }) containerId!: string
  @Prop({ type: Object, default: [] }) chartData!: IEChartsChartData[]
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
  
  get valueList(): number[] {
    return this.chartData.map((data) => data.value)
  }

  get maxValue() {
    return Math.max(...this.valueList)
  }

  get minValue() {
    return Math.min(...this.valueList)
  }


  get option() {
    return {
      grid: {
        top: '10%',
        bottom: '7.5%',
        left: '3%',
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
            ${params
              .map((param: any) => {
                return `
                <div class="d-flex align-center font-bold font-ssp">
                  ${param.marker}
                  <p class="mb-0 text-14px ml-auto">${shortNumber(param.value)}</p>
                </div>
              `
              })
              .join('')}
          `
        },
      },
      gradientColor: ["#7761FF", "#FF9B3F"],
      visualMap: [
        {
          show: false,
          type: 'continuous',
          seriesIndex: 0,
          min: this.minValue,
          max: this.maxValue
        },
      ],
      axisPointer: {
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FFA88C' },
              { offset: 1, color: '#282FB9' }
            ])
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
            show: this.theme !== 'light',
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.06)',
            },
          },
          splitNumber: 3,
          scale: true
        },
      ],
      series: [
        {
          type: 'line',
          showSymbol: false,
          data: this.valueList,
          symbolSize: 17,
          symbol: 'path://M 8 0 C 0 0 0 11 8 11 L 8 9 C 3 9 3 2 8 2 L 8 0 C 16 0 16 11 8 11 L 8 9 C 13 9 13 2 8 2',
          lineStyle: {
            width: 3,
          }
        },
      ]
    }
  }

  mounted() {
    const chartDom = document.getElementById(this.containerId);
    this.chart = echarts.init(chartDom as HTMLElement);
    this.chart.setOption(this.option);
    
    window.addEventListener('resize', this.chart.resize as any);
  }

  destroyed() {
    window.removeEventListener('resize', this.chart.resize as any);
  }

  @Watch('theme')
  onThemeChanged() {
    this.chart.setOption(this.option);
  }

  @Watch('option')
  onChartDataChange() {
    this.chart.setOption(this.option)
  }
}

</script>