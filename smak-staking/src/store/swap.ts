import {
  IDexContractsState,
  tokenAddressToSwapContract,
  tokenAddressToTokenContract,
  tokenAddressToLiquidityContract,
} from '@/store/dexContracts'
import { TEZ_DECIMALS } from '@/constants'
import {
  xtzToTokenForward,
  tokenToXtzForward,
  tokenToTokenForward,
  xtzToTokenBackward,
  tokenToXtzBackward,
  tokenToTokenBackward,
} from '@/exchange_arithmetics'
import { DexIndexer } from '@/modules/dexIndexer'
import { Graph } from '@/modules/timeSeriesGraph'
import { TimeSeries } from '@/modules/timeSeries'
import { tokenAddressToMetadata } from '@/store/dexContracts'
import dexterCalculations from '@/modules/dexter-calculations'
import dayjs from 'dayjs'
import { fa12ContractFactory, ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { swapContractFactory } from '@/modules/contractInterfaces/swap'
import { lpTokenContractFactory } from '@/modules/contractInterfaces/LpToken'
import { ISwapContractsValue } from './dexContracts'
import { InvestorPositionsEntry } from '../modules/dexIndexer'
import _ from 'lodash'

const {
  xtzToTokenTokenOutput,
  xtzToTokenXtzInput,
  tokenToXtzTokenInput,
  tokenToXtzXtzOutput,
  tokenToTokenTokenInput,
  tokenToTokenTokenOutput,
  addLiquidityXtzIn,
  addLiquidityTokenIn,
  addLiquidityLiquidityCreated,
  xtzToTokenPriceImpact,
  tokenToXtzPriceImpact,
  tokenToTokenPriceImpact,
  xtzToTokenMarketRate,
  tokenToXtzMarketRate,
} = dexterCalculations

export interface ISwapTokenInfo {
  amount: string
  address: string
  tokenId: number
}

interface ISwapErrors {
  swapAmountA: string
  swapAmountB: string
}
export interface ISwapConfig {
  slippage: number
  deadlineDelta: string // minutes
  customSlippage: string
}

export interface IAddLiquiditySuccessModal {
  show: boolean
  tokenAddress: string
  tokenId: number
  liquidityCreated: number
  xtzIn: number
  tokenIn: number
  liquidityTokenAddress: string
  tokenMetadata?: ITokenMetadata
  poolAddress?: string
}

type ICurrentTokenModified = 'tokenA' | 'tokenB'
type DexAction = 'swap' | 'send' | 'liquidity'
export type FaMode = 'FA12' | 'FA2'
interface ISwapState {
  tokenA: ISwapTokenInfo
  tokenB: ISwapTokenInfo
  showWhitelistDialog: boolean
  whitelistDialogType: 'addToken' | 'swap'
  whitelistDialogTokenMetadata?: ITokenMetadata
  addLiquiditySuccessModal: IAddLiquiditySuccessModal
  priceImpact: number
  poolShare: string
  showTokenSelectionDialog: boolean
  showSwapConfirmationDialog: boolean
  showSwapConfigModal: boolean
  configSlippagePercentage: number
  currentTokenModified: ICurrentTokenModified
  errors: ISwapErrors
  config: ISwapConfig
  dexIndexer: DexIndexer
  dexAction: DexAction
  recipientAddress: string
  showSwapWhitelistTokenModal: boolean
  showLiquidityInfoDialog: boolean
  showAddNewTokenDialog: boolean
  selectedTokenMode: string
  addToken: {
    tokenAddress: string
    tokenId: string
    xtzAmount: string
    tokenAmount: string
    faMode: FaMode
  },
  isLoadable: boolean,
}

interface IUpdateTokenAddress {
  whichToken: ICurrentTokenModified
  address: string
  tokenId: number
}
interface IUpdateTokenAmount {
  whichToken: ICurrentTokenModified
  amount: string
}
interface IUpdateSwapAmountError {
  whichToken: ICurrentTokenModified
  message: string
}

interface ISwapActionContext {
  state: ISwapState
  commit: any
  rootState: any
  dispatch: any
  getters: any
}

function convertFactoryError(errorCode: number) {
  if (errorCode == 0) {
    return 'Contract has no transfer entrypoint'
  } else if (errorCode == 1) {
    return 'Set lqt_address does not exist'
  } else if (errorCode == 2) {
    return 'Self set_lqt_address does not exist'
  } else if (errorCode == 3) {
    return 'Contract already exists'
  }

  return undefined
}

function convertDexError(errorCode: number) {
  if (errorCode == 0) return 'Token contract must have a transfer entrypoint'
  else if (errorCode == 2) return 'Is updating token pool must be false'
  else if (errorCode == 3) return 'Deadline passed'
  else if (errorCode == 4) return 'Max tokens deposited too small'
  else if (errorCode == 5) return 'Lqt minted smaller than min_lqt_minted'
  else if (errorCode == 8) return 'XTZ bought smaller than min_xtz_bought'
  else if (errorCode == 9) return 'Invalid destination address'
  else if (errorCode == 10) return 'XTZ amount cannot zero'
  else if (errorCode == 11) return 'XTZ withdrawn smaller than min_xtz_withdrawn'
  else if (errorCode == 12) return 'Lqt contract does not have a mint_or_burn entrypoint'
  else if (errorCode == 13) return 'Tokens withdrawn smaller than min_tokens_withdrawn'
  else if (errorCode == 14) return 'Cannot burn more than the total amount of lqt'
  else if (errorCode == 15) return 'Token pool minus tokens withdrawn is negative'
  else if (errorCode == 18) return 'Tokens bought smaller than min_tokens_bought'
  else if (errorCode == 19) return 'Token pool minus tokens bought is negative'
  else if (errorCode == 20) return 'Only manager can set baker'
  else if (errorCode == 21) return 'Only manager can set manager'
  else if (errorCode == 22) return 'Baker permanently frozen'
  else if (errorCode == 23) return 'Only manager can set lqt address'
  else if (errorCode == 24) return 'Lqt address already set'
  else if (errorCode == 25) return 'Call not from an implicit account'
  else if (errorCode == 28) return 'Invalid token contract: missing balance_of'
  else if (errorCode == 29) return 'Entrypoint can only be called by get_balance_of_token_address'
  else if (errorCode == 31) return 'Invalid intermediat contract'
  else if (errorCode == 32) return 'Unexpected reentrance in update token pool'
  else if (errorCode == 40) return 'Only reserve can update reserve'

  return undefined
}

function getConvertErrorsFunction(contract: 'factory' | 'swap') {
  if (contract == 'factory') return convertFactoryError
  else if (contract == 'swap') return convertDexError
}

export function formatError(err: any, contract: 'factory' | 'swap'): string {
  if (err.data.length > 1) {
    if (err.data[1].with && err.data[1].with.int) {
      const errorCode = Number(err.data[1].with.int)
      const f = getConvertErrorsFunction(contract)
      if (f) {
        const errorString = f(errorCode)
        if (contract == 'factory' && errorString != undefined) return errorString
      }

      return err.data[1].id
    } else {
      return err.data[1].id
    }
  } else {
    return err.data[0].id
  }
}

function formatDate(date: Date): string {
  const dayjsDate = dayjs(date)
  return dayjsDate.format('MMM D, YYYY, h:mmA')
}

export function getPoolTokenMetadata(
  token: 'tokenA' | 'tokenB',
  swapState: ISwapState,
  dexContractsState: IDexContractsState
): ITokenMetadata {
  const tokenAddress = swapState[token].address
  const tokenId = swapState[token].tokenId
  return tokenAddressToMetadata(tokenAddress, tokenId, dexContractsState)
}

export function getPoolXtzToTokenMarketRate(
  swapState: ISwapState,
  dexContractsState: IDexContractsState
): string {
  if (swapState.tokenB.address) {
    const swapContract = tokenAddressToSwapContract(
      swapState.tokenB.address,
      swapState.tokenB.tokenId,
      dexContractsState
    )
    if(!swapContract.storage) return '0';
    const { decimals } = getPoolTokenMetadata('tokenB', swapState, dexContractsState)
    const rate = xtzToTokenMarketRate(
      String(swapContract.storage.xtzPool),
      String(swapContract.storage.tokenPool),
      decimals
    )
    return rate ? rate.toFixed(decimals) : '0'
  } else {
    return '0'
  }
}

export function getTokenToXtzMarketRate(
  swapState: ISwapState,
  dexContractsState: IDexContractsState
): string {
  if (swapState.tokenB.address) {
    const swapContract = tokenAddressToSwapContract(
      swapState.tokenB.address,
      swapState.tokenB.tokenId,
      dexContractsState
    )
    if(!swapContract.storage) return '0';
    const { decimals } = getPoolTokenMetadata('tokenB', swapState, dexContractsState)

    const rate = tokenToXtzMarketRate(
      String(swapContract.storage.xtzPool),
      String(swapContract.storage.tokenPool),
      decimals
    )
    return rate ? rate.toFixed(decimals) : '0'
  } else {
    return '0'
  }
}

const getOtherAddLiquidityAmount = (
  swapState: ISwapState,
  dexContractsState: IDexContractsState,
  tokenFrom: ICurrentTokenModified
): number => {
  const xtzPool = tokenAddressToSwapContract(
    swapState.tokenB.address,
    swapState.tokenB.tokenId,
    dexContractsState
  ).storage.xtzPool.toString()
  const tokenPool = tokenAddressToSwapContract(
    swapState.tokenB.address,
    swapState.tokenB.tokenId,
    dexContractsState
  ).storage.tokenPool.toString()
  if (tokenFrom == 'tokenB') {
    const tokenContract = tokenAddressToTokenContract(
      swapState.tokenB.address,
      swapState.tokenB.tokenId,
      dexContractsState
    )
    const tokenIn = Number(swapState.tokenB.amount) * Math.pow(10, tokenContract.metadata.decimals)
    const xtzIn = addLiquidityXtzIn(tokenIn, xtzPool, tokenPool)
    return xtzIn ? Number(xtzIn) : 0
  } else {
    const xtzIn = Number(swapState.tokenA.amount) * Math.pow(10, TEZ_DECIMALS)
    const tokenIn = addLiquidityTokenIn(xtzIn, xtzPool, tokenPool)
    return tokenIn ? Number(tokenIn) : 0
  }
}

const getPriceImpact = async (swapState: ISwapState, dexContractsState: IDexContractsState) => {
  const swapContractAddresses = []
  for (const address in dexContractsState.swapContracts) {
    swapContractAddresses.push(
      dexContractsState.swapContracts[address].swapContract.storage.tokenAddress
    )
  }

  let priceImpact = 0
  // XTZ -> token
  if (
    swapState.tokenA.address == 'XTZ' &&
    swapContractAddresses.includes(swapState.tokenB.address)
  ) {
    const { swapContract, tokenContract } =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenB.address][
          swapState.tokenB.tokenId
        ]
      ]
    const tokenContractAMetadata = tokenAddressToMetadata(
      swapState.tokenA.address,
      swapState.tokenA.tokenId,
      dexContractsState
    )
    const _priceImpact = await xtzToTokenPriceImpact(
      Number(swapState.tokenA.amount) * 10 ** tokenContractAMetadata.decimals,
      String(swapContract.storage.xtzPool),
      String(swapContract.storage.tokenPool)
    )
    priceImpact = _priceImpact ? _priceImpact : 0
  }

  // token -> XTZ
  if (
    swapContractAddresses.includes(swapState.tokenA.address) &&
    swapState.tokenB.address == 'XTZ'
  ) {
    const { swapContract } =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenA.address][
          swapState.tokenA.tokenId
        ]
      ]
    const tokenContractA = tokenAddressToTokenContract(
      swapState.tokenA.address,
      swapState.tokenA.tokenId,
      dexContractsState
    )
    const _priceImpact = await tokenToXtzPriceImpact(
      Number(swapState.tokenA.amount) * 10 ** tokenContractA.metadata.decimals,
      String(swapContract.storage.xtzPool),
      String(swapContract.storage.tokenPool)
    )
    priceImpact = _priceImpact ? _priceImpact : 0
  }

  // token -> token
  if (
    swapContractAddresses.includes(swapState.tokenA.address) &&
    swapContractAddresses.includes(swapState.tokenB.address)
  ) {
    const swapContractIn =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenA.address][
          swapState.tokenA.tokenId
        ]
      ].swapContract
    const tokenContract =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenA.address][
          swapState.tokenA.tokenId
        ]
      ].tokenContract
    const swapContractOut =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenB.address][
          swapState.tokenB.tokenId
        ]
      ].swapContract

    const _priceImpact = await tokenToTokenPriceImpact(
      Number(swapState.tokenA.amount) * 10 ** tokenContract.metadata.decimals,
      String(swapContractIn.storage.xtzPool),
      String(swapContractIn.storage.tokenPool),
      String(swapContractOut.storage.xtzPool),
      String(swapContractOut.storage.tokenPool)
    )
    priceImpact = _priceImpact ? _priceImpact : 0
  }

  return priceImpact * 100
}

