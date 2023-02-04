import { config } from '@/../config/config'
import dayjs from 'dayjs'
import { StakeData, StakeHistory } from './stakingHistory'
import { TimeSeriesData, TimeSeries } from './timeSeries'
import { SwapContract } from '@/modules/contractInterfaces/swap'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { FA12Contract } from '@/modules/contractInterfaces/fa12'
import { TEZ_DECIMALS } from '@/constants'

import dexterCalculations from '@/modules/dexter-calculations'
const {
  xtzToTokenXtzInput,
  xtzToTokenExchangeRateForDisplay,
  tokenToTokenExchangeRateForDisplay,
  tokenToXtzExchangeRateForDisplay,
  tokenToXtzMarketRate,
} = dexterCalculations


export function projectSeriesOnto(series: TimeSeries, ts: string[]) {
  if (!series) return new TimeSeries()

  const data = series.getData()
  if (data.length > ts.length) throw 'error'
  if (!data.length) return series
  if (data.length == ts.length) return series

  const newTimeSeries = new TimeSeries()

  let previousPoint = data[0]
  let i = 0
  for (const j in ts) {
    const t = dayjs(ts[j])
    const point = data[i]
    const pointTimestamp = dayjs(point.getTimestamp())
    if (t.isBefore(pointTimestamp)) {
      const dataPoint = new TimeSeriesData(ts[j], previousPoint.getValue())
      newTimeSeries.addData(dataPoint)
    } else {
      if (i < data.length - 1) {
        const dataPoint = new TimeSeriesData(point.getTimestamp(), point.getValue())
        newTimeSeries.addData(dataPoint)
        i += 1
        previousPoint = point
      } else {
        const dataPoint = new TimeSeriesData(ts[j], point.getValue())
        newTimeSeries.addData(dataPoint)
      }
    }
  }

  return newTimeSeries
}

function mergeTimestampLists(ts1: string[], ts2: string[]) {
  return ts1.concat(ts2).sort(function(a, b) {
    return a.localeCompare(b)
  })
}

function it<T>(title: string, value: T, expected: T) {
  if (JSON.stringify(value) != JSON.stringify(expected)) {
    console.warn(value, expected)
    throw `FAILED: ${title} !!!`
  } else console.log(`passed: ${title}`)
}

const ts1 = [
  '2021-06-25T17:02:26Z',
  '2021-08-25T22:02:26Z',
  '2021-09-25T17:02:26Z',
  '2021-11-25T17:02:26Z',
]

const ts2 = ['2021-07-25T17:02:26Z', '2021-08-25T17:02:26Z', '2021-10-25T17:02:26Z']

const timestamps = [
  '2021-06-25T17:02:26Z',
  '2021-07-25T17:02:26Z',
  '2021-08-25T17:02:26Z',
  '2021-08-25T22:02:26Z',
  '2021-09-25T17:02:26Z',
  '2021-10-25T17:02:26Z',
  '2021-11-25T17:02:26Z',
]

it<string[]>('merge timestamps', mergeTimestampLists(ts1, ts2), timestamps)

const timeseries = new TimeSeries()
timeseries.addData(new TimeSeriesData('2021-06-25T17:02:26Z', 1))
timeseries.addData(new TimeSeriesData('2021-07-25T17:02:26Z', 2))
timeseries.addData(new TimeSeriesData('2021-09-25T17:02:26Z', 3))

const target_timeseries = new TimeSeries()
target_timeseries.addData(new TimeSeriesData('2021-06-25T17:02:26Z', 1))
target_timeseries.addData(new TimeSeriesData('2021-07-25T17:02:26Z', 2))
target_timeseries.addData(new TimeSeriesData('2021-08-25T17:02:26Z', 2))
target_timeseries.addData(new TimeSeriesData('2021-08-25T22:02:26Z', 2))
target_timeseries.addData(new TimeSeriesData('2021-09-25T17:02:26Z', 3))
target_timeseries.addData(new TimeSeriesData('2021-10-25T17:02:26Z', 3))
target_timeseries.addData(new TimeSeriesData('2021-11-25T17:02:26Z', 3))

