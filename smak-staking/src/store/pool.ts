import { SwapContract } from '@/modules/contractInterfaces/swap'
import { TEZ_DECIMALS } from '@/constants'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import {
  tokenAddressToMetadata,
  IDexContractsState,
  defaultTokenMetadata,
} from '@/store/dexContracts'
import { formatError } from '@/store/swap'
import { InvestorPositionsEntry, DexIndexer } from '@/modules/dexIndexer'
import dexterCalculations from '@/modules/dexter-calculations'
const {
  xtzToTokenMarketRate,
  tokenToXtzMarketRate,
} = dexterCalculations

const { removeLiquidityTokenOut, removeLiquidityXtzOut } = dexterCalculations

interface IPoolConfig {
  slippage: number
  deadline: string
}

interface IPoolState {
  showRemoveLiquidityDialog: boolean
  showConfirmRemoveDialog: boolean
  removeAmount: string
  currentlyModifiedPool?: SwapContract
  config: IPoolConfig
  positions: Array<InvestorPositionsEntry>
}

interface IPoolActionContext {
  state: IPoolState
  commit: any
  rootState: any
  dispatch: any
  getters: any
  rootGetters: any
}


export function getTokenMetadata(poolState: IPoolState, dexContractsState: IDexContractsState): ITokenMetadata {
  if (poolState.currentlyModifiedPool) {
    return tokenAddressToMetadata(
      poolState.currentlyModifiedPool.storage.tokenAddress,
      poolState.currentlyModifiedPool.getTokenId(),
      dexContractsState
    )
  } else {
    return defaultTokenMetadata
  }
}

export function getXtzToTokenMarketRate(poolState: IPoolState, dexContractsState: IDexContractsState): string {
  if (poolState.currentlyModifiedPool) {
    const tokenDecimals = getTokenMetadata(poolState, dexContractsState).decimals
    const _tokenOut = xtzToTokenMarketRate(
      Number(poolState.currentlyModifiedPool.storage.xtzPool),
      Number(poolState.currentlyModifiedPool.storage.tokenPool),
      tokenDecimals
    )
    const tokenOut = _tokenOut ? Number(_tokenOut) : 0
    return tokenOut.toFixed(tokenDecimals)
  }
  return '0'
}

export function getTokenToXtzMarketRate(poolState: IPoolState, dexContractsState: IDexContractsState): string {
  if (poolState.currentlyModifiedPool) {
    const tokenDecimals = getTokenMetadata(poolState, dexContractsState).decimals
    const _xtzOut = tokenToXtzMarketRate(
      Number(poolState.currentlyModifiedPool.storage.xtzPool),
      Number(poolState.currentlyModifiedPool.storage.tokenPool),
      tokenDecimals
    )
    const xtzOut = _xtzOut ? Number(_xtzOut) : 0
    return xtzOut.toFixed(tokenDecimals)
  }
  return '0'
}


export function getTokenOut(lqtBurned: number, poolState: IPoolState, dexContractsState: IDexContractsState): string {
  if (poolState.currentlyModifiedPool) {
    const _tokenOut = removeLiquidityTokenOut(
      lqtBurned,
      Number(poolState.currentlyModifiedPool.storage.lqtTotal),
      Number(poolState.currentlyModifiedPool.storage.tokenPool)
    )
    const tokenOut = _tokenOut ? Number(_tokenOut) : 0
    const tokenDecimals = getTokenMetadata(poolState, dexContractsState).decimals
    return (tokenOut * 10 ** -tokenDecimals).toFixed(tokenDecimals)
  }
  return "0"
}

export function getXtzOut(lqtBurned: number, poolState: IPoolState, dexContractsState: IDexContractsState): string {
  if (poolState.currentlyModifiedPool) {
    const _xtzOut = removeLiquidityXtzOut(
      lqtBurned,
      Number(poolState.currentlyModifiedPool.storage.lqtTotal),
      Number(poolState.currentlyModifiedPool.storage.xtzPool)
    )
    const xtzOut = _xtzOut ? Number(_xtzOut) : 0
    return (xtzOut * 10 ** -TEZ_DECIMALS).toFixed(TEZ_DECIMALS)
  }
  return "0"
}