const getOtherAmount = (
  swapState: ISwapState,
  dexContractsState: IDexContractsState,
  tokenFrom: ICurrentTokenModified
) => {
  if (swapState.dexAction == 'liquidity') {
    return getOtherAddLiquidityAmount(swapState, dexContractsState, tokenFrom)
  }

  const swapContractAddresses = []
  for (const address in dexContractsState.swapContracts) {
    swapContractAddresses.push(
      dexContractsState.swapContracts[address].swapContract.storage.tokenAddress
    )
  }

  let otherAmount = 0
  // XTZ -> token
  if (
    swapState.tokenA.address == 'XTZ' &&
    swapContractAddresses.includes(swapState.tokenB.address)
  ) {
    const { swapContract, tokenContract } =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenB.address][
          swapState.tokenB.tokenId
        ]
      ]

    if (tokenFrom == 'tokenB') {
      const _otherAmount = xtzToTokenXtzInput(
        Number(swapState.tokenB.amount) * 10 ** tokenContract.metadata.decimals,
        String(swapContract.storage.xtzPool),
        String(swapContract.storage.tokenPool),
        0
      )
      otherAmount = _otherAmount ? Number(_otherAmount) : 0
    } else {
      const _otherAmount = xtzToTokenTokenOutput(
        Number(swapState.tokenA.amount) * Math.pow(10, TEZ_DECIMALS),
        String(swapContract.storage.xtzPool),
        String(swapContract.storage.tokenPool)
      )
      otherAmount = _otherAmount ? Number(_otherAmount) : 0
    }
  }

  // token -> XTZ
  if (
    swapContractAddresses.includes(swapState.tokenA.address) &&
    swapState.tokenB.address == 'XTZ'
  ) {
    const { swapContract, tokenContract } =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenA.address][
          swapState.tokenA.tokenId
        ]
      ]
    if (tokenFrom == 'tokenB') {
      const _otherAmount = tokenToXtzTokenInput(
        Number(swapState.tokenB.amount) * 10 ** TEZ_DECIMALS,
        String(swapContract.storage.xtzPool),
        String(swapContract.storage.tokenPool),
        0
      )
      otherAmount = _otherAmount ? Number(_otherAmount) : 0
    } else {
      const _otherAmount = tokenToXtzXtzOutput(
        Number(swapState.tokenA.amount) * Math.pow(10, tokenContract.metadata.decimals),
        String(swapContract.storage.xtzPool),
        String(swapContract.storage.tokenPool)
      )
      otherAmount = _otherAmount ? Number(_otherAmount) : 0
    }
  }

  // token -> token
  if (
    swapContractAddresses.includes(swapState.tokenA.address) &&
    swapContractAddresses.includes(swapState.tokenB.address)
  ) {
    const swapContractIn =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenA.address][
          swapState.tokenA.tokenId
        ]
      ].swapContract
    const tokenContractIn =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenA.address][
          swapState.tokenA.tokenId
        ]
      ].tokenContract
    const swapContractOut =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenB.address][
          swapState.tokenB.tokenId
        ]
      ].swapContract
    const tokenContractOut =
      dexContractsState.swapContracts[
        dexContractsState.tokenAddressToSwapContractAddress[swapState.tokenB.address][
          swapState.tokenB.tokenId
        ]
      ].tokenContract

    if (tokenFrom == 'tokenB') {
      const _otherAmount = tokenToTokenTokenInput(
        Number(swapState.tokenB.amount) * Math.pow(10, tokenContractOut.metadata.decimals),
        String(swapContractIn.storage.xtzPool),
        String(swapContractIn.storage.tokenPool),
        0,
        String(swapContractOut.storage.xtzPool),
        String(swapContractOut.storage.tokenPool),
        0
      )
      otherAmount = _otherAmount ? Number(_otherAmount) : 0
    } else {
      const _otherAmount = tokenToTokenTokenOutput(
        Number(swapState.tokenA.amount) * Math.pow(10, tokenContractIn.metadata.decimals),
        String(swapContractIn.storage.xtzPool),
        String(swapContractIn.storage.tokenPool),
        String(swapContractOut.storage.xtzPool),
        String(swapContractOut.storage.tokenPool)
      )
      otherAmount = _otherAmount ? Number(_otherAmount) : 0
    }
  }

  return otherAmount
}

