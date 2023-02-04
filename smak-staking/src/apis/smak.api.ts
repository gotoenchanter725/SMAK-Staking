import { IAppTotalValueLocked, IHolders, ISmakBurned } from '@/interfaces/smartlink.interface'
import http from './http'
import { ISmartlinkIndexerParams } from '../interfaces/smartlink.interface'

const baseURL = 'https://smartlink-indexer-api.deployments.smart-chain.fr/v1'
const api = http(baseURL)

const SmakAPI = {
  getSmakBurned: (params?: ISmartlinkIndexerParams) =>
    api.get<ISmakBurned[]>('smak_burned', { params }),
  getSmakHolders: () => api.get<IHolders>('holders'),
  getTotalValueLocked: (params?: ISmartlinkIndexerParams) =>
    api.get<IAppTotalValueLocked[]>('total_value_locked', { params }),
}

export default SmakAPI
