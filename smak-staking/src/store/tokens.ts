import PoolAPI from '@/apis/pool.api'
import TopsAPI from '@/apis/tops.api'
import TzktAPI from '@/apis/tzkt.api'
import { TOKENS } from '@/constants/tokens.const'
import { tokenIdentifier } from '@/helpers/token.helper'
import {
  IPool,
  ISmartlinkIndexerParams,
  ITokenPrice,
  ITopToken,
} from '@/interfaces/smartlink.interface'
import { ITokenMetadata } from '@/interfaces/token.interface'
import { metadataKnownToken } from '@/modules/contractInterfaces/FA12'
import dayjs from 'dayjs'

const xtzIdentifier = tokenIdentifier({ address: TOKENS.XTZ.address, tokenId: TOKENS.XTZ.tokenId })

const overrideMetadata = metadataKnownToken.reduce((acc, cur) => {
  const identifier = tokenIdentifier({ address: cur.contractAddress, tokenId: cur.fa2TokenId || 0 })
  acc[identifier] = cur.metadata

  return acc
}, {} as { [key: string]: ITokenMetadata })

const MODULE_STATE = {
  tokensMetadata: {
    [xtzIdentifier]: {
      decimals: 6,
      symbol: 'XTZ',
      name: 'Tezos',
      thumbnailUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png',
    },
    ...overrideMetadata,
  } as { [key: string]: ITokenMetadata },
  topTokens: [] as ITopToken[],
  tokens: {} as { [key: string]: ITopToken },
  tokenPrice: {} as { [key: string]: ITokenPrice[] },
}

export const tokens = {
  namespaced: true,
  state: () => MODULE_STATE,
  getters: {
    tokensMetadata: (state: typeof MODULE_STATE) => state.tokensMetadata,
    topTokens: (state: typeof MODULE_STATE) => {
      return state.topTokens.map((token) => {
        return {
          ...token,
          pct_token_price_24h: token.pct_token_price_24h * 100,
        }
      })
    },
    tokenPrice: (state: typeof MODULE_STATE) => state.tokenPrice,
    tokens: (state: typeof MODULE_STATE) => state.tokens,
  },
  mutations: {
    setTokensMetadataByPools: (state: typeof MODULE_STATE, pools: IPool[]) => {
      state.tokensMetadata = pools.reduce((acc, cur) => {
        const identifier = tokenIdentifier({ address: cur.token_address, tokenId: cur.token_id })
        const override = acc[identifier] || {}
        acc[identifier] = {
          decimals: override.decimals || cur.decimals,
          symbol: override.symbol || cur.symbol,
          name: override.name || cur.name,
          thumbnailUri: override.thumbnailUri || cur.icon,
          usdPrice: cur.last_price_usd,
        }

        return acc
      }, state.tokensMetadata)
    },
    setTokensMetadataByIdentifier: (
      state: typeof MODULE_STATE,
      { identifier, metadata }: { identifier: string; metadata: ITokenMetadata }
    ) => {
      state.tokensMetadata = {
        ...state.tokensMetadata,
        [identifier]: {
          ...(state.tokensMetadata[identifier] || {}),
          ...metadata,
        },
      }
    },
    setTopTokens: (state: typeof MODULE_STATE, topTokens: ITopToken[]) => {
      state.topTokens = topTokens
    },
    setTokenPrice: (
      state: typeof MODULE_STATE,
      {
        tokenPrices,
        tokenAddress,
        tokenId,
      }: { tokenPrices: ITokenPrice[]; tokenAddress: string; tokenId: number }
    ) => {
      const identifier = tokenIdentifier({ address: tokenAddress, tokenId })
      state.tokenPrice = {
        ...state.tokenPrice,
        [identifier]: tokenPrices,
      }
    },
    setTokens: (state: typeof MODULE_STATE, tokens: ITopToken[]) => {
      state.tokens = tokens.reduce((acc, cur) => {
        const identifier = tokenIdentifier({ address: cur.token_address, tokenId: cur.token_id })
        acc[identifier] = cur

        return acc
      }, state.tokens)
    },
  },
  actions: {
    getTopTokens: async (
      context: any,
      params: { isPriceLoaded: boolean }
    ): Promise<ITopToken[]> => {
      const topTokens = await TopsAPI.getTopTokens()
      context.commit('setTopTokens', topTokens)
      context.commit('setTokens', topTokens)

      if (params && params.isPriceLoaded) {
        const tokenPrice = topTokens.map((token) => {
          return context.dispatch('getPriceByPoolAddress', {
            poolAddress: token.pool_address,
            tokenAddress: token.token_address,
            tokenId: token.token_id,
            query: {
              start: dayjs().subtract(1, 'week').unix(),
              end: dayjs().unix(),
              rate: 'D',
            },
          })
        })

        await Promise.all(tokenPrice)
      }

      return topTokens
    },
    getPriceByPoolAddress: async (
      context: any,
      {
        poolAddress,
        tokenAddress,
        tokenId,
        query,
      }: {
        poolAddress: string
        tokenAddress: string
        tokenId: number
        query: ISmartlinkIndexerParams
      }
    ): Promise<ITokenPrice[]> => {
      const tokenPrices = await PoolAPI.getPriceByPoolAddress(poolAddress, query)
      context.commit('setTokenPrice', { tokenPrices, tokenAddress, tokenId })

      return tokenPrices
    },
    getXtzUsdPrice: async (context: any) => {
      const xtzPrices = await TzktAPI.getXtzPrice()
      context.commit('setTokensMetadataByIdentifier', {
        identifier: xtzIdentifier,
        metadata: { usdPrice: xtzPrices.usd },
      })
    },
  },
}