it<TimeSeries>(
  'homogenizesSeries left',
  projectSeriesOnto(timeseries, timestamps),
  target_timeseries
)

interface IndexerPoolEntry {
  token_address: string
  pool_address: string
  lqt_address: string
  token_id: number
  symbol: string
  name: string
  decimals: number
  last_price_xtz: number
  last_price_usd: number
  contract_format: "FA12" | "FA2"
  icon: string
}

interface IndexerPoolPricesEntry {
  timestamp: number
  ratio_xtz_token: number
  ratio_token_xtz: number
  usd_token_price: number
  usd_xtz_price: number
}

export interface InvestorPositionsEntry {
  pool_address: string
  amount_invested: number
  pool_share: number
  pooled_xtz: number
  pooled_token: number
  current_value: number
  token_name: string
  token_symbol: string
  lp_qty: number
  lqt_address: string
}

export class DexIndexer {
  private async queryTZKT(url_tail: string) {
    let result: any
    const url = new URL(url_tail, config.VUE_APP_INDEXER_ROOT_URL).href

    const response = await fetch(url, {
      method: 'GET',
    })

    if (response.ok) {
      result = await response.json()
    }

    return result
  }

  private async queryIndexer(url_tail: string, params?: { [key: string]: any }) {
    let result: any
    const BASE_URL = 'https://smartlink-indexer-api.deployments.smart-chain.fr/v1/'
    const url = new URL(url_tail, BASE_URL)
    if (params) url.search = new URLSearchParams(params).toString()

    const response = await fetch(url.href, {
      method: 'GET',
    })

    if (response.ok) {
      result = await response.json()
    }

    return result
  }

  async getInvestorPositions(investor: string): Promise<InvestorPositionsEntry[]> {
    return await this.queryIndexer(`investor/${investor}`)
  }

  async getPools(): Promise<IndexerPoolEntry[]> {
    return await this.queryIndexer('pools')
  }

  async getSmakBurned(): Promise<{ timestamp: number; burned: number }[]> {
    return await this.queryIndexer('smak_burned')
  }

  async getTvl(): Promise<{ timestamp: number; burned: number }[]> {
    return await this.queryIndexer('pool/total_value_locked')
  }

  async getTotalValueLockedHistoryForToken(swapContract: SwapContract) {
    const xtzPoolHistory = await this.getXtzPoolHistory(swapContract.storage.history.id)

    const timeSeries = new TimeSeries()
    for (const i in xtzPoolHistory.getData()) {
      const xtzPoolEntry = xtzPoolHistory.getData()[i]
      const tvl = Number(xtzPoolEntry.getValue()) * 10 ** -TEZ_DECIMALS
      const dataPoint = new TimeSeriesData(xtzPoolEntry.getTimestamp(), tvl)
      timeSeries.addData(dataPoint)
    }

    return timeSeries
  }

  async getVolumeHistoryForToken(swapContract: SwapContract) {
    const xtzVolumeHistory = await this.getXtzVolumeHistory(swapContract.storage.history.id)

    const timeSeries = new TimeSeries()
    for (const i in xtzVolumeHistory.getData()) {
      const mutezVolumeEntry = xtzVolumeHistory.getData()[i]
      const xtzVolumeEntry = Number(mutezVolumeEntry.getValue()) * 10 ** -TEZ_DECIMALS
      const dataPoint = new TimeSeriesData(mutezVolumeEntry.getTimestamp(), xtzVolumeEntry)
      timeSeries.addData(dataPoint)
    }

    return timeSeries
  }

  async getVolumeHistoryForStaking() {
    const stakingHistoryOffset = 23251
    const stakingVolumeHistory = await this.getStakingHistory(stakingHistoryOffset, 11324)

    const timeSeries = new TimeSeries()
    for (const i in stakingVolumeHistory.getData()) {
      const miliSmakVolumeEntry = stakingVolumeHistory.getData()[i]
      const smakVolumeEntry = Number(miliSmakVolumeEntry.getValue()) * 10 ** -3
      const dataPoint = new TimeSeriesData(miliSmakVolumeEntry.getTimestamp(), smakVolumeEntry)
      timeSeries.addData(dataPoint)
    }

    return timeSeries
  }