export function getLiquidityCreated(swapState: ISwapState, dexContractsState: IDexContractsState) {
  if (swapState.tokenB.address && swapState.dexAction == 'liquidity') {
    const swapContract = tokenAddressToSwapContract(
      swapState.tokenB.address,
      swapState.tokenB.tokenId,
      dexContractsState
    )
    const xtzIn = Number(swapState.tokenA.amount) * 10 ** TEZ_DECIMALS
    const totalLiquidity = swapContract.storage.lqtTotal.toString()
    const _lqtMinted = addLiquidityLiquidityCreated(
      xtzIn,
      String(swapContract.storage.xtzPool),
      totalLiquidity
    )
    return _lqtMinted ? Number(_lqtMinted) : 0
  } else {
    return 0
  }
}

async function getPoolShare(
  swapState: ISwapState,
  dexContractsState: IDexContractsState
): Promise<number> {
  const lpTokenContract = tokenAddressToLiquidityContract(
    swapState.tokenB.address,
    swapState.tokenB.tokenId,
    dexContractsState
  )
  const lqtTotalSupply = Number(await lpTokenContract.getTotalSupply()) // 100
  const lqtMinted = getLiquidityCreated(swapState, dexContractsState) // 10

  const poolShare = (lqtMinted / (lqtMinted + lqtTotalSupply)) * 100

  console.log('lpTokenContract', lpTokenContract.address)
  console.log('swapState.tokenB.address', swapState.tokenB.address)

  return poolShare
}

