import InvestorAPI from '@/apis/investor.api'
import PoolAPI from '@/apis/pool.api'
import SmakAPI from '@/apis/smak.api'

import { SWAP_ADDRESS } from '@/constants/tokens.const'

import {
  ISmakBurned,
  ITimestampValueLocked,
  ITotalValueLocked,
  IValueLockedParams,
  IHolders,
  ITotalStaking,
  ISmartlinkIndexerParams,
  ITokenPrice,
  IAppTotalValueLocked,
} from '@/interfaces/smartlink.interface'

import { config } from '../../config/config'

const MODULE_STATE = {
  circulatingSupply: Number(config.CIRCULATING_SUPPLY),
  fullyDillutedSupply: Math.floor(Number(config.TOTAL_SUPPLY) / 1000),
  smakBurned: [] as ISmakBurned[],
  smakValueLocked: [] as ITimestampValueLocked[],
  totalValueLocked: [] as ITotalValueLocked[],
  totalValueLockedAmount: 0,
  holders: {} as IHolders,
  totalStakingRewards: [] as ITotalStaking[],
  totalStakingPrograms: [] as ITotalStaking[],
  smakPrices: [] as ITokenPrice[],
  appTotalValueLocked: [] as IAppTotalValueLocked[],
}

export const smak = {
  namespaced: true,
  state: () => MODULE_STATE,
  getters: {
    circulatingSupply: (state: typeof MODULE_STATE) => state.circulatingSupply,
    fullyDillutedSupply: (state: typeof MODULE_STATE) => state.fullyDillutedSupply,
    smakBurned: (state: typeof MODULE_STATE) => state.smakBurned,
    latestSmakBurned: (state: typeof MODULE_STATE) =>
      state.smakBurned.length ? state.smakBurned[state.smakBurned.length - 1].balance : 0,
    smakValueLocked: (state: typeof MODULE_STATE) => state.smakValueLocked,
    totalValueLocked: (state: typeof MODULE_STATE) => state.totalValueLocked,
    totalValueLockedAmount: (state: typeof MODULE_STATE) => state.totalValueLockedAmount,
    totalStakingRewards: (state: typeof MODULE_STATE) => state.totalStakingRewards,
    totalStakingPrograms: (state: typeof MODULE_STATE) => state.totalStakingPrograms,
    totalSmakStaked: (state: typeof MODULE_STATE) => {
      const lastIndex = state.totalStakingPrograms.length - 1
      if (lastIndex < 0) return 0

      const flexTotal = state.totalStakingPrograms[lastIndex].flex_total
      const lockTotal = state.totalStakingPrograms[lastIndex].lock_total

      return flexTotal + lockTotal
    },
    holders: (state: typeof MODULE_STATE) => state.holders,
    smakPrices: (state: typeof MODULE_STATE) => state.smakPrices,
    appTotalValueLocked: (state: typeof MODULE_STATE) => state.appTotalValueLocked,
    appTotalValueLockedAmount: (state: typeof MODULE_STATE) =>
      state.appTotalValueLocked.length
        ? state.appTotalValueLocked[state.appTotalValueLocked.length - 1].global_tvl
        : 0,
  },
  mutations: {
    setSmakBurned: (state: typeof MODULE_STATE, smakBurned: ISmakBurned[]) => {
      state.smakBurned = smakBurned
    },
    setSmakValueLocked: (state: typeof MODULE_STATE, smakValueLocked: ITimestampValueLocked[]) => {
      state.smakValueLocked = smakValueLocked
    },
    setTotalValueLocked: (state: typeof MODULE_STATE, totalValueLocked: ITotalValueLocked[]) => {
      state.totalValueLocked = totalValueLocked
    },
    setTotalValueLockedAmount: (state: typeof MODULE_STATE, totalValueLockedAmount: number) => {
      state.totalValueLockedAmount = totalValueLockedAmount
    },
    setTotalStakingRewards: (state: typeof MODULE_STATE, totalStakingRewards: ITotalStaking[]) => {
      state.totalStakingRewards = totalStakingRewards
    },
    setTotalStakingPrograms: (
      state: typeof MODULE_STATE,
      totalStakingPrograms: ITotalStaking[]
    ) => {
      state.totalStakingPrograms = totalStakingPrograms
    },
    setSmakPrices: (state: typeof MODULE_STATE, smakPrices: ITokenPrice[]) => {
      state.smakPrices = smakPrices
    },
    setAppTotalValueLocked: (
      state: typeof MODULE_STATE,
      appTotalValueLocked: IAppTotalValueLocked[]
    ) => {
      state.appTotalValueLocked = appTotalValueLocked
    },
    setHolders: (state: typeof MODULE_STATE, holders: IHolders) => {
      state.holders = holders
    },
  },
  actions: {
    getSmakBurned: async (
      context: any,
      params?: ISmartlinkIndexerParams
    ): Promise<ISmakBurned[]> => {
      const smakBurned = await SmakAPI.getSmakBurned(params)
      context.commit('setSmakBurned', smakBurned)

      return smakBurned
    },
    getSmakValueLocked: async (
      context: any,
      params: IValueLockedParams
    ): Promise<ITimestampValueLocked[]> => {
      const smakValueLocked = await PoolAPI.getValueLockedByPoolAddress(
        SWAP_ADDRESS.XTZ_SMAK,
        params
      )
      context.commit('setSmakValueLocked', smakValueLocked)

      return smakValueLocked
    },
    getTotalValueLocked: async (
      context: any,
      params: IValueLockedParams
    ): Promise<ITotalValueLocked[]> => {
      const totalValueLocked = await PoolAPI.getTotalValueLocked(params)
      context.commit('setTotalValueLocked', totalValueLocked)
      if (!context.getters.totalValueLockedAmount)
        context.commit(
          'setTotalValueLockedAmount',
          totalValueLocked[totalValueLocked.length - 1].tvl
        )

      return totalValueLocked
    },
    getTotalStakingRewards: async (
      context: any,
      params?: ISmartlinkIndexerParams
    ): Promise<ITotalStaking[]> => {
      const totalStakingRewards = await InvestorAPI.getTotalStakingProgram(params)
      context.commit('setTotalStakingRewards', totalStakingRewards)

      return totalStakingRewards
    },
    getTotalStakingPrograms: async (
      context: any,
      params?: ISmartlinkIndexerParams
    ): Promise<ITotalStaking[]> => {
      const totalStakingPrograms = await InvestorAPI.getTotalStakingProgram(params)
      context.commit('setTotalStakingPrograms', totalStakingPrograms)

      return totalStakingPrograms
    },
    getHolders: async (context: any): Promise<IHolders> => {
      const holders = await SmakAPI.getSmakHolders()
      context.commit('setHolders', holders)

      return holders
    },
    getSmakPrice: async (context: any, params: ISmartlinkIndexerParams): Promise<ITokenPrice[]> => {
      const smakPrices = await PoolAPI.getPriceByPoolAddress(SWAP_ADDRESS.XTZ_SMAK, params)
      context.commit('setSmakPrices', smakPrices)

      return smakPrices
    },
    getAppTotalValueLocked: async (
      context: any,
      params: ISmartlinkIndexerParams
    ): Promise<IAppTotalValueLocked[]> => {
      const appTotalValueLocked = await SmakAPI.getTotalValueLocked(params)
      context.commit('setAppTotalValueLocked', appTotalValueLocked)

      return appTotalValueLocked
    },
  },
}
