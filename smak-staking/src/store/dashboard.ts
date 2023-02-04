import { TOKENS, TOKEN_METADATA, TEZOS_DECIMALS } from './../constants/tokens.const'
import { DexIndexer, projectSeriesOnto } from '@/modules/dexIndexer'
import { TimeSeries, TimeSeriesData } from '@/modules/timeSeries'
import { SwapContract } from '@/modules/contractInterfaces/swap'
import { IToken } from '@/interfaces/token.interface'
import { ISwapToken } from '@/interfaces/swap-token.interface'
import { ISwapContractsValue } from '@/store/dexContracts'
import { getLocalStorageData } from '@/helpers/storage.helper'
import { tokenIdentifier } from '@/helpers/token.helper'
import { ITopPool, ITopToken } from '@/interfaces/smartlink.interface'

interface GraphInfo {
  amount: string
  date: string
}

interface IDashboardState {
  maxPageNumber: number
  currentPageNumber: number
  currentPageNumberPools: number
  showSearchModal: boolean
  totalValueLockedTimeSeries: TimeSeries
  volumeTimeSeries: TimeSeries
  stakingValueLocked: TimeSeries
  totalValueLockedTimeSeriesPerToken: { [address: string]: TimeSeries }
  volumeTimeSeriesPerToken: { [address: string]: TimeSeries }
  priceTimeSeriesPerToken: { [address: string]: TimeSeries }
  feesTimeSeries: TimeSeries
  tvlInfo: GraphInfo
  volumeInfo: GraphInfo
  watchlistTokens: { address: string; tokenId: number }[]
  watchlistPools: { address: string }[]
  isDashboardLoaded: boolean
  isTokensLoaded: boolean
}

interface IDashboardActionContext {
  state: IDashboardState
  commit: any
  rootState: any
  dispatch: any
}

