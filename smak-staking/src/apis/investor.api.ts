import { ISmartlinkIndexerParams } from '@/interfaces/smartlink.interface'
import http from './http'

const baseURL = 'https://smartlink-indexer-api.deployments.smart-chain.fr/v1'
const endpoint = 'investor'
const api = http(baseURL)

const InvestorAPI = {
  getInvestorStakeFlex: (investorAddress: string) =>
    api.get(`${endpoint}/${investorAddress}/smak_stake_flex`),
  getInvestorStakeLock: (investorAddress: string) =>
    api.get(`${endpoint}/${investorAddress}/smak_stake_lock`),
  getTotalStakingProgram: (params?: ISmartlinkIndexerParams) =>
    api.get(`${endpoint}/total_stake`, { params }),
}

export default InvestorAPI
