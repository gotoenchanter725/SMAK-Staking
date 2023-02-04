import dayjs, { OpUnitType } from 'dayjs'
import { Dictionary } from 'vue-router/types/router'

export class TimeSeriesData {
  timestamp: string
  value: number

  constructor(timestamp: string, value: number) {
    this.timestamp = timestamp
    this.value = value
  }

  getTimestamp() {
    return this.timestamp
  }

  getValue() {
    return this.value
  }
}

const input: Array<[string, number]> = [
  ['2021-09-01T20:43:09Z', 1],
  ['2021-09-01T22:53:09Z', 2],
  ['2021-09-01T22:55:09Z', 2.5],
  ['2021-09-02T02:43:09Z', 3],
  ['2021-09-02T04:43:09Z', 4],
]

const output: Array<[string, number]> = [
  ['2021-09-01T21:00:00Z', 1],
  ['2021-09-01T22:00:00Z', 1],
  ['2021-09-01T23:00:00Z', 2.5],
  ['2021-09-02T00:00:00Z', 2.5],
  ['2021-09-02T01:00:00Z', 2.5],
  ['2021-09-02T02:00:00Z', 2.5],
  ['2021-09-03T03:00:00Z', 3],
  ['2021-09-03T04:00:00Z', 3],
  ['2021-09-03T05:00:00Z', 4],
  ['2021-09-03T05:24:35Z', 4],
]

/**
 * Resamples hourly a time series to be shown on a graph.
 *
 * @param input_time_series A time series in chronological order. For each point,
 *          the first element is a datetime as a string and the second a value
 * @param end_date The last date to resample until
 * @return A resampled time series
 */
function resample(
  input_time_series: Array<[string, number]>,
  _end_date: string
): Array<[string, number]> {
  if (input_time_series.length) {
    const result: Array<[string, number]> = input_time_series.map(([_date, value]) => {
      let date = dayjs(_date.slice(0, -6) + '00:00Z')
      date = date.add(1, 'hour')
      return [date.toString(), value]
    })
    const end_date = dayjs(_end_date)
    if (end_date.isAfter(result[result.length - 1][0])) {
      result.push([end_date.toString(), result[result.length - 1][1]])
    }
    const result2 = new Map<string, number>()
    for (const [date, value] of result) {
      result2.set(date, value)
    }
    const result3: Array<[string, number]> = []
    for (const [date, value] of result2) {
      result3.push([date, value])
    }
    result3.sort((a, b) => Number(new Date(a[0]) > new Date(b[0])))

    const result4 = [result3[0]]
    for (const [_next_date, next_value] of result3.slice(1)) {
      const next_date = dayjs(_next_date)
      let current_date = dayjs(result4[result4.length - 1][0]).add(1, 'hour')
      while (current_date.isBefore(next_date)) {
        result4.push([current_date.toString(), result4[result4.length - 1][1]])
        current_date = current_date.add(1, 'hour')
      }
      result4.push([_next_date, next_value])
    }

    return result4.map(([date, value]) => [new Date(date).toISOString(), value])
  } else {
    return []
  }
}

function it<T>(title: string, value: T, expected: T) {
  if (JSON.stringify(value) != JSON.stringify(expected)) {
    console.warn(value, expected)
    console.warn(JSON.stringify(value), JSON.stringify(expected))
    throw `FAILED: ${title} !!!`
  } else console.log(`passed: ${title}`)
}

const input2: Array<[string, number]> = [
  ['2021-09-01T20:43:09Z', 1],
  ['2021-09-01T22:53:09Z', 2],
  ['2021-09-01T22:55:09Z', 2.5],
  ['2021-09-02T02:43:09Z', 3],
  ['2021-09-02T04:00:00Z', 3],
  ['2021-09-02T04:43:09Z', 4],
]

const output2: Array<[string, number]> = [
  ['2021-09-01T20:00:00Z', 1],
  ['2021-09-01T21:00:00Z', 0],
  ['2021-09-01T22:00:00Z', 4.5],
  ['2021-09-01T23:00:00Z', 0],
  ['2021-09-02T00:00:00Z', 0],
  ['2021-09-02T01:00:00Z', 0],
  ['2021-09-02T02:00:00Z', 3],
  ['2021-09-02T03:00:00Z', 0],
  ['2021-09-02T04:00:00Z', 7],
  ['2021-09-02T05:00:00Z', 0],
]

