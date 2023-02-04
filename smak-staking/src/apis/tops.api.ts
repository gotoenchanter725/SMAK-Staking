import { ITopPool, ITopToken } from '@/interfaces/smartlink.interface'
import http from './http'

const baseURL = 'https://smartlink-indexer-api.deployments.smart-chain.fr/v1'
const api = http(baseURL)
const endpoint = 'top'

const TopsAPI = {
  getTopPoolsByFees: () => api.get(`${endpoint}/pools_by_fees`),
  getTopPools: () => api.get<ITopPool[]>(`${endpoint}/pools`),
  getTopTokens: () => api.get<ITopToken[]>(`${endpoint}/tokens`),
}

export default TopsAPI
