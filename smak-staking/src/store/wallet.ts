import { TezosToolkit } from '@taquito/taquito'
import { config } from '../../config/config'

import { WalletBeacon } from '@/modules/wallets/beaconWallet'
import { SmartContract } from '@/modules/smartContract'
import { tzktCommunication } from '@/modules/tzktCommunication'
import { Tzip16Module } from '@taquito/tzip16';
import { Tzip12Module } from '@taquito/tzip12';
import { USER_ADDRESS_KEY } from '@/constants/keys.const'

const tzkt = new tzktCommunication()
const tk = new TezosToolkit(config.RPC_ADDRESS)
tk.addExtension(new Tzip12Module() as any)
tk.addExtension(new Tzip16Module() as any)

class LambdaViewSigner {
  // src: https://github.com/madfish-solutions/quipuswap-webapp/blob/735f250fe35e7f68de2435faac078b7433005279/src/core/lambda-view.ts
  async publicKeyHash() {
    return 'tz1fVQangAfb9J1hRRMP2bSB6LvASD6KpY8A'
  }

  async publicKey() {
    return 'edpkvWbk81uh1DEvdWKR4g1bjyTGhdu1mDvznPUFE2zDwNsLXrEb9K'
  }

  async secretKey(): Promise<string> {
    throw new Error('Secret key cannot be exposed')
  }

  async sign(): Promise<{
    bytes: string
    sig: string
    prefixSig: string
    sbytes: string
  }> {
    throw new Error('Cannot sign')
  }
}

tk.setSignerProvider(new LambdaViewSigner())

export interface IWalletState {
  smakPrice: number
  smakVar: number
  isWalletConnected: boolean
  showConnectedWallet: boolean
  beaconWallet: WalletBeacon
  walletType: string
  userAddress: string
  balance: number // XTZ balance
  userBalance: number // Smak balance
  tzkt: tzktCommunication
  tk: TezosToolkit
  tokenSmartContract: SmartContract
}

interface IWalletActionContext {
  state: IWalletState
  commit: any
  rootState: any
  dispatch: any
  getters: any
}

export const walletState = {
  namespaced: true,
  state: (): IWalletState => ({
    smakPrice: 0,
    smakVar: 0,
    isWalletConnected: false,
    showConnectedWallet: false,
    userAddress: localStorage.getItem(USER_ADDRESS_KEY) || '',
    walletType: '',
    userBalance: 0,
    balance: 0,
    beaconWallet: new WalletBeacon(tk),
    tzkt,
    tk,
    tokenSmartContract: new SmartContract(config.CONTRACT_FA12TOKEN_CONTRACT_ADDRESS, tk),
  }),
  mutations: {
    updateSmakPrice: (state: IWalletState, smakPrice: number): number =>
      (state.smakPrice = smakPrice),
    updateSmakVar: (state: IWalletState, smakVar: number): number => (state.smakVar = smakVar),
    updateIsWalletConnected: (state: IWalletState, isConnected: boolean): boolean =>
      (state.isWalletConnected = isConnected),
    updateShowConnectedWallet: (state: IWalletState, showConnectedWallet: boolean): boolean =>
      (state.showConnectedWallet = showConnectedWallet),
    updateUserAddress: (state: IWalletState, userAddress: string): void => {
      state.userAddress = userAddress
      localStorage.setItem(USER_ADDRESS_KEY, userAddress)
    },
    updateBalance: (state: IWalletState, balance: number) => (state.balance = balance),
    updateUserBalance: (state: IWalletState, userBalance: number): number =>
      (state.userBalance = userBalance),
    updateWalletType: (state: IWalletState, walletType: string): string =>
      (state.walletType = walletType),
  },
  actions: {
    async updateSmakPrice({ commit }: any) {
      const price = await tzkt.computeSMAKPrice()
      commit('updateSmakPrice', price)
    },
    async updateSmakVar({ commit }: any) {
      const svar = Number((await tzkt.computeTokenVar()).value)
      commit('updateSmakVar', svar)
    },
    async loadWallet({ state, commit, dispatch, getters }: any): Promise<boolean> {
      await dispatch('setWalletProviderConnected')
      if (state.isWalletConnected) {
        commit('updateWalletType', 'beacon')
        state.tk.setWalletProvider(getters.walletInUse.getWallet())

        commit('updateUserAddress', await getters.walletInUse.getWalletAddress())
        commit('updateUserBalance', await state.tokenSmartContract.getBalance(state.userAddress))
        await dispatch('updateBalance')
        return true
      }

      return false
    },
    /**
     * Function that checks if there is a connected wallet provider
     */
    async setWalletProviderConnected({ state, commit }: any): Promise<boolean> {
      const isBeaconConnected = await state.beaconWallet.isConnected()

      const isConnected = isBeaconConnected
      commit('updateIsWalletConnected', isConnected)

      return isConnected
    },
    updateBalance: async ({ commit, state }: IWalletActionContext) => {
      const balance = Number(await state.tk.tz.getBalance(state.userAddress))
      commit('updateBalance', balance)
    },
    updateUserBalance: async ({ commit, state }: IWalletActionContext) => {
      const balance = Number(await state.tokenSmartContract.getBalance(state.userAddress))
      commit('updateBalance', balance)
    },
    connectWallet: async (
      { commit, dispatch, getters }: IWalletActionContext,
      wallet = 'beacon'
    ) => {
      console.log('connectWallet')
      commit('updateWalletType', wallet)

      await getters.walletInUse.setupWallet().then(() => dispatch('loadWallet'))

      await dispatch('dexContracts/reloadBalances', null, { root: true })
    },
  },
  getters: {
    walletInUse(state: IWalletState): WalletBeacon {
      return state.beaconWallet
    },
  },
}
