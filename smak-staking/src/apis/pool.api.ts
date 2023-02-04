import {
  ITimestampValueLocked,
  ITotalLiquidity,
  ITotalValueLocked,
  ISmartlinkIndexerParams,
  IVolume,
  IPool,
  ITotalVolume,
  ITokenPrice,
  IPoolStatistics,
} from '@/interfaces/smartlink.interface'
import http from './http'

const baseURL = 'https://smartlink-indexer-api.deployments.smart-chain.fr/v1'
const api = http(baseURL)

const PoolAPI = {
  getPools: () => api.get<IPool[]>(`pools`),
  getPoolStatistics: () => api.get<IPoolStatistics>(`pools_statistics`),
  getValueLockedByPoolAddress: (pool_address: string, params?: ISmartlinkIndexerParams) =>
    api.get<ITimestampValueLocked[]>(`pool/${pool_address}/value_locked`, { params }),
  getVolumeByPoolAddress: (pool_address: string, params?: ISmartlinkIndexerParams) =>
    api.get<IVolume[]>(`pool/${pool_address}/volume`, { params }),
  getPriceByPoolAddress: (pool_address: string, params?: ISmartlinkIndexerParams) =>
    api.get<ITokenPrice[]>(`pool/${pool_address}/prices`, { params }),
  getTotalValueLocked: (params?: ISmartlinkIndexerParams) =>
    api.get<ITotalValueLocked[]>(`pool/total_value_locked`, { params }),
  getTotalLiquidity: (params?: ISmartlinkIndexerParams) =>
    api.get<ITotalLiquidity[]>(`pool/total_liquidity`, { params }),
  getTotalVolume: (params?: ISmartlinkIndexerParams) =>
    api.get<ITotalVolume[]>(`pool/total_volume`, { params }),
}

export default PoolAPI
