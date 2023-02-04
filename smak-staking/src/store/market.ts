import { TezosToolkit } from '@taquito/taquito'
import { SmartContract } from '@/modules/smartContract'

import { config } from '../../config/config'
import { DexIndexer } from '@/modules/dexIndexer'

export interface IMarketState {
  circulatingSupply: number
  fullyDillutedSupply: number
  burnedSmak: number
  tk: TezosToolkit
  tokenSmartContract: SmartContract
}

const tk = new TezosToolkit(config.RPC_ADDRESS)

export const marketState = {
  namespaced: true,
  state: (): IMarketState => ({
    circulatingSupply: Number(config.CIRCULATING_SUPPLY),
    fullyDillutedSupply: Math.floor(Number(config.TOTAL_SUPPLY) / 1000),
    burnedSmak: 0,
    tk,
    tokenSmartContract: new SmartContract(config.CONTRACT_FA12TOKEN_CONTRACT_ADDRESS, tk),
  }),
  mutations: {
    updateBurnedSmak: (state: IMarketState, burnedSmak: number): number =>
      (state.burnedSmak = burnedSmak),
  },
  actions: {
    async updateBurnedSmak({ commit, state }: any) {
      const indexer = new DexIndexer()
      const smakBurned = await indexer.getSmakBurned()
      commit('updateBurnedSmak', smakBurned[smakBurned.length - 1].burned)
    },
  },
}