export const dashboardState = {
  namespaced: true,
  state: (): IDashboardState => ({
    maxPageNumber: 5,
    currentPageNumber: 1,
    currentPageNumberPools: 1,
    showSearchModal: false,
    totalValueLockedTimeSeries: new TimeSeries(),
    volumeTimeSeries: new TimeSeries(),
    stakingValueLocked: new TimeSeries(),
    totalValueLockedTimeSeriesPerToken: {},
    volumeTimeSeriesPerToken: {},
    priceTimeSeriesPerToken: {},
    feesTimeSeries: new TimeSeries(),
    tvlInfo: { amount: '0', date: '' },
    volumeInfo: { amount: '0', date: '' },
    watchlistTokens: getLocalStorageData('__watchlistTokens', []),
    watchlistPools: getLocalStorageData('__watchlistPools', []),
    isDashboardLoaded: false,
    isTokensLoaded: false,
  }),
  getters: {
    isTokensLoaded: ({ isTokensLoaded }: IDashboardState) => isTokensLoaded,
    isDashboardLoaded: ({ isDashboardLoaded }: IDashboardState) => isDashboardLoaded,
    watchlistTokens: (
      { watchlistTokens }: IDashboardState,
      getters: any,
      rootState: any,
      rootGetters: any
    ) => {
      const tokenIdentifiers = watchlistTokens.reduce((acc: any[], cur) => {
        const identifier = tokenIdentifier(cur)
        acc.push(identifier)
        return acc
      }, [])

      const tokens = rootGetters['tokens/topTokens']

      return tokens.filter((token: ITopToken) => {
        const identifier = tokenIdentifier({
          address: token.token_address,
          tokenId: token.token_id,
        })

        return tokenIdentifiers.includes(identifier)
      })
    },
    watchlistPools: (
      { watchlistPools }: IDashboardState,
      getters: any,
      rootState: any,
      rootGetters: any
    ) => {
      const poolAddresses = watchlistPools.map((pool) => pool.address)
      const pools = rootGetters['pools/topPools']

      return pools.filter((pool: ITopPool) => {
        return poolAddresses.includes(pool.pool_address)
      })
    },
    xtzToken: (state: any, getters: any, rootState: any): Array<IToken> => {
      if (!Object.keys(state.volumeTimeSeriesPerToken).length) return []

      const swaps: Array<ISwapContractsValue> = Object.values(rootState.dexContracts.swapContracts)
      const initValue: IToken = {
        index: 0,
        tokenId: 0,
        ...TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId],
        name: TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId].metadata.name,
        usdPrice: rootState.dexContracts.xtzPriceHistory.lastValue,
        priceChange: rootState.dexContracts.xtzPriceHistory.getVariationPercentage('day'),
        volume: 0,
        volumeWeek: 0,
        tvl: 0,
        priceWeekChart: {
          labels: Array(7).fill(0),
          datasets: [
            {
              label: 'Last 7 days',
              data: rootState.dexContracts.xtzPriceHistory.lastValues(7),
              backgroundColor: 'transparent',
              borderColor:
                +rootState.dexContracts.xtzPriceHistory.getVariationPercentage('day') < 0
                  ? '#FF6363'
                  : '#3BDBAB',
            },
          ],
        },
      }

      return [
        swaps.reduce<IToken>((acc: IToken, cur: ISwapContractsValue): IToken => {
          const volume = state.volumeTimeSeriesPerToken[cur.tokenContract.address]

          acc.volume += +volume.cummulativeSum('day')
          acc.volumeWeek += +volume.cummulativeSum('week')
          acc.tvl +=
            +cur.swapContract.storage.xtzPool.toString() *
            10 ** -TEZOS_DECIMALS *
            rootState.dexContracts.xtzPriceHistory.lastValue

          return acc
        }, initValue),
      ]
    },
    tokens: (state: any, getters: any, rootState: any) => {
      if (!Object.keys(state.volumeTimeSeriesPerToken).length) return []

      const swaps = Object.values(rootState.dexContracts.swapContracts)
      const tokens = swaps.map(({ swapContract, tokenContract }: any, index): IToken => {
        const price = state.priceTimeSeriesPerToken[tokenContract.address]
        const volume = state.volumeTimeSeriesPerToken[tokenContract.address]
        const tvl =
          Number(swapContract.storage.xtzPool.toString()) *
          10 ** -TEZOS_DECIMALS *
          rootState.dexContracts.xtzPriceHistory.lastValue

        return {
          index: index + 1,
          address: tokenContract.address,
          tokenId: tokenContract.getTokenId(),
          metadata: tokenContract.metadata,
          name: tokenContract.metadata.name,
          usdPrice: price.lastValue,
          priceChange: price.getVariationPercentage('day'),
          volume: volume.cummulativeSum('day'),
          volumeWeek: volume.cummulativeSum('week'),
          tvl: tvl,
          priceWeekChart: {
            value: price.getVariationPercentage('week'),
            labels: Array(7).fill(0),
            datasets: [
              {
                label: 'Last 7 days',
                data: price.lastValues(7),
                backgroundColor: 'transparent',
                borderColor: +price.getVariationPercentage('day') < 0 ? '#FF6363' : '#3BDBAB',
              },
            ],
          },
        }
      })

      return [...getters.xtzToken, ...tokens]
    },
    swapTokens: (state: any, getters: any, rootState: any) => {
      if (!Object.keys(state.volumeTimeSeriesPerToken).length) return []

      const swaps = Object.values(rootState.dexContracts.swapContracts)
      const tokens = swaps.map(({ swapContract, tokenContract }: any, index): ISwapToken => {
        const volume = state.volumeTimeSeriesPerToken[tokenContract.address]
        const volumeScale = volume.scale(2)
        const fees = volumeScale.scale(0.25 / 100)
        const tvl =
          Number(swapContract.storage.xtzPool.toString()) *
          10 ** -TEZOS_DECIMALS *
          rootState.dexContracts.xtzPriceHistory.lastValue *
          2
        const dailyFee = Number(fees.cummulativeSum('day'))

        return {
          index: index + 1,
          address: swapContract.address,
          metadata: tokenContract.metadata,
          symbol: tokenContract.metadata.name,
          volume: volume.cummulativeSum('day'),
          volumeWeek: volume.cummulativeSum('week'),
          fees: dailyFee,
          feesWeek: fees.cummulativeSum('week'),
          tvl: tvl,
          feesYearPercentage: (dailyFee / tvl) * 365.25 * 100,
        }
      })

      return tokens
    },
  },
  mutations: {
    updateTvlInfo: (state: IDashboardState, tvlInfo: GraphInfo) => (state.tvlInfo = tvlInfo),
    updateVolumeInfo: (state: IDashboardState, volumeInfo: GraphInfo) =>
      (state.volumeInfo = volumeInfo),
    setPriceTimeSeriesPerToken: (
      state: IDashboardState,
      priceTimeSeriesPerToken: { [address: string]: TimeSeries }
    ) => (state.priceTimeSeriesPerToken = priceTimeSeriesPerToken),
    setVolumeTimeSeriesPerToken: (
      state: IDashboardState,
      volumeTimeSeriesPerToken: { [address: string]: TimeSeries }
    ) => (state.volumeTimeSeriesPerToken = volumeTimeSeriesPerToken),
    setTotalValueLockedTimeSeriesPerToken: (
      state: IDashboardState,
      totalValueLockedTimeSeriesPerToken: { [address: string]: TimeSeries }
    ) => (state.totalValueLockedTimeSeriesPerToken = totalValueLockedTimeSeriesPerToken),
    setVolumeTimeSeries: (state: IDashboardState, volumeTimeSeries: TimeSeries) =>
      (state.volumeTimeSeries = volumeTimeSeries),
    setTotalValueLockedTimeSeries: (
      state: IDashboardState,
      totalValueLockedTimeSeries: TimeSeries
    ) => (state.totalValueLockedTimeSeries = totalValueLockedTimeSeries),
    setStakingValueLocked: (state: IDashboardState, stakingValueLocked: TimeSeries) =>
      (state.stakingValueLocked = stakingValueLocked),
    setFeesTimeSeries: (state: IDashboardState, feesTimeSeries: TimeSeries) =>
      (state.feesTimeSeries = feesTimeSeries),
    setPageNumber: (state: IDashboardState, pageNumber: number) =>
      (state.currentPageNumber = pageNumber),
    setPageNumberPools: (state: IDashboardState, pageNumber: number) =>
      (state.currentPageNumberPools = pageNumber),
    updateShowSearchModal: (state: IDashboardState, show: boolean) =>
      (state.showSearchModal = show),
    addTokenToWatchlist: (state: IDashboardState, token: { address: string; tokenId: number }) => {
      const oldWatchlist = getLocalStorageData('__watchlistTokens', [])
      const newWatchlist = [...oldWatchlist, token]

      state.watchlistTokens = newWatchlist
      localStorage.setItem('__watchlistTokens', JSON.stringify(newWatchlist))
    },
    removeTokenToWatchlist: (
      state: IDashboardState,
      tokenForRemove: { address: string; tokenId: number }
    ) => {
      const oldWatchlist = getLocalStorageData('__watchlistTokens', [])
      const newWatchlist = [...oldWatchlist].filter((token) => {
        return (
          token.address !== tokenForRemove.address && +token.tokenId !== +tokenForRemove.tokenId
        )
      })

      state.watchlistTokens = newWatchlist
      localStorage.setItem('__watchlistTokens', JSON.stringify(newWatchlist))
    },
    addPoolToWatchlist: (state: IDashboardState, token: { address: string }) => {
      const oldWatchlist = getLocalStorageData('__watchlistPools', [])
      const newWatchlist = [...oldWatchlist, token]

      state.watchlistPools = newWatchlist
      localStorage.setItem('__watchlistPools', JSON.stringify(newWatchlist))
    },
    removePoolToWatchlist: (state: IDashboardState, poolForRemove: { address: string }) => {
      const oldWatchlist = getLocalStorageData('__watchlistPools', [])
      const newWatchlist = [...oldWatchlist].filter((token) => {
        return token.address !== poolForRemove.address
      })

      state.watchlistPools = newWatchlist
      localStorage.setItem('__watchlistPools', JSON.stringify(newWatchlist))
    },
    setIsDashboardLoaded: (state: IDashboardState, payload: boolean) => {
      state.isDashboardLoaded = payload
    },
    setIsTokensLoaded: (state: IDashboardState, payload: boolean) => {
      state.isTokensLoaded = payload
    },
  },
  actions: {
    loadTimeSeriesPerTokens: async ({ commit, rootState }: IDashboardActionContext) => {
      const priceTimeSeriesPerToken: { [address: string]: TimeSeries } = {}
      const volumeTimeSeriesPerToken: { [address: string]: TimeSeries } = {}
      const totalValueLockedTimeSeriesPerToken: { [address: string]: TimeSeries } = {}
      const dexIndexer = new DexIndexer()

      for (const swapContractAddress of Object.keys(rootState.dexContracts.swapContracts)) {
        const { swapContract, tokenContract } =
          rootState.dexContracts.swapContracts[swapContractAddress]
        const tokenVolumeTimeSeries = await dexIndexer.getVolumeHistoryForToken(swapContract)

        volumeTimeSeriesPerToken[tokenContract.address] = dexIndexer.xtzTimeSeriesToUsd(
          tokenVolumeTimeSeries.getHistogram(),
          rootState.dexContracts.xtzPriceHistory
        )
        const totalValueLockedTimeSeries = await dexIndexer.getTotalValueLockedHistoryForToken(
          swapContract
        )
        totalValueLockedTimeSeriesPerToken[tokenContract.address] = dexIndexer.xtzTimeSeriesToUsd(
          totalValueLockedTimeSeries,
          rootState.dexContracts.xtzPriceHistory
        )
        const tokenPriceTimeSeries = await dexIndexer.getMarketPriceHistoryTokenToXtz(
          swapContract,
          tokenContract
        )
        priceTimeSeriesPerToken[tokenContract.address] = dexIndexer.xtzTimeSeriesToUsd(
          tokenPriceTimeSeries,
          rootState.dexContracts.xtzPriceHistory
        )
      }
      commit('setTotalValueLockedTimeSeriesPerToken', totalValueLockedTimeSeriesPerToken)
      commit('setVolumeTimeSeriesPerToken', volumeTimeSeriesPerToken)
      commit('setPriceTimeSeriesPerToken', priceTimeSeriesPerToken)
      commit('setIsTokensLoaded', true)
    },
    loadTotalValueLockedTimeSeries: async ({
      commit,
      rootState,
      dispatch,
      state,
    }: IDashboardActionContext) => {
      // load TVL for all tokens
      const dexIndexer = new DexIndexer()

      const swapContracts: Array<SwapContract> = []
      for (const swapContractAddress of Object.keys(rootState.dexContracts.swapContracts)) {
        const swapContract: SwapContract =
          rootState.dexContracts.swapContracts[swapContractAddress].swapContract
        swapContracts.push(swapContract)
      }
      // TODO: add staking
      await dispatch('dexContracts/updateXtzPriceHistory', null, { root: true })
      const tvl = await dexIndexer.getTotalValueLockedHistory(
        Object.values(state.totalValueLockedTimeSeriesPerToken),
        rootState.dexContracts.xtzPriceHistory
      )
      commit('setTotalValueLockedTimeSeries', tvl.scale(2))
      const staking = await dexIndexer.getVolumeHistoryForStaking()

      //let timeAxis: Array<string> = []
      const timeAxis = tvl.getTimeAxis().concat(staking.getTimeAxis())
      // sort timeAxis
      timeAxis.sort()
      const timeAxisNoDuplicates = [...new Set(timeAxis)]

      const alignedTvl = projectSeriesOnto(tvl, timeAxisNoDuplicates).resample()
      const alignedStaking = projectSeriesOnto(staking, timeAxisNoDuplicates).resample()
      const smakPrice = state.priceTimeSeriesPerToken['KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X']
      const alignedSmakPrice = projectSeriesOnto(smakPrice, timeAxisNoDuplicates).resample()

      const sumTimeSeries = new TimeSeries()
      for (const i in alignedTvl) {
        const tvlEntry = alignedTvl[i] || { value: 0 }
        const stakingEntry = alignedStaking[i] || { value: 0 }
        const smakPrice = alignedSmakPrice[i] || { value: 0 }
        const entry = new TimeSeriesData(
          new Date(tvlEntry.time).toISOString().slice(0, -5) + 'Z',
          tvlEntry.value + stakingEntry.value * smakPrice.value
        )
        sumTimeSeries.addData(entry)
      }

      commit('setStakingValueLocked', sumTimeSeries)
    },
    loadVolumeTimeSeries: async ({
      commit,
      rootState,
      dispatch,
      state,
    }: IDashboardActionContext) => {
      const dexIndexer = new DexIndexer()

      await dispatch('dexContracts/updateXtzPriceHistory', null, { root: true })
      const volume = await dexIndexer.getVolumeHistory(
        Object.values(state.volumeTimeSeriesPerToken),
        rootState.dexContracts.xtzPriceHistory
      )

      commit('setVolumeTimeSeries', volume)
      commit('setFeesTimeSeries', volume.scale(0.0025))
      commit('setIsDashboardLoaded', true)
    },
  },
}
