import InvestorAPI from '@/apis/investor.api'
import { ISmakStake } from '@/interfaces/smartlink.interface'

const MODULE_STATE = {
  smakStakeFlex: [] as ISmakStake[],
  smakStakeLock: [] as ISmakStake[],
}

export const staking = {
  namespaced: true,
  state: () => MODULE_STATE,
  getters: {},
  mutations: {
    setSmakStakeFlex: (state: typeof MODULE_STATE, smakStakeFlex: ISmakStake[]) => {
      state.smakStakeFlex = smakStakeFlex
    },
    setSmakStakeLock: (state: typeof MODULE_STATE, smakStakeLock: ISmakStake[]) => {
      state.smakStakeLock = smakStakeLock
    },
  },
  actions: {
    getSmakStakeFlex: async (context: any) => {
      if (!context.rootState.wallet.userAddress) await context.dispatch('wallet/loadWallet')

      const smakStakeFlex = await InvestorAPI.getInvestorStakeFlex(
        context.rootState.wallet.userAddress
      )
      context.commit('setSmakStakeFlex', smakStakeFlex)
    },
    getSmakStakeLock: async (context: any) => {
      if (!context.rootState.wallet.userAddress) await context.dispatch('wallet/loadWallet')

      const smakStakeLock = await InvestorAPI.getInvestorStakeLock(
        context.rootState.wallet.userAddress
      )
      context.commit('setSmakStakeLock', smakStakeLock)
    },
  },
}