function getHistogram(
  timeSeries: Array<[string, number]>,
  _end_date: string
): Array<[string, number]> {
  if (timeSeries.length) {
    let currentDate = dayjs(timeSeries[0][0].slice(0, -6) + '00:00Z')
    let lastDate = dayjs(timeSeries[timeSeries.length - 1][0].slice(0, -6) + '00:00Z')

    const endDate = dayjs(_end_date.slice(0, -6) + '00:00Z')
    if (endDate.isAfter(lastDate)) {
      lastDate = endDate
    }

    const histogram: { [timestamp: string]: number } = {
      [currentDate.toISOString().replace('.000', '')]: 0,
      [lastDate.toISOString().replace('.000', '')]: 0,
    }
    while (currentDate.isBefore(lastDate)) {
      histogram[currentDate.toISOString().replace('.000', '')] = 0
      currentDate = currentDate.add(1, 'hour')
    }

    for (const [_date, value] of timeSeries) {
      const date = _date.slice(0, -6) + '00:00Z'
      histogram[date] += value
    }

    return Object.keys(histogram)
      .sort()
      .map((date) => [date, histogram[date]])
  } else {
    return []
  }
}

it<Array<[string, number]>>('histogram', getHistogram(input2, '2021-09-02T05:00:00Z'), output2)

type TimeDelta = 'year' | 'week' | 'day' | 'hour'

export class TimeSeries {
  private data: Array<TimeSeriesData>

  constructor() {
    this.data = []
  }

  isNegativePriceVariation(delta: TimeDelta): boolean {
    return Number(this.getVariationAbsolute(delta)) < 0
  }

  scale(factor: number): TimeSeries {
    const scaledTimeSeried = new TimeSeries()
    for (const dataPoint of this.getData()) {
      const scaledDataPoint = new TimeSeriesData(
        dataPoint.getTimestamp(),
        dataPoint.getValue() * factor
      )
      scaledTimeSeried.addData(scaledDataPoint)
    }
    return scaledTimeSeried
  }

  getNPoints(delta: TimeDelta) {
    switch (delta) {
      case 'year':
        return 24 * 365
      case 'week':
        return 24 * 7
      case 'hour':
        return 1
      case 'day':
      default:
        return 24
    }
  }

  cummulativeSum(delta: TimeDelta): number {
    const nPoints = this.getNPoints(delta)
    const data = this.resample()
    if (data.length) {
      let sum = 0
      if (data.length >= nPoints) {
        for (const point of data.slice(data.length - nPoints, data.length)) {
          sum += point.value
        }
      } else {
        for (const point of data) {
          sum += point.value
        }
      }
      return sum
    } else {
      return 0
    }
  }

  getCummulativeTimeSeries(): TimeSeries {
    const newTimeSeries = new TimeSeries()
    let currentSum = 0
    for (const entry of this.data) {
      currentSum += entry.getValue()
      const newEntry = new TimeSeriesData(entry.getTimestamp(), currentSum)
      newTimeSeries.addData(newEntry)
    }
    return newTimeSeries
  }

  getVariationAbsolute(delta: TimeDelta): number {
    const nPoints = this.getNPoints(delta)
    const data = this.resample()
    if (data.length) {
      let firstPrice = 0
      if (data.length >= nPoints) {
        firstPrice = data[data.length - nPoints].value
      } else {
        firstPrice = data[0].value
      }
      const newPrice = data[data.length - 1].value
      return newPrice - firstPrice
    } else {
      return 0
    }
  }

  getVariationPercentage(delta: TimeDelta): number {
    const nPoints = this.getNPoints(delta)
    const data = this.resample()
    let firstPrice = 0
    if (data.length >= nPoints) {
      firstPrice = data[data.length - nPoints].value
    } else if (data[0]) {
      firstPrice = data[0].value
    }
    if (data.length) {
      const newPrice = data[data.length - 1].value
      return ((newPrice - firstPrice) / firstPrice) * 100
    } else {
      return 0
    }
  }

  get lastValue(): number {
    if (this.data.length) {
      return this.data[this.data.length - 1].getValue()
    } else {
      return 0
    }
  }

  lastValues(length: number): number[] {
    const dataLength = this.data.length
    if (dataLength) {
      const lastValues = this.data.slice(dataLength - length - 1, dataLength - 1)
      return lastValues.map((item) => item.getValue())
    }

    return Array(length).fill(0)
  }

  getValueAtTimestamp(timestamp: string): number {
    for (const dataElement of this.data) {
      if (dataElement.getTimestamp() == timestamp) {
        return dataElement.getValue()
      }
    }
    // TODO interpolate
    return this.lastValue
  }

