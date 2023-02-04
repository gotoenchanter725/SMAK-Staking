import FarmsAPI from '@/apis/farms.api'
import { IFarm } from '@/interfaces/smartlink.interface'
import { SmartContract } from "@/modules/smartContract";

const MODULE_STATE = {
  isFarmStakeShown: false,
  isFarmUnstakeShown: false,
  isFarmHarvestShown: false,
  isFarmRoiShown: false,
  isFarmStakeSmakShown: false,
  farms: [] as IFarm[],
  farmAddress: "",
  lpAddress: "",
  farmList: new Array<IFarm>(),
  tokenMap: new Map<string,any>()
}

export const farms = {
  namespaced: true,
  state: () => MODULE_STATE,
  getters: {
    isFarmStakeShown: ({ isFarmStakeShown }: typeof MODULE_STATE) => isFarmStakeShown,
    isFarmUnstakeShown: ({ isFarmUnstakeShown }: typeof MODULE_STATE) => isFarmUnstakeShown,
    isFarmHarvestShown: ({ isFarmHarvestShown }: typeof MODULE_STATE) => isFarmHarvestShown,
    isFarmRoiShown: ({ isFarmRoiShown }: typeof MODULE_STATE) => isFarmRoiShown,
    isFarmStakeSmakShown: ({ isFarmStakeSmakShown }: typeof MODULE_STATE) => isFarmStakeSmakShown,
    farms: ({ farms }: typeof MODULE_STATE) => farms,
    farmsTvlUsd: ({ farms }: typeof MODULE_STATE) =>
      farms.reduce((acc, cur) => {
        acc += cur.tvl_usd
        return acc
      }, 0),
  },
  mutations: {
    updateTokenMap(state: typeof MODULE_STATE, newToken: Map<string,any> ) {
      state.tokenMap = newToken
    },
    updateFarms(state: typeof MODULE_STATE, newFarm: IFarm[]) {
      state.farmList = newFarm
    },
    updateFarmAddress(state: typeof MODULE_STATE, newAddFarm: string) {
      state.farmAddress = newAddFarm;
    },
    updateLpAddress(state: typeof MODULE_STATE, newAddLp: string) {
      state.lpAddress = newAddLp;
    },
    showFarmStakeDialog(state: typeof MODULE_STATE) {
      state.isFarmStakeShown = true
    },
    closeFarmStakeDialog(state: typeof MODULE_STATE) {
      state.isFarmStakeShown = false
    },
    showFarmUnstakeDialog(state: typeof MODULE_STATE) {
      state.isFarmUnstakeShown = true
    },
    closeFarmUnstakeDialog(state: typeof MODULE_STATE) {
      state.isFarmUnstakeShown = false
    },
    showFarmHarvestDialog(state: typeof MODULE_STATE) {
      state.isFarmHarvestShown = true
    },
    closeFarmHarvestDialog(state: typeof MODULE_STATE) {
      state.isFarmHarvestShown = false
    },
    showFarmRoiDialog(state: typeof MODULE_STATE) {
      state.isFarmRoiShown = true
    },
    closeFarmRoiDialog(state: typeof MODULE_STATE) {
      state.isFarmRoiShown = false
    },
    showFarmStakeSmakDialog(state: typeof MODULE_STATE) {
      state.isFarmStakeSmakShown = true
    },
    closeFarmStakeSmakDialog(state: typeof MODULE_STATE) {
      state.isFarmStakeSmakShown = false
    },
    setFarms(state: typeof MODULE_STATE, farms: IFarm[]) {
      state.farms = farms
    },
  },
  actions : {
    getFarms: async (context: any) => {
      const farms = await FarmsAPI.getFarms()
      context.commit('setFarms', farms)
  
      return farms
    },
    async stake({state }: any, {amount, tk}: any) {
      const stakingSmartContract = new SmartContract(state.farmAddress, tk)
      const cToken = await tk.wallet.at(state.lpAddress)
      const batch = await stakingSmartContract.stake(
              await stakingSmartContract.getContract(),
              cToken,
              Number(amount) * 10**6
            )
      await stakingSmartContract
            .sendBatch(batch)
    },

    async harvest({state }: any, { tk }: any) {
      (await tk.wallet.at(state.farmAddress)).methods.claimAll([["unit"]]).send()
    },
    async unstake({state }: any, {amount, tk}: any) {
      (await tk.wallet.at(state.farmAddress)).methods.unstake(amount*10**6).send()
    },
    async query({state }: any, url: string) {
      let result;
      const response = await fetch(url, {
          "method": "GET"
      })
      if (response.ok) {
          result = await response.json()
      }
      else throw new Error('The data cannot be retrieved.')
      return result;
    },
    async setTokens({dispatch, state, commit }: any): Promise<void> {
      const tokenMap = new Map()
      const tokens = await dispatch("query", "https://smartlink-indexer-api.deployments.smart-chain.fr/v1/pools")
      for (const token of tokens) {
        const formattedToken = {
          address: token.token_address,
          metadata: {
            decimals: token.decimals,
            symbol: token.symbol,
            name: token.name,
            thumbnailUri: token.icon,
            lastXtzPrice: token.last_price_xtz,
            lastUsdPrice: token.last_price_usd,
            tokenAddress: token.token_address,
            tokenId: token.token_id,
            lpUsd: token.lp_usd
          },
        }
        tokenMap.set(token.symbol, formattedToken)
      }
      commit("updateTokenMap", tokenMap)
    },
  }
}