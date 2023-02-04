import { IToken } from './token.interface'

export interface ILaunchpool {
  token: IToken
  badge: ELaunchpoolBadge
  totalStaked: number
  earned: number
  apy: number
  apr: number
  endsIn: Date
  contractLink: string
  viewTokenLink: string
  projectWebsiteLink: string
  isStaked: boolean
  harvestAmount: number
}

export enum ELaunchpoolBadge {
  HOT = 'hot',
  NEW = 'new',
}