  async getStakingHistory(offset: number, bigmap: number) {
    const limit = 10000
    const url = `/v1/bigmaps/updates?bigmap=${bigmap}&limit=${limit}&offset=${offset}`
    const smakVolumeHistory = await this.queryTZKT(url)
    const timeSeries = new TimeSeries()

    const usedTimestamps: { [key: string]: boolean } = {}
    let sum = 242066325075 // SMAK at offset
    for (const i in smakVolumeHistory) {
      const smakVolumeEntry = smakVolumeHistory[i]
      if (usedTimestamps[smakVolumeEntry.timestamp] == undefined) {
        sum += Number(smakVolumeEntry.content.value)
        const dataPoint = new TimeSeriesData(smakVolumeEntry.timestamp, sum)
        timeSeries.addData(dataPoint)
        usedTimestamps[smakVolumeEntry.timestamp] = true
      } else {
        sum += Number(smakVolumeEntry.content.value)
      }
    }

    return timeSeries
  }

  xtzTimeSeriesToUsd(timeSeries: TimeSeries, xtzPriceHistory: TimeSeries) {
    const usdTimeSeries = new TimeSeries()
    for (const { time, value } of timeSeries.resample()) {
      const timestamp = new Date(time).toISOString().slice(0, -5) + 'Z'
      const usdTvlEntry = new TimeSeriesData(
        timestamp,
        xtzPriceHistory.getValueAtTimestamp(timestamp) * value
      )
      usdTimeSeries.addData(usdTvlEntry)
    }
    return usdTimeSeries
  }

  async getVolumeHistoryForTokenUsd(swapContract: SwapContract, xtzPriceHistory: TimeSeries) {
    const volumeXtzHistory = await this.getVolumeHistoryForToken(swapContract)

    return this.xtzTimeSeriesToUsd(volumeXtzHistory, xtzPriceHistory)
  }

  async getVolumeHistory(timeSeries: Array<TimeSeries>, xtzPriceHistory: TimeSeries) {
    let timeAxis: Array<string> = []

    // fetch all Volumes
    for (const tokenTimeSeries of timeSeries) {
      timeAxis = timeAxis.concat(tokenTimeSeries.getTimeAxis())
    }

    // sort timeAxis
    timeAxis.sort()
    const timeAxisNoDuplicates = [...new Set(timeAxis)]

    // project and resample each series on total time axis
    const alignedTimeSeries: Array<TimeSeries> = []
    for (const tokenTimeSeries of timeSeries) {
      const alignedTokenTimeSeries = projectSeriesOnto(tokenTimeSeries, timeAxisNoDuplicates)
      alignedTimeSeries.push(alignedTokenTimeSeries)
    }

    // sum all time series
    const volume: TimeSeries = new TimeSeries()
    for (const timeAxisIndex in timeAxisNoDuplicates) {
      let volumeAtTimeAxisIndex = 0
      for (const tokenTimeSeries of alignedTimeSeries) {
        volumeAtTimeAxisIndex += tokenTimeSeries.getData()[timeAxisIndex].getValue()
      }
      const xtzVolume = volumeAtTimeAxisIndex
      const timestamp = timeAxisNoDuplicates[timeAxisIndex]
      const tvlEntry = new TimeSeriesData(timestamp, xtzVolume)
      volume.addData(tvlEntry)
    }

    const resampledVolume = volume.resample()
    const usdVolume = new TimeSeries()
    for (const { time, value } of resampledVolume) {
      const timestamp = new Date(time).toISOString().slice(0, -5) + 'Z'
      const usdTvlEntry = new TimeSeriesData(timestamp, value * 2)
      usdVolume.addData(usdTvlEntry)
    }

    return usdVolume
  }

