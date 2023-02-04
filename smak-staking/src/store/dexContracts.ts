import { DexContract, dexContractFactory } from '@/modules/contractInterfaces/dex'
import { SwapContract } from '@/modules/contractInterfaces/swap'
import { FA12Contract, ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { swapContractFactory } from '@/modules/contractInterfaces/swap'
import { fa12ContractFactory, cleanIpfsLink } from '@/modules/contractInterfaces/FA12'
import { config } from '@/../config/config'
import { emptyMetadata } from '@/modules/contractInterfaces/FA12'
import { LpTokenContract, lpTokenContractFactory } from '@/modules/contractInterfaces/LpToken'
import { getXtzPooled } from '@/exchange_arithmetics'
import { IWalletState } from '@/store/wallet'
import { TimeSeries, TimeSeriesData } from '@/modules/timeSeries'
import { DexIndexer } from '@/modules/dexIndexer'
const placeholder = require("@/assets/token-placeholder.svg")
import pools_json from './pools_json'
import {
  SWAP_ADDRESS,
  TOKENS,
  TOKEN_METADATA,
  TOKEN_POOL_INFO,
} from '@/constants/tokens.const'
import { IPool } from '@/interfaces/smartlink.interface'

export interface ISwapContractsValue {
  swapContract: SwapContract
  tokenContract: FA12Contract
  balance: number
  lpTokenContract: LpTokenContract
  lpBalance: number
}
export interface ISwapContracts {
  [swapAddress: string]: ISwapContractsValue
}

export interface IDexContractsState {
  dexContract?: DexContract
  dexContractFA2?: DexContract
  swapContracts: ISwapContracts
  tokenAddressToSwapContractAddress: { [address: string]: { [tokenId: number]: string } }
  areContractsLoaded: boolean
  xtzPriceHistory: TimeSeries
  indexer: DexIndexer
}

interface IDexContractsActionContext {
  state: IDexContractsState
  commit: any
  rootState: any
  dispatch: any
  rootGetters: any
}

export function tokenAddressToSwapContract(
  tokenAddress: string,
  tokenId: number,
  state: IDexContractsState
) {
  return state.swapContracts[state.tokenAddressToSwapContractAddress[tokenAddress][tokenId]]
    .swapContract
}

export function swapAddressToTokenAddress(swapAddress: string, state: IDexContractsState) {
  return state.swapContracts[swapAddress].tokenContract.address
}

export function swapAddressToTokenId(swapAddress: string, state: IDexContractsState) {
  return state.swapContracts[swapAddress].tokenContract.getTokenId()
}

export function tokenAddressToTokenContract(
  tokenAddress: string,
  tokenId: number,
  state: IDexContractsState
) {
  return state.swapContracts[state.tokenAddressToSwapContractAddress[tokenAddress][tokenId]]
    .tokenContract
}

export function tokenAddressToLiquidityContract(
  tokenAddress: string,
  tokenId: number,
  state: IDexContractsState
) {
  return state.swapContracts[state.tokenAddressToSwapContractAddress[tokenAddress][tokenId]]
    .lpTokenContract
}

export function getUserBalanceForToken(
  tokenAddress: string,
  tokenId: number,
  state: IDexContractsState,
  walletState: IWalletState
) {
  if (tokenAddress == 'XTZ') return walletState.balance

  const swapContractAddress = state.tokenAddressToSwapContractAddress[tokenAddress][tokenId]
  return state.swapContracts[swapContractAddress].balance
}

export const xtzMetadata: ITokenMetadata = {
  decimals: 6,
  symbol: 'XTZ',
  name: 'Tezos',
  thumbnailUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png',
}

export const defaultTokenMetadata: ITokenMetadata = {
  decimals: 0,
  symbol: '',
  name: '',
  thumbnailUri: placeholder,
}

export function tokenAddressToMetadata(
  tokenAddress: string,
  tokenId: number,
  state: IDexContractsState
) {
  if (!tokenAddress) {
    return emptyMetadata
  }
  if (tokenAddress == 'XTZ') {
    return xtzMetadata
  }

  if (TOKEN_METADATA[tokenAddress] && TOKEN_METADATA[tokenAddress][tokenId]) {
    return TOKEN_METADATA[tokenAddress][tokenId].metadata
  }

  const swapContractAddress = state.tokenAddressToSwapContractAddress[tokenAddress][tokenId]
  return state.swapContracts[swapContractAddress].tokenContract.metadata
}

export const dexContractsState = {
  namespaced: true,
  state: (): IDexContractsState => ({
    dexContract: undefined,
    dexContractFA2: undefined,
    swapContracts: {},
    tokenAddressToSwapContractAddress: {},
    areContractsLoaded: false,
    xtzPriceHistory: new TimeSeries(),
    indexer: new DexIndexer(),
  }),
  mutations: {
    updateXtzPriceHistory(state: IDexContractsState, xtzPriceHistory: TimeSeries) {
      state.xtzPriceHistory = xtzPriceHistory
    },
    updateTokenAddressToSwapContratAddress: (
      state: IDexContractsState,
      tokenAddressToSwapContractAddress: { [address: string]: { [tokenId: number]: string } }
    ) => (state.tokenAddressToSwapContractAddress = tokenAddressToSwapContractAddress),
    updateSwapContracts: (state: IDexContractsState, swapContracts: ISwapContracts) =>
      (state.swapContracts = {
        ...state.swapContracts,
        ...swapContracts,
      }),
    updateDexContract: (state: IDexContractsState, dexContract: DexContract) =>
      (state.dexContract = dexContract),
    updateDexContractFA2: (state: IDexContractsState, dexContractFA2: DexContract) =>
      (state.dexContractFA2 = dexContractFA2),
    updateAreContractsLoaded: (state: IDexContractsState, areContractsLoaded: boolean) => {
      state.areContractsLoaded = areContractsLoaded
    },
  },
  actions: {
    resetBalances: ({ commit, state }: IDexContractsActionContext) => {
      const newSwapContracts: ISwapContracts = {}
      for (const swapContractAddress of Object.keys(state.swapContracts)) {
        newSwapContracts[swapContractAddress] = {
          ...state.swapContracts[swapContractAddress],
          balance: 0,
        }
      }
      commit('updateSwapContracts', newSwapContracts)
    },
    reloadBalanceForToken: async (
      { commit, state, rootState }: IDexContractsActionContext,
      { tokenAddress, tokenId }: { tokenAddress: string; tokenId: number }
    ) => {
      if (rootState.wallet.userAddress) {
        const newSwapContracts = {
          ...state.swapContracts,
        }
        const swapContractAddress = tokenAddressToSwapContract(tokenAddress, tokenId, state).address
        const tokenContract = tokenAddressToTokenContract(tokenAddress, tokenId, state)
        newSwapContracts[swapContractAddress] = {
          ...state.swapContracts[swapContractAddress],
          balance: Number(await tokenContract.getUserBalance(rootState.wallet.userAddress)),
        }

        commit('updateSwapContracts', newSwapContracts)
      }
    },
    reloadBalances: async ({ commit, state, rootState }: IDexContractsActionContext) => {
      if (rootState.wallet.userAddress) {
        const swapContractsPromise = Object.keys(state.swapContracts).map(
          async (swapContractAddress) => {
            const { tokenContract } = state.swapContracts[swapContractAddress]
            return {
              ...state.swapContracts[swapContractAddress],
              balance: Number(await tokenContract.getUserBalance(rootState.wallet.userAddress)),
            }
          }
        )

        const swapContracts = await Promise.all(swapContractsPromise)

        const newSwapContracts: ISwapContracts = swapContracts.reduce((acc: any, cur) => {
          const { address } = cur.swapContract
          acc[address] = cur

          return acc
        }, {})

        commit('updateSwapContracts', newSwapContracts)
      }
    },
    addToken: async (
      { commit, state }: IDexContractsActionContext,
      swapInfo: ISwapContractsValue
    ) => {
      const newSwapContracts = {
        ...state.swapContracts,
        [swapInfo.swapContract.address]: swapInfo,
      }
      commit('updateSwapContracts', newSwapContracts)
      const newTokenAddressToSwapContractAddress = {
        ...state.tokenAddressToSwapContractAddress,
      }
      if (typeof newTokenAddressToSwapContractAddress[swapInfo.tokenContract.address] == 'object') {
        newTokenAddressToSwapContractAddress[swapInfo.tokenContract.address][
          swapInfo.tokenContract.getTokenId()
        ] = swapInfo.swapContract.address
      } else {
        newTokenAddressToSwapContractAddress[swapInfo.tokenContract.address] = {
          [swapInfo.tokenContract.getTokenId()]: swapInfo.swapContract.address,
        }
      }
      commit('updateTokenAddressToSwapContratAddress', newTokenAddressToSwapContractAddress)
    },
    updateXtzPriceHistory: async ({ commit, state }: IDexContractsActionContext) => {
      const indexer = state.indexer
      const priceHistory = await indexer.getXtzToUsdPrice()

      const xtzToUsdPriceHistory = new TimeSeries()
      for (const { time, value } of priceHistory.resample()) {
        const usdTvlEntry = new TimeSeriesData(
          new Date(time).toISOString().slice(0, -5) + 'Z',
          value
        )
        xtzToUsdPriceHistory.addData(usdTvlEntry)
      }

      commit('updateXtzPriceHistory', xtzToUsdPriceHistory)
    },
    loadTokenContractData: async (
      { commit, state, dispatch, rootState }: IDexContractsActionContext,
      { tokenAddresses, tokenIds }: { tokenAddresses: string[]; tokenIds: number[] }
    ) => {
      const swapContracts = {
        ...state.swapContracts,
      }

      let counter = 0
      const isDone = async () => {
        if (counter == tokenAddresses.length - 1) {
          commit('updateSwapContracts', swapContracts)
          await dispatch('updateXtzPriceHistory')
        }
        counter += 1
      }
      for (const _i in tokenAddresses) {
        const i = Number(_i)
        const tokenAddress = tokenAddresses[i]
        const tokenId = tokenIds[i]
        setTimeout(async () => {
          const swapContractAddress = state.tokenAddressToSwapContractAddress[tokenAddress][tokenId]
          const swapContract = swapContractFactory(swapContractAddress, rootState.wallet.tk)
          const tokenContract = tokenAddressToTokenContract(
            swapContract.storage.tokenAddress,
            tokenId,
            state
          )
          const lpTokenContract = await lpTokenContractFactory(
            swapContract.storage.lqtAddress,
            rootState.wallet.tk
          )

          const [balance, lpBalance] = await Promise.all([
            tokenContract.getUserBalance(rootState.wallet.userAddress),
            lpTokenContract.getUserBalance(rootState.wallet.userAddress),
          ])

          swapContracts[swapContractAddress] = {
            swapContract,
            tokenContract,
            balance: +balance,
            lpTokenContract,
            lpBalance: +lpBalance,
          }
          await isDone()
        }, 0)
      }
    },
    loadDexContractData: async ({
      commit,
      state,
      rootState,
      dispatch,
    }: IDexContractsActionContext) => {
      const [dexContract, dexContractFA2] = await Promise.all([
        dexContractFactory(config.DEX_SMART_CONTRACT_ADDRESS, rootState.wallet.tk),
        dexContractFactory(config.DEX_FA2_SMART_CONTRACT_ADDRESS, rootState.wallet.tk),
      ])
      commit('updateDexContract', dexContract)
      commit('updateDexContractFA2', dexContractFA2)

      const [swapAddressesFA12, swapAddressesFA2] = await Promise.all([
        state.dexContract?.getSwapAddresses() || [],
        state.dexContractFA2?.getSwapAddresses() || [],
      ])

      const swapContracts: ISwapContracts = {
        ...state.swapContracts,
      }
      const swapAddresses = swapAddressesFA12
        .concat(swapAddressesFA2)
        .filter((address: string) => address !== SWAP_ADDRESS.XTZ_SMAK)

      let counter = 0
      const isDone = async () => {
        if (counter == swapAddresses.length - 1) {
          commit('updateSwapContracts', swapContracts)

          const tokenAddressToSwapContractAddress = Object.keys(swapContracts).reduce(
            (acc: any, swapContractAddress: string) => {
              const tokenAddress = swapContracts[swapContractAddress].tokenContract.address
              const tokenId = swapContracts[swapContractAddress].tokenContract.getTokenId()
              if (typeof acc[tokenAddress] == 'object') {
                acc[tokenAddress][tokenId] = swapContractAddress
              } else {
                acc[tokenAddress] = { [tokenId]: swapContractAddress }
              }
              return acc
            },
            {}
          )
          commit('updateTokenAddressToSwapContratAddress', tokenAddressToSwapContractAddress)

          commit('updateAreContractsLoaded', true)
          if (Object.keys(swapContracts).length) {
            const smakAddress = 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X'
            const swapAddress = Object.keys(swapContracts)[0]

            const isDevelopment = process.env.NODE_ENV === 'development'
            const tokenAddress = isDevelopment
              ? swapContracts[swapAddress].tokenContract.address
              : smakAddress
            const tokenId = isDevelopment
              ? swapContracts[swapAddress].tokenContract.getTokenId()
              : 0

            await dispatch(
              'swap/updateTokenAddress',
              { whichToken: 'tokenA', address: 'XTZ', tokenId },
              { root: true }
            )
            await dispatch(
              'swap/updateTokenAddress',
              { whichToken: 'tokenB', address: tokenAddress, tokenId },
              { root: true }
            )
          }

          await dispatch('reloadBalances')
          await dispatch('updateXtzPriceHistory')
        }
        counter += 1
      }

      const pools = await state.indexer.getPools()
      const getCachedMetadataFromTokenAddress = (
        tokenAddress: string,
        tokenId: number
      ): ITokenMetadata | undefined => {
        const filtered = pools.filter(
          (e) => e.token_address == tokenAddress && e.token_id == tokenId
        )
        if (filtered.length) {
          const el = filtered[0]
          return {
            decimals: el.decimals,
            name: el.name,
            symbol: el.symbol,
            thumbnailUri: cleanIpfsLink(el.icon),
          }
        } else {
          return undefined
        }
      }

      interface CachedSwapInfo {
        tokenAddress: string
        lqtAddress: string
        tokenId?: number
      }
      const getCachedTokensFromSwapAddress = (swapAddress: string): CachedSwapInfo | undefined => {
        const filtered = pools.filter((e) => e.pool_address == swapAddress)
        if (filtered.length) {
          const el = filtered[0]
          return {
            tokenAddress: el.token_address,
            lqtAddress: el.lqt_address,
            tokenId: el.contract_format == 'FA2' ? el.token_id : undefined,
          }
        } else {
          return undefined
        }
      }

      const requestsAddress = Object.values(swapAddresses).map(async (swapAddress: any, index) => {
        const swapContract = swapContractFactory(swapAddress, rootState.wallet.tk)

        const cachedSwapInfo = getCachedTokensFromSwapAddress(swapAddress)
        let tokenAddress = ''
        let lqtAddress = ''
        let tokenId = undefined
        if (!cachedSwapInfo) {
          await swapContract.reloadStorage()
          tokenAddress = swapContract.storage.tokenAddress
          lqtAddress = swapContract.storage.lqtAddress
          tokenId = index > swapAddressesFA12.length - 1 ? swapContract.storage.tokenId : undefined
        } else {
          tokenAddress = cachedSwapInfo.tokenAddress
          lqtAddress = cachedSwapInfo.lqtAddress
          tokenId = cachedSwapInfo.tokenId
        }

        const [tokenContract, lpTokenContract] = await Promise.all([
          fa12ContractFactory(
            tokenAddress,
            rootState.wallet.tk,
            tokenId,
            getCachedMetadataFromTokenAddress(tokenAddress, tokenId ? tokenId : 0)
          ),
          lpTokenContractFactory(lqtAddress, rootState.wallet.tk),
        ])

        swapContracts[swapAddress] = {
          swapContract,
          tokenContract,
          balance: 0,
          lpTokenContract,
          lpBalance: 0,
        }

        await isDone()
      })

      await Promise.all(requestsAddress)

      if (!swapAddresses.length) {
        commit('updateAreContractsLoaded', true)
      }
    },
    loadSmakDexContractData: async ({
      commit,
      rootState,
      state,
      dispatch,
      rootGetters,
    }: IDexContractsActionContext) => {
      const smakPoolAddress = SWAP_ADDRESS.XTZ_SMAK

      const swapContract = swapContractFactory(smakPoolAddress, rootState.wallet.tk)
      const { tokenAddress, tokenId, poolAddress } =
        TOKEN_POOL_INFO[TOKENS.SMAK.address][TOKENS.SMAK.tokenId]
      const smakPool: IPool = rootGetters['pools/pools'][poolAddress]
      const smakMetadata = TOKEN_METADATA[TOKENS.SMAK.address][TOKENS.SMAK.tokenId]

      const [tokenContract, lpTokenContract] = await Promise.all([
        fa12ContractFactory(
          tokenAddress,
          rootState.wallet.tk,
          tokenId || undefined,
          smakMetadata.metadata
        ),
        lpTokenContractFactory(smakPool.lqt_address, rootState.wallet.tk),
      ])

      commit('updateSwapContracts', {
        ...state.swapContracts,
        [smakPoolAddress]: {
          swapContract,
          tokenContract,
          balance: 0,
          lpTokenContract,
          lpBalance: 0,
        },
      })

      commit('updateTokenAddressToSwapContratAddress', {
        ...state.tokenAddressToSwapContractAddress,
        [TOKENS.SMAK.address]: {
          [TOKENS.SMAK.tokenId]: smakPoolAddress,
        },
      })

      await Promise.all([
        dispatch(
          'swap/updateTokenAddress',
          { whichToken: 'tokenA', address: TOKENS.XTZ.address, tokenId: TOKENS.XTZ.tokenId },
          { root: true }
        ),
        dispatch(
          'swap/updateTokenAddress',
          { whichToken: 'tokenB', address: TOKENS.SMAK.address, tokenId: TOKENS.SMAK.tokenId },
          { root: true }
        ),
      ])
    },
  },
}
