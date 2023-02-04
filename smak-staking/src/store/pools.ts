import PoolAPI from '@/apis/pool.api'
import TopsAPI from '@/apis/tops.api'
import {
  ITopPool,
  ITotalValueLocked,
  ITotalVolume,
  IPoolStatistics,
} from '../interfaces/smartlink.interface'
import {
  ITotalLiquidity,
  ISmartlinkIndexerParams,
  IVolume,
  IFeeDistribution,
  ILpFeesReceived,
  ITopPoolsByFees,
  IValueLocked,
  IPool,
} from '@/interfaces/smartlink.interface'
import { tokenIdentifier } from '@/helpers/token.helper'

const MODULE_STATE = {
  pools: {} as { [key: string]: IPool },
  topPools: [] as ITopPool[],
  totalLiquidity: [] as ITotalLiquidity[],
  totalVolume: [] as ITotalVolume[],
  feeDistribution: [] as IFeeDistribution[],
  lpFeesReceived: [] as ILpFeesReceived[],
  topPoolsByFees: [] as ITopPoolsByFees[],
  poolValueLocked: {} as { [key: string]: IValueLocked[] },
  poolVolume: {} as { [key: string]: IVolume[] },
  totalValueLocked: [] as ITotalValueLocked[],
  poolStatistics: {} as IPoolStatistics,
}