  async getTotalValueLockedHistory(timeSeries: Array<TimeSeries>, xtzPriceHistory: TimeSeries) {
    let timeAxis: Array<string> = []

    for (const tokenTimeSeries of timeSeries) {
      timeAxis = timeAxis.concat(tokenTimeSeries.getTimeAxis())
    }

    // sort timeAxis
    timeAxis.sort()
    const timeAxisNoDuplicates = [...new Set(timeAxis)]

    // project and resample each series on total time axis
    const alignedTimeSeries: Array<TimeSeries> = []
    for (const tokenTimeSeries of timeSeries) {
      const alignedTokenTimeSeries = projectSeriesOnto(tokenTimeSeries, timeAxisNoDuplicates)
      alignedTimeSeries.push(alignedTokenTimeSeries)
    }

    // sum all time series
    const tvl: TimeSeries = new TimeSeries()
    for (const timeAxisIndex in timeAxisNoDuplicates) {
      let tvlAtTimeAxisIndex = 0
      for (const tokenTimeSeries of alignedTimeSeries) {
        tvlAtTimeAxisIndex += tokenTimeSeries.getData()[timeAxisIndex].getValue()
      }
      const xtzTvl = tvlAtTimeAxisIndex
      const timestamp = timeAxisNoDuplicates[timeAxisIndex]
      const tvlEntry = new TimeSeriesData(timestamp, xtzTvl)
      tvl.addData(tvlEntry)
    }

    const resampledTvl = tvl.resample()
    const usdTvl = new TimeSeries()
    for (const { time, value } of resampledTvl) {
      const timestamp = new Date(time).toISOString().slice(0, -5) + 'Z'
      const usdTvlEntry = new TimeSeriesData(timestamp, value)
      usdTvl.addData(usdTvlEntry)
    }

    return usdTvl
  }

  async getSwapContracts(swaps_bigmap_id: number) {
    const url = `/v1/bigmaps/${swaps_bigmap_id}/keys/`
    const resp = await this.queryTZKT(url)
    return resp.map((el: any) => el.value)
  }

  async getTokenPoolHistory(bigmap: number) {
    const key = 'tokenPool'
    const limit = 10000
    const url = `/v1/bigmaps/${bigmap}/keys/${key}/updates?limit=${limit}`
    const tokenPoolHistory = await this.queryTZKT(url)

    const timeSeries = new TimeSeries()
    for (const i in tokenPoolHistory) {
      const tokenPoolEntry = tokenPoolHistory[i]
      const dataPoint = new TimeSeriesData(tokenPoolEntry.timestamp, tokenPoolEntry.value)
      timeSeries.addData(dataPoint)
    }

    return timeSeries
  }

  async getXtzPoolHistory(bigmap: number) {
    // const bigmap = 35268
    const key = 'xtzPool'
    const limit = 10000
    const url = `/v1/bigmaps/${bigmap}/keys/${key}/updates?limit=${limit}`
    const xtzPoolHistory = await this.queryTZKT(url)

    const timeSeries = new TimeSeries()
    for (const i in xtzPoolHistory) {
      const xtzPoolEntry = xtzPoolHistory[i]
      const dataPoint = new TimeSeriesData(xtzPoolEntry.timestamp, xtzPoolEntry.value)
      timeSeries.addData(dataPoint)
    }

    return timeSeries
  }

  async getUserInvestments(swapContract: SwapContract, investor: string) {
    const bigmap = swapContract.storage.user_investments.id
    const limit = 10000
    const url = `/v1/bigmaps/${bigmap}/keys/${investor}/updates?limit=${limit}`
    return await this.queryTZKT(url)
  }

  async getXtzVolumeHistory(bigmap: number) {
    const key = 'xtzVolume'
    const limit = 10000
    const url = `/v1/bigmaps/${bigmap}/keys/${key}/updates?limit=${limit}`
    const xtzVolumeHistory = await this.queryTZKT(url)
    const timeSeries = new TimeSeries()
    for (const i in xtzVolumeHistory) {
      const xtzVolumeEntry = xtzVolumeHistory[i]
      const dataPoint = new TimeSeriesData(xtzVolumeEntry.timestamp, xtzVolumeEntry.value)
      timeSeries.addData(dataPoint)
    }

    return timeSeries
  }

