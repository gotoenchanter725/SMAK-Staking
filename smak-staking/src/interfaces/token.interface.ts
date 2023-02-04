import { IChartJSChartData } from './chartjs.interface'
export interface IToken {
  index: number
  address: string
  swapContractAddress?: string | undefined
  tokenId: number
  name: string
  metadata: ITokenMetadata
  usdPrice: number
  priceChange: number
  volume: number
  volumeWeek: number
  tvl: number
  priceWeekChart: IChartJSChartData
}

export interface ITokenMetadata {
  decimals: number
  symbol: string
  name: string
  thumbnailUri: string
  usdPrice?: number
}