export const pools = {
  namespaced: true,
  state: () => MODULE_STATE,
  getters: {
    pools: (state: typeof MODULE_STATE) => state.pools,
    poolStatistics: (state: typeof MODULE_STATE) => state.poolStatistics,
    topPools: (state: typeof MODULE_STATE, getters: any, rootState: any) => {
      return state.topPools.map((pool) => {
        const identifier = tokenIdentifier({
          address: pool.token_address,
          tokenId: pool.token_id || 0,
        })

        return {
          ...pool,
          metadata: {
            name: pool.name,
            symbol: pool.symbol,
            thumbnailUri: pool.icon,
            ...rootState.tokens.tokensMetadata[identifier],
          },
        }
      })
    },
    totalLiquidity: (state: typeof MODULE_STATE) => state.totalLiquidity,
    totalVolume: (state: typeof MODULE_STATE) => state.totalVolume,
    feeDistribution: (state: typeof MODULE_STATE) => state.feeDistribution,
    lpFeesReceived: (state: typeof MODULE_STATE) => state.lpFeesReceived,
    topPoolsByFees: (state: typeof MODULE_STATE) => state.topPoolsByFees,
    poolValueLocked: (state: typeof MODULE_STATE) => state.poolValueLocked,
    poolVolume: (state: typeof MODULE_STATE) => state.poolVolume,
    totalValueLocked: (state: typeof MODULE_STATE) => state.totalValueLocked,
  },
  mutations: {
    setPool: (state: typeof MODULE_STATE, pools: IPool[]) => {
      state.pools = pools.reduce((acc, cur) => {
        acc[cur.pool_address] = cur
        return acc
      }, state.pools)
    },
    setTopPools: (state: typeof MODULE_STATE, topPools: ITopPool[]) => {
      state.topPools = topPools
    },
    setPoolStatistics: (state: typeof MODULE_STATE, poolStatistics: IPoolStatistics) => {
      state.poolStatistics = poolStatistics
    },
    setTotalLiquidity: (state: typeof MODULE_STATE, totalLiquidity: ITotalLiquidity[]) => {
      state.totalLiquidity = totalLiquidity
    },
    setTotalValueLocked: (state: typeof MODULE_STATE, totalValueLocked: ITotalValueLocked[]) => {
      state.totalValueLocked = totalValueLocked
    },
    setTotalVolume: (state: typeof MODULE_STATE, totalVolume: ITotalVolume[]) => {
      state.totalVolume = totalVolume
    },
    setFeeDistribution: (state: typeof MODULE_STATE, feeDistribution: IFeeDistribution[]) => {
      state.feeDistribution = feeDistribution
    },
    setLpFeesReceived: (state: typeof MODULE_STATE, lpFeesReceived: ILpFeesReceived[]) => {
      state.lpFeesReceived = lpFeesReceived
    },
    setTopPoolsByFees: (state: typeof MODULE_STATE, topPoolsByFees: ITopPoolsByFees[]) => {
      state.topPoolsByFees = topPoolsByFees
    },
    setPoolValueLocked: (
      state: typeof MODULE_STATE,
      { poolValueLocked, poolAddress }: { poolValueLocked: IValueLocked[]; poolAddress: string }
    ) => {
      state.poolValueLocked = {
        ...state.poolValueLocked,
        [poolAddress]: poolValueLocked,
      }
    },
    setPoolVolume: (
      state: typeof MODULE_STATE,
      { poolVolume, poolAddress }: { poolVolume: IVolume[]; poolAddress: string }
    ) => {
      state.poolVolume = {
        ...state.poolVolume,
        [poolAddress]: poolVolume,
      }
    },
  },
  actions: {
    getPools: async (context: any): Promise<IPool[]> => {
      const pools = await PoolAPI.getPools()
      context.commit('setPool', pools)
      context.commit('tokens/setTokensMetadataByPools', pools, { root: true })

      return pools
    },
    getTopPools: async (context: any): Promise<ITopPool[]> => {
      const topPools = await TopsAPI.getTopPools()
      context.commit('setTopPools', topPools)

      return topPools
    },
    getPoolStatistics: async (context: any): Promise<IPoolStatistics> => {
      const poolStatistics = await PoolAPI.getPoolStatistics()
      context.commit('setPoolStatistics', poolStatistics)

      return poolStatistics
    },
    getTotalLiquidity: async (
      context: any,
      params?: ISmartlinkIndexerParams
    ): Promise<ITotalLiquidity[]> => {
      const totalLiquidity = await PoolAPI.getTotalLiquidity(params)
      context.commit('setTotalLiquidity', totalLiquidity)

      return totalLiquidity
    },
    getTotalVolume: async (
      context: any,
      params?: ISmartlinkIndexerParams
    ): Promise<ITotalVolume[]> => {
      const totalVolume = await PoolAPI.getTotalVolume(params)
      const feeDistribution = totalVolume.map(
        ({ timestamp, usd_buyback, usd_treasury, usd_lp_fees }: ITotalVolume) => {
          return {
            timestamp,
            usd_buyback,
            usd_treasury,
            usd_lp_fees,
          }
        }
      )
      const lpFeesReceived = totalVolume.map(({ timestamp, usd_lp_fees }: ITotalVolume) => {
        return {
          timestamp,
          usd_lp_fees,
        }
      })

      context.commit('setTotalVolume', totalVolume)
      context.commit('setFeeDistribution', feeDistribution)
      context.commit('setLpFeesReceived', lpFeesReceived)

      return totalVolume
    },
    getTotalValueLocked: async (context: any): Promise<ITotalValueLocked[]> => {
      const totalValueLocked = await PoolAPI.getTotalValueLocked()
      context.commit('setTotalValueLocked', totalValueLocked)

      return totalValueLocked
    },
    getFeeDistribution: async (
      context: any,
      params?: ISmartlinkIndexerParams
    ): Promise<IFeeDistribution[]> => {
      const totalVolume = await PoolAPI.getTotalVolume(params)
      const feeDistribution = totalVolume.map(
        ({ timestamp, usd_buyback, usd_treasury, usd_lp_fees }: ITotalVolume) => {
          return {
            timestamp,
            usd_buyback,
            usd_treasury,
            usd_lp_fees,
          }
        }
      )
      context.commit('setFeeDistribution', feeDistribution)

      return feeDistribution
    },
    getLpFeesReceived: async (
      context: any,
      params?: ISmartlinkIndexerParams
    ): Promise<ILpFeesReceived[]> => {
      const totalVolume = await PoolAPI.getTotalVolume(params)
      const lpFeesReceived = totalVolume.map(({ timestamp, usd_lp_fees }: ITotalVolume) => {
        return {
          timestamp,
          usd_lp_fees,
        }
      })

      context.commit('setLpFeesReceived', lpFeesReceived)

      return lpFeesReceived
    },
    getTopPoolsByFees: async (context: any): Promise<ITotalLiquidity[]> => {
      const topPoolsByFees = await TopsAPI.getTopPoolsByFees()
      context.commit('setTopPoolsByFees', topPoolsByFees)

      return topPoolsByFees
    },
    getValueLockedByPoolAddress: async (
      context: any,
      poolAddress: string
    ): Promise<IValueLocked[]> => {
      const poolValueLocked = await PoolAPI.getValueLockedByPoolAddress(poolAddress)
      context.commit('setPoolValueLocked', { poolValueLocked, poolAddress })

      return poolValueLocked
    },
    getVolumeByPoolAddress: async (context: any, poolAddress: string): Promise<IVolume[]> => {
      const poolVolume = await PoolAPI.getVolumeByPoolAddress(poolAddress)
      context.commit('setPoolVolume', { poolVolume, poolAddress })

      return poolVolume
    },
  },
}