  async getXtzToUsdPrice() {
    const j = await this.queryTZKT('/v1/quotes/last')
    const lastQuote = j.level
    const levels = [lastQuote]
    let levelsStr = lastQuote + ','
    const limit = 500
    const delta = 2 * 60 * 4 // sample price every 4h
    for (let i = 0; i < limit; i++) {
      levels.push(levels[levels.length - 1] - delta)
      levelsStr += String(levels[levels.length - 1] - delta) + ','
    }
    const xtzToUsd = await this.queryTZKT(`/v1/quotes?limit=${limit + 1}&level.in=${levelsStr}`)

    const timeSeries = new TimeSeries()
    for (const i in xtzToUsd) {
      const xtzToUsdEntry = xtzToUsd[i]
      const dataPoint = new TimeSeriesData(xtzToUsdEntry.timestamp, xtzToUsdEntry.usd)
      timeSeries.addData(dataPoint)
    }

    return timeSeries
  }

  async getPoolPrice(poolAddress: string, rate = 'h'): Promise<IndexerPoolPricesEntry[]> {
    return await this.queryIndexer(`pool/${poolAddress}/prices?rate=${rate}`)
  }

  async getMarketPriceHistoryXtzToToken(swapContract: SwapContract, decimals: number) {
    const prices = await this.getPoolPrice(swapContract.address)

    const timeSeries = new TimeSeries()
    for (const pricesEntry of prices) {
      const dataPoint = new TimeSeriesData(
        new Date(pricesEntry.timestamp).toISOString().slice(0, -5) + 'Z',
        pricesEntry.ratio_token_xtz
      )
      timeSeries.addData(dataPoint)
    }
    return timeSeries
  }

  async getMarketPriceHistoryTokenToXtz(swapContract: SwapContract, tokenContract: FA12Contract) {
    const prices = await this.getPoolPrice(swapContract.address)

    const timeSeries = new TimeSeries()
    for (const pricesEntry of prices) {
      const dataPoint = new TimeSeriesData(
        new Date(pricesEntry.timestamp).toISOString().slice(0, -5) + 'Z',
        pricesEntry.ratio_xtz_token
      )
      timeSeries.addData(dataPoint)
    }
    return timeSeries
  }

  async getMarketPriceHistoryTokenToToken(
    swapContractA: SwapContract,
    tokenContractA: FA12Contract,
    swapContractB: SwapContract,
    tokenContractB: FA12Contract
  ) {
    const tokenPoolA = await this.getTokenPoolHistory(swapContractA.storage.history.id)
    const xtzPoolA = await this.getXtzPoolHistory(swapContractA.storage.history.id)
    const tokenPoolB = await this.getTokenPoolHistory(swapContractB.storage.history.id)
    const xtzPoolB = await this.getXtzPoolHistory(swapContractB.storage.history.id)

    const timestamps = mergeTimestampLists(tokenPoolA.getTimeAxis(), tokenPoolB.getTimeAxis())

    const alignedTokenPoolA = projectSeriesOnto(tokenPoolA, timestamps)
    const alignedTokenPoolB = projectSeriesOnto(tokenPoolB, timestamps)
    const alignedXtzPoolA = projectSeriesOnto(xtzPoolA, timestamps)
    const alignedXtzPoolB = projectSeriesOnto(xtzPoolB, timestamps)

    const timeSeries = new TimeSeries()
    for (const i in alignedTokenPoolA.getData()) {
      const tokenPoolAEntry = alignedTokenPoolA.getData()[i]
      const tokenPoolBEntry = alignedTokenPoolB.getData()[i]
      const xtzPoolAEntry = alignedXtzPoolA.getData()[i]
      const xtzPoolBEntry = alignedXtzPoolB.getData()[i]
      const exchangeRate = tokenToTokenExchangeRateForDisplay(
        1 * Math.pow(10, tokenContractA.metadata.decimals),
        xtzPoolAEntry.getValue(),
        tokenPoolAEntry.getValue(),
        tokenContractA.metadata.decimals,
        xtzPoolBEntry.getValue(),
        tokenPoolBEntry.getValue(),
        tokenContractB.metadata.decimals
      )
      if (exchangeRate) {
        const dataPoint = new TimeSeriesData(tokenPoolAEntry.getTimestamp(), exchangeRate)
        timeSeries.addData(dataPoint)
      }
    }

    return timeSeries
  }
}
