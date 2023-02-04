import { IFarm } from '@/interfaces/smartlink.interface'
import http from './http'

const baseURL = 'https://smartlink-indexer-api.deployments.smart-chain.fr/v1'
const api = http(baseURL)
const endpoint = 'farms'

const FarmsAPI = {
  getFarms: () => api.get<IFarm[]>(endpoint),
}

export default FarmsAPI