export const swapState = {
  namespaced: true,
  state: (): ISwapState => ({
    tokenA: {
      amount: '',
      address: '',
      tokenId: 0,
    },
    tokenB: {
      amount: '',
      address: '',
      tokenId: 0,
    },
    showWhitelistDialog: false,
    whitelistDialogType: 'swap',
    whitelistDialogTokenMetadata: undefined,
    addLiquiditySuccessModal: {
      show: false,
      tokenAddress: '',
      tokenId: 0,
      liquidityCreated: 0,
      xtzIn: 0,
      tokenIn: 0,
      liquidityTokenAddress: '',
    },
    priceImpact: 0,
    poolShare: '0.00',
    showTokenSelectionDialog: false,
    currentTokenModified: 'tokenA',
    errors: {
      swapAmountA: '',
      swapAmountB: '',
    },
    showSwapConfirmationDialog: false,
    showSwapConfigModal: false,
    configSlippagePercentage: 3,
    config: {
      slippage: 0.5, // percent
      deadlineDelta: '',
      customSlippage: '',
    },
    dexIndexer: new DexIndexer(),
    dexAction: 'swap',
    recipientAddress: '',
    showSwapWhitelistTokenModal: false,
    showAddNewTokenDialog: false,
    showLiquidityInfoDialog: false,
    selectedTokenMode: 'FA12',
    addToken: {
      tokenAddress: '',
      tokenId: '',
      xtzAmount: '',
      tokenAmount: '',
      faMode: 'FA12',
    },
    isLoadable: false,
  }),
  mutations: {
    resetAddTokenForm: (state: ISwapState) => {
      state.addToken = {
        tokenAddress: '',
        tokenId: '',
        xtzAmount: '',
        tokenAmount: '',
        faMode: 'FA12',
      }
    },
    updateWhitelistDialogTokenMetadata: (
      state: ISwapState,
      whitelistDialogTokenMetadata: ITokenMetadata
    ) => {
      state.whitelistDialogTokenMetadata = whitelistDialogTokenMetadata
    },
    updateWhitelistDialogType: (state: ISwapState, whitelistDialogType: 'addToken' | 'swap') =>
      (state.whitelistDialogType = whitelistDialogType),
    updateShowWhitelistDialog: (state: ISwapState, show: boolean) =>
      (state.showWhitelistDialog = show),
    updateShowAddLiquiditySuccessModal: (state: ISwapState, show: boolean) =>
      (state.addLiquiditySuccessModal.show = show),
    updateAddLiquiditySuccessModal: (
      state: ISwapState,
      addLiquiditySuccesModal: IAddLiquiditySuccessModal
    ) => (state.addLiquiditySuccessModal = addLiquiditySuccesModal),
    updatePriceImpact: (state: ISwapState, priceImpact: number) =>
      (state.priceImpact = priceImpact),
    updatePoolShare: (state: ISwapState, poolShare: string) => (state.poolShare = poolShare),
    updateAddTokenAddress: (state: ISwapState, tokenAddress: string) =>
      (state.addToken = { ...state.addToken, tokenAddress }),
    updateAddTokenId: (state: ISwapState, tokenId: string) =>
      (state.addToken = { ...state.addToken, tokenId }),
    updateAddTokenXtzAmount: (state: ISwapState, xtzAmount: string) =>
      (state.addToken = { ...state.addToken, xtzAmount }),
    updateAddTokenTokenAmount: (state: ISwapState, tokenAmount: string) =>
      (state.addToken = { ...state.addToken, tokenAmount }),
    updateAddTokenFaMode: (state: ISwapState, faMode: FaMode) =>
      (state.addToken = { ...state.addToken, faMode }),
    updateSlippagePercentage: (state: ISwapState, slippage: number) => {
      state.config.slippage = slippage
      state.config.customSlippage = ''
    },
    updateDeadlineDelta: (state: ISwapState, deadlineDelta: string) =>
      (state.config.deadlineDelta = deadlineDelta),
    updateCustomSlippage: (state: ISwapState, customSlippage: string) => {
      state.config.customSlippage = customSlippage
      if (customSlippage == '' || Number(customSlippage) > 100) {
        state.config.slippage = 0.5
      } else if (!isNaN(Number(customSlippage))) {
        state.config.slippage = Number(customSlippage)
      } else {
        state.config.slippage = 0.5
      }
    },
    updateRecipientAddress: (state: ISwapState, recipientAddress: string) =>
      (state.recipientAddress = recipientAddress),
    updateDexAction: (state: ISwapState, dexAction: DexAction) => (state.dexAction = dexAction),
    updateShowTokenSelectionDialog: (state: ISwapState, showDialog: boolean) =>
      (state.showTokenSelectionDialog = showDialog),
    updateShowSwapConfirmationDialog: (state: ISwapState, showDialog: boolean) =>
      (state.showSwapConfirmationDialog = showDialog),
    updateCurrentTokenModified: (state: ISwapState, currentTokenModified: ICurrentTokenModified) =>
      (state.currentTokenModified = currentTokenModified),
    updateSwapAmountError: (state: ISwapState, { whichToken, message }: IUpdateSwapAmountError) => {
      if (whichToken == 'tokenA') {
        state.errors.swapAmountA = message
      } else {
        state.errors.swapAmountB = message
      }
    },
    updateTokenAddress: (
      state: ISwapState,
      { whichToken, address, tokenId }: IUpdateTokenAddress
    ) => {
      if (whichToken == 'tokenA') {
        state.tokenA = {
          ...state.tokenA,
          address,
          tokenId,
        }
      } else {
        state.tokenB = {
          ...state.tokenB,
          address,
          tokenId,
        }
      }
    },
    updateTokenAmount: (state: ISwapState, { whichToken, amount }: IUpdateTokenAmount) => {
      if (whichToken == 'tokenA') {
        state.tokenA = {
          ...state.tokenA,
          amount,
        }
      } else {
        state.tokenB = {
          ...state.tokenB,
          amount,
        }
      }
    },
    updateShowSwapConfigModal: (state: ISwapState, show: boolean) =>
      (state.showSwapConfigModal = show),
    updateConfigSlippagePercentage: (state: ISwapState, pct: number) =>
      (state.configSlippagePercentage = pct),
    updateShowSwapWhitelistTokenModal: (state: ISwapState, show: boolean) =>
      (state.showSwapWhitelistTokenModal = show),
    updateShowAddNewTokenDialog: (state: ISwapState, show: boolean) =>
      (state.showAddNewTokenDialog = show),
    updateShowLiquidityInfoDialog: (state: ISwapState, show: boolean) =>
      (state.showLiquidityInfoDialog = show),
    updateLoadableFlag: (state: ISwapState, flag: boolean) => (state.isLoadable = flag) 
  },
  actions: {
    updateDexAction: async (
      { commit, state, dispatch }: ISwapActionContext,
      dexAction: DexAction
    ) => {
      if (dexAction == 'liquidity' && state.tokenA.address != 'XTZ') {
        if (state.tokenB.address == 'XTZ') {
          commit('updateTokenAddress', {
            whichToken: 'tokenB',
            address: state.tokenA.address,
            tokenId: state.tokenA.tokenId,
          })
        }
        commit('updateTokenAmount', {
          whichToken: 'tokenA',
          amount: '0',
        })
        await dispatch('updateTokenAddress', {
          whichToken: 'tokenA',
          address: 'XTZ',
          tokenId: 0,
        })
      } else if (state.dexAction == 'liquidity') {
        // if dexAction was liquidity, reset amounts
        await dispatch('updateTokenAmount', {
          whichToken: 'tokenA',
          amount: '0',
        })
      }

      commit('updateDexAction', dexAction)
    },
    loadGraphData: async ({ commit, state, rootState }: ISwapActionContext) => {
      commit('graph/updateGraphLoading', true, { root: true })

      let graph = new Graph(new TimeSeries())

      const swapContractAddresses = Object.keys(
        rootState.dexContracts.tokenAddressToSwapContractAddress
      )
      // XTZ -> token
      if (state.tokenA.address == 'XTZ' && swapContractAddresses.includes(state.tokenB.address)) {
        const { swapContract, tokenContract } =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenB.address][
              state.tokenB.tokenId
            ]
          ]
        const timeSeries = await state.dexIndexer.getMarketPriceHistoryXtzToToken(
          swapContract,
          tokenContract.metadata.decimals
        )
        graph = new Graph(timeSeries).initOptions(rootState.theme)
      }

      if (swapContractAddresses.includes(state.tokenA.address) && state.tokenB.address == 'XTZ') {
        const { swapContract, tokenContract } =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenA.address][
              state.tokenA.tokenId
            ]
          ]
        const timeSeries = await state.dexIndexer.getMarketPriceHistoryTokenToXtz(
          swapContract,
          tokenContract
        )
        graph = new Graph(timeSeries).initOptions(rootState.theme)
      }

      if (
        swapContractAddresses.includes(state.tokenA.address) &&
        swapContractAddresses.includes(state.tokenB.address)
      ) {
        const swapContractA =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenA.address][
              state.tokenA.tokenId
            ]
          ].swapContract
        const tokenContractA =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenA.address][
              state.tokenA.tokenId
            ]
          ].tokenContract
        const swapContractB =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenB.address][
              state.tokenB.tokenId
            ]
          ].swapContract
        const tokenContractB =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenB.address][
              state.tokenB.tokenId
            ]
          ].tokenContract

        const timeSeries = await state.dexIndexer.getMarketPriceHistoryTokenToToken(
          swapContractA,
          tokenContractA,
          swapContractB,
          tokenContractB
        )
        graph = new Graph(timeSeries).initOptions(rootState.theme)
      }

      commit('graph/updateGraph', graph, { root: true })

      const graphData = graph.getTimeSeries().getData()
      if (graphData.length) {
        const lastGraphData = graphData[graphData.length - 1]
        const lastTimestamp = new Date(lastGraphData.getTimestamp())
        commit(
          'graph/updatePriceInfo',
          { amount: lastGraphData.getValue(), date: formatDate(lastTimestamp) },
          { root: true }
        )
      }
      commit('graph/updateGraphLoading', false, { root: true })
    },
    swapSuccess: (
      { commit, dispatch }: ISwapActionContext,
      { tokenAddresses, tokenIds }: { tokenAddresses: string[]; tokenIds: number[] }
    ) => {
      commit('updateTokenAmount', { whichToken: 'tokenA', amount: '0' })
      commit('updateTokenAmount', { whichToken: 'tokenB', amount: '0' })
      commit('updateShowSwapConfirmationDialog', false)
      dispatch('dexContracts/loadTokenContractData', { tokenAddresses, tokenIds }, { root: true })
      dispatch('wallet/updateBalance', null, { root: true })
      dispatch('notificationCenter/confirmTransaction', null, { root: true })
    },
    updateTokenAddress: async (
      { commit, state, rootState, dispatch }: ISwapActionContext,
      { whichToken, address, tokenId }: IUpdateTokenAddress
    ) => {
      commit('updateTokenAddress', {
        whichToken,
        address,
        tokenId,
      })

      if (address !== 'XTZ' && rootState.dexContracts.tokenAddressToSwapContractAddress[address]) {
        commit('updateLoadableFlag', false)
        await tokenAddressToSwapContract(address, tokenId, rootState.dexContracts).reloadStorage()
        commit('updateLoadableFlag', true)
        dispatch(
          'dexContracts/reloadBalanceForToken',
          { tokenAddress: address, tokenId },
          { root: true }
        )
      }

      if (state.tokenA.address && state.tokenB.address) {
        dispatch('loadGraphData')
        if(rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenB.address]) {
          commit(
            'graph/updateTokenA',
            tokenAddressToMetadata(
              state.tokenA.address,
              state.tokenA.tokenId,
              rootState.dexContracts
            ),
            { root: true }
          )
          
          commit(
            'graph/updateTokenB',
            tokenAddressToMetadata(
              state.tokenB.address,
              state.tokenB.tokenId,
              rootState.dexContracts
            ),
            { root: true }
          )
        }
      }

      // update tokenB amount
      if (state.tokenA.amount && state.tokenA.address && state.tokenB.address) {
        let decimals = TEZ_DECIMALS
        if (state.tokenB.address != 'XTZ') {
          const tokenContract = tokenAddressToTokenContract(
            state.tokenB.address,
            state.tokenB.tokenId,
            rootState.dexContracts
          )
          if (tokenContract) {
            decimals = tokenContract.metadata.decimals
          }
        }
        const _amountTokenB =
          getOtherAmount(state, rootState.dexContracts, 'tokenA') * Math.pow(10, -decimals)
        const amountTokenB = _amountTokenB.toFixed(decimals)
        commit('updateTokenAmount', { whichToken: 'tokenB', amount: amountTokenB })

        if (state.dexAction == 'liquidity') {
          commit('updatePoolShare', await getPoolShare(state, rootState.dexContracts))
        } else {
          commit('updatePriceImpact', await getPriceImpact(state, rootState.dexContracts))
        }
      }
    },
    inverseTokens: async ({ state, commit, dispatch }: ISwapActionContext) => {
      commit('updateTokenAmount', { whichToken: 'tokenA', amount: state.tokenB.amount })
      const newTokenB_address = state.tokenA.address
      const newTokenB_tokenId = state.tokenA.tokenId
      commit('updateTokenAddress', {
        whichToken: 'tokenA',
        address: state.tokenB.address,
        tokenId: state.tokenB.tokenId,
      })
      await dispatch('updateTokenAddress', {
        whichToken: 'tokenB',
        address: newTokenB_address,
        tokenId: newTokenB_tokenId,
      })
    },
    updateTokenAmount: async (
      { commit, state, rootState }: ISwapActionContext,
      { whichToken, amount }: IUpdateTokenAmount
    ) => {
      if (!state.tokenA.address || !state.tokenB.address) {
        return 0
      }

      const amountString = typeof amount === 'number' ? `${amount}` : amount

      const validateInput = () => {
        const countDecimals = (value: string) => {
          if (value.split('.').length > 1) {
            return value.split('.')[1].length || 0
          } else return 0
        }
        let errorMsgSwapAmount = ''
        if(!rootState.dexContracts.tokenAddressToSwapContractAddress[state[whichToken].address])
          return 'Fail to load contract!'
        const { decimals } = tokenAddressToMetadata(
          state[whichToken].address,
          state[whichToken].tokenId,
          rootState.dexContracts
        )
        if (amountString !== '0' && +amountString) {
          if (isNaN(+amountString)) {
            errorMsgSwapAmount = 'Please enter a numeric value....'
          } else if (countDecimals(amountString) > decimals) {
            errorMsgSwapAmount = `Only ${decimals} decimals are accepted.`
          }
        } else if (!+amountString) {
          errorMsgSwapAmount = 'Please enter an amount'
        }

        return errorMsgSwapAmount
      }

      commit('updateSwapAmountError', { whichToken, message: validateInput() })
      commit('updateTokenAmount', { whichToken, amount })

      const otherToken = whichToken == 'tokenA' ? 'tokenB' : 'tokenA'

      let decimals = TEZ_DECIMALS
      if (rootState.dexContracts.tokenAddressToSwapContractAddress[state[otherToken].address]) {
        decimals =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state[otherToken].address][
              state[otherToken].tokenId
            ]
          ].tokenContract.metadata.decimals
      }

      const _otherAmount =
        getOtherAmount(state, rootState.dexContracts, whichToken) * Math.pow(10, -decimals)
      const otherAmount = _otherAmount > 0 ? _otherAmount.toFixed(decimals) : ''

      commit('updateSwapAmountError', { whichToken: otherToken, message: '' })
      commit('updateTokenAmount', {
        whichToken: otherToken,
        amount: otherAmount,
      })

      if (state.dexAction == 'liquidity') {
        commit('updatePoolShare', await getPoolShare(state, rootState.dexContracts))
      } else {
        commit('updatePriceImpact', getPriceImpact(state, rootState.dexContracts))
      }
    },
    launchExchange: async ({ state, dispatch, rootState, commit }: ISwapActionContext) => {
      const isFA2 = state.addToken.faMode == 'FA2'
      const tokenId = isFA2 ? Number(state.addToken.tokenId) : undefined

      try {
        const tokenContract = await fa12ContractFactory(
          state.addToken.tokenAddress,
          rootState.wallet.tk,
          tokenId
        )

        const factoryContract = isFA2
          ? rootState.dexContracts.dexContractFA2
          : rootState.dexContracts.dexContract

        commit('updateShowWhitelistDialog', false)

        try {
          const op = await factoryContract.launchExchange(
            rootState.wallet.userAddress,
            tokenContract,
            Number(state.addToken.tokenAmount) * 10 ** tokenContract.metadata.decimals,
            state.addToken.xtzAmount,
            tokenId
          )
          commit('updateShowAddNewTokenDialog', false)

          commit('notificationCenter/updateConfirming', true, { root: true })
          await op.confirmation(1)
          commit('notificationCenter/updateConfirming', false, { root: true })
          await factoryContract.reloadStorage()
          let swapContractAddress = ''
          if (isFA2) {
            swapContractAddress = await factoryContract.storage.token_to_swaps.get([
              tokenContract.address,
              tokenId,
            ])
          } else {
            swapContractAddress = await factoryContract.storage.token_to_swaps.get(
              tokenContract.address
            )
          }
          const swapContract = swapContractFactory(swapContractAddress, rootState.wallet.tk)
          const lpAddress = swapContract.storage.lqtAddress
          const lpTokenContract = await lpTokenContractFactory(lpAddress, rootState.wallet.tk)
          const swapInfo: ISwapContractsValue = {
            swapContract,
            tokenContract,
            balance: await tokenContract.getUserBalance(rootState.wallet.userAddress),
            lpTokenContract,
            lpBalance: await lpTokenContract.getUserBalance(rootState.wallet.userAddress),
          }
          await dispatch('dexContracts/addToken', swapInfo, { root: true })
          commit('updateShowLiquidityInfoDialog', false)
          const successModalInfo: IAddLiquiditySuccessModal = {
            show: true,
            tokenAddress: tokenContract.address,
            tokenId: tokenId ? tokenId : 0,
            liquidityCreated: Number(state.addToken.xtzAmount),
            xtzIn: Number(state.addToken.xtzAmount),
            tokenIn: Number(state.addToken.tokenAmount),
            liquidityTokenAddress: swapContract.storage.lqtAddress,
          }
          commit('updateAddLiquiditySuccessModal', successModalInfo)
          commit('resetAddTokenForm')
        } catch (err) {
          console.warn(err)
          dispatch('notificationCenter/showError', formatError(err, 'factory'), { root: true })
        }
      } catch (err) {
        console.warn(err)
        let errorMessage = 'Token does not exist'
        if (typeof err == 'string') {
          errorMessage = err
        }
        dispatch('notificationCenter/showError', errorMessage, { root: true })
      }
    },
    addLiquidity: async ({ state, dispatch, rootState, commit, getters }: ISwapActionContext) => {
      const tokenAddress = state.tokenB.address
      const tokenId = state.tokenB.tokenId
      const swapContract = tokenAddressToSwapContract(tokenAddress, tokenId, rootState.dexContracts)
      const xtzIn = Number(state.tokenA.amount)
      const liquidityCreated = getLiquidityCreated(rootState.swap, rootState.dexContracts)
      const minLiquidityMinted = Math.floor(
        (liquidityCreated * (100 - state.config.slippage)) / 100
      )
      console.log("test")
      const tokenBDecimals = tokenAddressToMetadata(
        state.tokenB.address,
        state.tokenB.tokenId,
        rootState.dexContracts
      ).decimals
      const maxTokensDeposited = Number(state.tokenB.amount) * Math.pow(10, tokenBDecimals)

      try {
        const op = await swapContract.addLiquidity(
          rootState.wallet.userAddress,
          xtzIn,
          minLiquidityMinted,
          maxTokensDeposited,
          getters.deadline(),
          tokenAddressToTokenContract(tokenAddress, tokenId, rootState.dexContracts),
          swapContract.address
        )

        commit('notificationCenter/updateConfirming', true, { root: true })
        commit('updateShowLiquidityInfoDialog', false)
        const successModalInfo: IAddLiquiditySuccessModal = {
          show: true,
          tokenAddress,
          tokenId,
          liquidityCreated: liquidityCreated * 10 ** -TEZ_DECIMALS,
          xtzIn: xtzIn,
          tokenIn: Number(state.tokenB.amount),
          liquidityTokenAddress: swapContract.storage.lqtAddress,
        }
        commit('updateAddLiquiditySuccessModal', successModalInfo)
        await op.confirmation(1)
        commit('notificationCenter/updateConfirming', false, { root: true })
        dispatch('swapSuccess', {
          tokenAddresses: [state.tokenB.address],
          tokenIds: [state.tokenB.tokenId],
        })
      } catch (err) {
        console.warn(err)
        dispatch('notificationCenter/showError', formatError(err, 'swap'), { root: true })
      }
    },
    swapTokens: async ({ state, dispatch, rootState, commit, getters }: ISwapActionContext) => {
      const sender = rootState.wallet.userAddress
      const recipient =
        state.dexAction == 'send' ? state.recipientAddress : rootState.wallet.userAddress
      // find swap contract with proper token
      const swapContractAddresses = Object.keys(rootState.dexContracts.swapContracts).map(
        (address: string) =>
          rootState.dexContracts.swapContracts[address].swapContract.storage.tokenAddress
      )

      commit('updateShowWhitelistDialog', false)
      commit('updateShowSwapConfirmationDialog', false)

      // XTZ -> token
      if (state.tokenA.address == 'XTZ' && swapContractAddresses.includes(state.tokenB.address)) {
        const { swapContract } =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenB.address][
              state.tokenB.tokenId
            ]
          ]
        const xtzAmount = state.tokenA.amount

        const bought = xtzToTokenForward(
          Number(xtzAmount) * 10 ** TEZ_DECIMALS,
          swapContract.storage.tokenPool,
          swapContract.storage.xtzPool
        )
        const minTokensBought = Math.floor((bought * (100 - state.config.slippage)) / 100)
        try {
          const op = await swapContract.xtzToToken(
            recipient,
            xtzAmount,
            minTokensBought,
            getters.deadline()
          )
          commit('notificationCenter/updateConfirming', true, { root: true })
          await op.confirmation(1)
          await dispatch('wallet/updateUserBalance', null, { root: true })
          commit('notificationCenter/updateConfirming', false, { root: true })
          dispatch('swapSuccess', {
            tokenAddresses: [state.tokenB.address],
            tokenIds: [state.tokenB.tokenId],
          })
        } catch (err) {
          console.warn(err)
          dispatch('notificationCenter/showError', formatError(err, 'swap'), { root: true })
        }
      }

      // token -> XTZ
      if (swapContractAddresses.includes(state.tokenA.address) && state.tokenB.address == 'XTZ') {
        const { swapContract, tokenContract } =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenA.address][
              state.tokenA.tokenId
            ]
          ]
        const tokenAmount =
          Number(state.tokenA.amount) * Math.pow(10, tokenContract.metadata.decimals)

        const bought = tokenToXtzForward(
          tokenAmount,
          swapContract.storage.tokenPool,
          swapContract.storage.xtzPool
        )
        const minXtzBought = Math.floor((bought * (100 - state.config.slippage)) / 100)
        try {
          const op = await swapContract.tokenToXtz(
            sender,
            recipient,
            tokenAmount,
            minXtzBought,
            getters.deadline(),
            tokenAddressToTokenContract(
              state.tokenA.address,
              state.tokenA.tokenId,
              rootState.dexContracts
            ),
            swapContract.address
          )
          commit('notificationCenter/updateConfirming', true, { root: true })
          await op.confirmation(1)
          await dispatch('wallet/updateUserBalance', null, { root: true })
          commit('notificationCenter/updateConfirming', false, { root: true })
          dispatch('swapSuccess', {
            tokenAddresses: [state.tokenA.address],
            tokenIds: [state.tokenA.tokenId],
          })
        } catch (err) {
          console.warn(err)
          dispatch('notificationCenter/showError', formatError(err, 'swap'), { root: true })
        }
      }

      // token -> token
      if (
        swapContractAddresses.includes(state.tokenA.address) &&
        swapContractAddresses.includes(state.tokenB.address)
      ) {
        const swapContractA =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenA.address][
              state.tokenA.tokenId
            ]
          ].swapContract
        const tokenContractA =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenA.address][
              state.tokenA.tokenId
            ]
          ].tokenContract
        const swapContractB =
          rootState.dexContracts.swapContracts[
            rootState.dexContracts.tokenAddressToSwapContractAddress[state.tokenB.address][
              state.tokenB.tokenId
            ]
          ].swapContract

        const tokenAmountA =
          Number(state.tokenA.amount) * Math.pow(10, tokenContractA.metadata.decimals)

        const bought = tokenToTokenForward(
          tokenAmountA,
          swapContractA.storage.tokenPool,
          swapContractA.storage.xtzPool,
          swapContractB.storage.tokenPool,
          swapContractB.storage.xtzPool
        )
        const minTokenBought = Math.floor((bought * (100 - state.config.slippage)) / 100)
        try {
          const op = await swapContractA.tokenToToken(
            sender,
            recipient,
            minTokenBought,
            tokenAmountA,
            getters.deadline(),
            tokenAddressToTokenContract(
              state.tokenA.address,
              state.tokenA.tokenId,
              rootState.dexContracts
            ),
            swapContractA.address,
            swapContractB.address
          )
          commit('notificationCenter/updateConfirming', true, { root: true })
          await op.confirmation(1)
          await dispatch('wallet/updateUserBalance', null, { root: true })
          commit('notificationCenter/updateConfirming', false, { root: true })
          dispatch('swapSuccess', {
            tokenAddresses: [state.tokenA.address, state.tokenB.address],
            tokenIds: [state.tokenA.tokenId, state.tokenB.tokenId],
          })
        } catch (err) {
          console.warn(err)
          dispatch('notificationCenter/showError', formatError(err, 'swap'), { root: true })
        }
      }
    },
  },
  getters: {
    deadline(state: ISwapState): () => string {
      return () => {
        const now = dayjs()
        let deadlineDelta = Number(state.config.deadlineDelta)
        if (isNaN(deadlineDelta) || deadlineDelta <= 0) {
          deadlineDelta = 20
        }
        const deadline = now.add(Number(deadlineDelta), 'minute')
        return deadline.toISOString().slice(0, -5) + 'Z'
      }
    },
  },
}
