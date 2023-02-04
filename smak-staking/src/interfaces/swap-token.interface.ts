import { ITokenMetadata } from './token.interface'

export interface ISwapToken {
  index: number
  address: string
  symbol: string
  metadata: ITokenMetadata
  volume: number
  volumeWeek: number
  fees: number
  feesWeek: number
  tvl: number
  feesYearPercentage: number
}
