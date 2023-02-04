/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module builds the graph parameters using the echarts library
 */

import { use } from 'echarts/core'
import { DatasetComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

import { StakeData } from './stakingHistory'
use([GridComponent, LineChart, CanvasRenderer, TooltipComponent, DatasetComponent])

export class Graph {
  private options: any
  constructor(history: StakeData[], theme: string) {
    function format(data: number) {
      data = Number(data)
      return Math.abs(data) > 999999
        ? Math.sign(data) * Number((Math.abs(data) / 1000000).toFixed(1)) + 'M'
        : Math.abs(data) > 999
        ? Math.sign(data) * Number((Math.abs(data) / 1000).toFixed(1)) + 'k'
        : Math.sign(data) * Math.abs(data)
    }

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
        dimensions: ['timestamp', 'stake'],
      },
      xAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: theme === 'light' ? '#0D0D14' : '#FFF',
          },
          show: false,
        },
        axisLabel: {
          fontFamily: 'Source Sans Pro',
          fontSize: 14,
          margin: 29,
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
          lineStyle: {
            width: 1.82,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 4,
            shadowOffsetY: 3,
          },
        },
      ],
    }
  }

  getOptions() {
    return this.options
  }
}
