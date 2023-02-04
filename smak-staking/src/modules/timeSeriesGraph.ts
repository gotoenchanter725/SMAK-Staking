import { use } from 'echarts/core'
import { DatasetComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as echarts from 'echarts/lib/echarts'

import { TimeSeries } from './timeSeries'
use([GridComponent, LineChart, CanvasRenderer, TooltipComponent, DatasetComponent])

export class Graph {
  private options: any
  timeSeries: TimeSeries
  constructor(timeSeries: TimeSeries) {
    this.timeSeries = timeSeries
    this.options = {}
  }

  initOptions(theme: string) {
    function format(data: number) {
      data = Number(data)
      return Math.abs(data) > 999999
        ? Math.sign(data) * Number((Math.abs(data) / 1000000).toFixed(1)) + 'M'
        : Math.abs(data) > 999
        ? Math.sign(data) * Number((Math.abs(data) / 1000).toFixed(1)) + 'k'
        : Math.sign(data) * Math.abs(data)
    }

    const history = this.timeSeries.formatData()

    this.options = {
      grid: {
        right: '18px',
        top: 10,
        bottom: 'absolute',
        left: 'absolute',
        containLabel: true,
      },
      dataset: {
        id: 'dataset_raw',
        source: history,
        dimensions: ['timestamp', 'value'],
      },
      xAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: theme === 'dark' ? '#0D0D14' : '#FFF',
          },
          show: false,
        },
        axisLabel: {
          fontFamily: 'Source Sans Pro',
          fontSize: 14,
          margin: 29,
          color: theme == 'dark' ? 'white' : 'black',
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            color: theme === 'light' ? '#0D0D14' : '#FFF',
          },
        },
        splitLine: {
          lineStyle: {
            color: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.06)',
          },
        },
        axisLabel: {
          fontFamily: 'Source Sans Pro',
          fontSize: 14,
          formatter: function (params: any) {
            return format(params)
          },
        },
        min: (value: any) => 'dataMin',
      },
      tooltip: {
        trigger: 'item',
        borderColor: theme === 'light' ? '#E9EAF8' : 'rgba(25,32,48,0.37)',
        backgroundColor: theme === 'light' ? '#E9EAF8' : 'rgba(25,32,48,0.37)',
        textStyle: {
          color: theme === 'light' ? '#0D0D14' : '#FFF',
        },
        shadowColor: 'rgba(0,0,0,0.0)',
        formatter: function (params: any) {
          const result =
            format(params.value[params.dimensionNames[params.encode.y[0]]]) +
            ' ' +
            `${params.seriesName}`
          return result
        },
      },
      color: [theme === 'light' ? '#D35EF0' : '#CFA8FF'],
      series: [
        {
          name: 'SMAK',
          type: 'line',
          symbolSize: 6,
          smooth: true,
          symbol: 'circle',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(213,72,120,0.8)',
              },
              {
                offset: 1,
                color: 'rgba(0,0,0,0.0)',
              },
            ]),
          },
          lineStyle: {
            width: 1.82,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 4,
            shadowOffsetY: 3,
          },
        },
      ],
    }

    return this
  }

  getTimeSeries() {
    return this.timeSeries
  }

  getOptions() {
    return this.options
  }
}