  getHistogram() {
    const a: Array<[string, number]> = this.data.map((e) => [e.getTimestamp(), e.getValue()])
    const histogramTimeSeries = new TimeSeries()
    const currentDate = new Date().toISOString().slice(0, -5) + 'Z'
    for (const [timestamp, value] of getHistogram(a, currentDate)) {
      const historyEl = new TimeSeriesData(timestamp, value)
      histogramTimeSeries.addData(historyEl)
    }
    return histogramTimeSeries
  }

  getCummulativeVariationPercentage(delta: TimeDelta) {
    const nPoints = this.getNPoints(delta)
    if (this.data.length < nPoints) {
      return Infinity
    } else if (this.data.length < nPoints * 2) {
      const boundary = this.data.length - nPoints

      // calculate today sum
      const today = this.data.slice(-boundary)
      const todaySum = today.reduce((acc, e) => acc + e.getValue(), 0)

      // calculate yesterday sum
      const yesterday = this.data.slice(0, -boundary)
      const yesterdaySum = yesterday.reduce((acc, e) => acc + e.getValue(), 0)

      // return variation
      return ((todaySum - yesterdaySum) / yesterdaySum) * 100
    } else {
      // calculate today sum
      const today = this.data.slice(-nPoints)
      const todaySum = today.reduce((acc, e) => acc + e.getValue(), 0)

      // calculate yesterday sum
      const yesterday = this.data.slice(-nPoints * 2, -nPoints)
      const yesterdaySum = yesterday.reduce((acc, e) => acc + e.getValue(), 0)

      // return variation
      return ((todaySum - yesterdaySum) / yesterdaySum) * 100
    }
  }

  resample() {
    const a: Array<[string, number]> = this.data.map((e) => [e.getTimestamp(), e.getValue()])
    const current_date = new Date().toISOString().slice(0, -5) + 'Z'
    return resample(a, current_date).map((e) => ({
      time: new Date(e[0]).getTime(),
      value: e[1],
    }))
  }

  resampleAsKeyValue() {
    const resampled = this.resample()
    const resampledAsKeyValue: { [key: number]: number } = {}
    for (const el of resampled) {
      resampledAsKeyValue[el.time] = el.value
    }
    return resampledAsKeyValue
  }

  addData(data: TimeSeriesData) {
    this.data.push(data)
  }

  setData(data: TimeSeriesData[]) {
    this.data = data
  }

  getData() {
    return this.data
  }

  getFullFormatedData() {
    const fHistory = new TimeSeries()
    const lastDate = this.data.slice(-1)[0].getTimestamp()
    const firstDate = this.data[0].getTimestamp()
    const format = dayjs(lastDate).isAfter(firstDate, 'day') ? 'DD/MM HH:mm:ss' : 'HH:mm:ss'
    this.data.forEach((data: TimeSeriesData) => {
      const date = dayjs(data.getTimestamp()).format(format)
      const stakeData = new TimeSeriesData(date, data.getValue())
      fHistory.addData(stakeData)
    })
    return fHistory
  }

  getTimelyFormatedData(timelaps: OpUnitType, format1: string, format2: string) {
    const tHistory = new TimeSeries()
    const tempHistory = new Map()

    const lastDate = this.data.slice(-1)[0].getTimestamp()
    const firstDate = this.data[0].getTimestamp()
    const format = dayjs(lastDate).isAfter(firstDate, timelaps) ? format1 : format2
    this.data.forEach((data: TimeSeriesData) => {
      const date = dayjs(data.getTimestamp()).format(format)
      tempHistory.set(date, data.getValue())
    })

    tempHistory.forEach((stake: number, timestamp: string) => {
      const stakeData = new TimeSeriesData(timestamp, stake)
      tHistory.addData(stakeData)
    })

    return tHistory
  }

  getTimeAxis() {
    return this.data.map((e) => e.getTimestamp())
  }

  formatData() {
    const today = dayjs(this.data[0].getTimestamp())

    if (dayjs().isBefore(today.add(1, 'hour'))) {
      return this.getFullFormatedData().getData()
    } else if (dayjs().isBefore(today.add(6, 'hour')) && dayjs().isAfter(today.add(1, 'hour'))) {
      return this.getTimelyFormatedData('day', 'DD/MM HH:mm', 'HH:mm').getData()
    } else if (dayjs().isAfter(today.add(6, 'hour')) && dayjs().isBefore(today.add(7, 'day'))) {
      return this.getTimelyFormatedData('day', 'DD/MM hha', 'hha').getData()
    } else if (dayjs().isAfter(today.add(7, 'days')) && dayjs().isBefore(today.add(6, 'month'))) {
      return this.getTimelyFormatedData('month', 'DD/MM', 'DD').getData()
    } else {
      return this.getTimelyFormatedData('year', 'MMM YYYY', 'MMM').getData()
    }
  }
}