export const poolState = {
  namespaced: true,
  state: (): IPoolState => ({
    showRemoveLiquidityDialog: false,
    showConfirmRemoveDialog: false,
    removeAmount: '75',
    currentlyModifiedPool: undefined,
    config: {
      slippage: 0.005,
      deadline: '2029-09-06T15:08:29.000Z',
    },
    positions: [],
  }),
  mutations: {
    updateShowRemoveLiquidityDialog: (state: IPoolState, showDialog: boolean) =>
      (state.showRemoveLiquidityDialog = showDialog),
    updateShowConfirmRemoveDialog: (state: IPoolState, showDialog: boolean) =>
      (state.showConfirmRemoveDialog = showDialog),
    updateRemoveAmount: (state: IPoolState, removeAmount: string) =>
      (state.removeAmount = removeAmount),
    updateCurrentlyModifiedPool: (state: IPoolState, currentlyModifiedPool: SwapContract) =>
      (state.currentlyModifiedPool = currentlyModifiedPool),
    updatePositions: (state: IPoolState, newPositions: Array<InvestorPositionsEntry>) =>
      (state.positions = newPositions),
  },
  actions: {
    showRemoveLiquidityDialog: async ({ commit }: IPoolActionContext, swapContract: SwapContract) => {
      commit('updateShowRemoveLiquidityDialog', true)
      commit('updateCurrentlyModifiedPool', swapContract)
      await swapContract.reloadStorage()
    },
    fetchPositions: async ({ commit, rootState }: IPoolActionContext) => {
      if (rootState.wallet.isWalletConnected) {
        const indexer = new DexIndexer()
        const positions = await indexer.getInvestorPositions(rootState.wallet.userAddress)
        commit('updatePositions', positions)
      }
    },
    removeLiquidity: async ({
      state,
      commit,
      dispatch,
      rootState,
      getters,
      rootGetters,
    }: IPoolActionContext) => {
      if (state.currentlyModifiedPool) {
        const swap = rootState.dexContracts.swapContracts[state.currentlyModifiedPool.address]
        const lqtBurned = getters.lqtBurned
        const minXtzWithdrawn = Math.floor(
          Number(
            removeLiquidityXtzOut(
              lqtBurned,
              state.currentlyModifiedPool.storage.lqtTotal.toString(),
              state.currentlyModifiedPool.storage.xtzPool.toString()
            )
          ) * ((100 - rootState.swap.config.slippage) / 100)
        )
        const minTokensWithdrawn = Math.floor(
          Number(
            removeLiquidityTokenOut(
              lqtBurned,
              state.currentlyModifiedPool.storage.lqtTotal.toString(),
              state.currentlyModifiedPool.storage.tokenPool.toString()
            )
          ) * ((100 - rootState.swap.config.slippage) / 100)
        )
        try {
        const op = await state.currentlyModifiedPool.removeLiquidity(
          rootState.wallet.userAddress,
          lqtBurned,
          minXtzWithdrawn,
          minTokensWithdrawn,
          rootGetters['swap/deadline'](),
        )
        commit('updateShowRemoveLiquidityDialog', false)
        commit('notificationCenter/updateConfirming', true, { root: true })
        await op.confirmation(1)
        commit('notificationCenter/updateConfirming', false, { root: true })

        dispatch('swap/swapSuccess', {tokenAddresses: [swap.tokenContract.address], tokenIds: [swap.tokenContract.getTokenId()]}, { root: true })
        } catch (err) {
          console.warn(err)
          dispatch('notificationCenter/showError', formatError(err, 'swap'), { root: true })
        }
      }
    },
  },
  getters: {
    lqtBurned(state: IPoolState, getters: any, rootState: any): number {
      if (state.currentlyModifiedPool) {
        let lpBalance = 0
        const currentPositionInfo = state.positions.filter(position => position.pool_address == state.currentlyModifiedPool?.address)
        if (currentPositionInfo.length) {
          lpBalance = currentPositionInfo[0].lp_qty * 10 ** 6
        }
        return Math.floor((lpBalance * Number(state.removeAmount)) / 100)
      }

      return 0
    },
  },
}
