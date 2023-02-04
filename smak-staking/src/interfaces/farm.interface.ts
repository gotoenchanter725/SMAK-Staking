import { IToken } from './token.interface'

export interface IFarm {
  tokenA: any
  tokenB: any
  smakPrice: number
  smakPriceUsd: number
  contractAddress: string
  lpAddress: string
  badge: EFarmBadge
  tvl: number
  earned: number
  total_earned: number
  rewardsPerDay: number
  apr: number
  apy: number
  contractLink: string
  pairInfoLink: string
  earnedForHarvest: number
  earnedForHarvestByUsd: number
  lpStaked: number
  lpStakedByUsd: number
  lpUsd: number
  balance: number
  weeks: any
  currentWeek: number
  createdTime: number
  unclaimedEarnings: number
}

export enum EFarmBadge {
  HOT = 'hot',
  NEW = 'new',
}