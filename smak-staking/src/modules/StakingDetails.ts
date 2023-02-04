/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module computes the details of a stake (flexible or locked)
 */

/**
 * This class computes the staking details for a single stake
 */
export class StakingDetails {
  private duration: number
  private interest: number
  private amount: number
  private percentage: number
  private totalDuration: number
  private unlock: boolean
  private beginDate: string
  private endDate: string

  constructor(
    duration: number,
    totalDuration: number,
    beginDate: string,
    endDate: string,
    unlock: boolean,
    interest: number,
    amount: number,
    percentage: number
  ) {
    this.duration = duration
    this.totalDuration = totalDuration
    this.beginDate = beginDate
    this.endDate = endDate
    this.unlock = unlock
    this.interest = interest
    this.amount = amount
    this.percentage = percentage
  }

  getDuration() {
    return this.duration
  }

  getInterest() {
    return this.interest
  }

  getAmount() {
    return this.amount
  }

  getPercentage() {
    return this.percentage
  }

  getTotalDuration() {
    return this.totalDuration
  }

  getUnlock() {
    return this.unlock
  }

  getBeginDate() {
    return this.beginDate
  }

  getEndDate() {
    return this.endDate
  }
}

/**
 * This class computes the staking details boject of all the stakes for a connected user
 */
export class StakingDetailsMap {
  private stakingDetailsMap: Map<Array<number>, StakingDetails>

  constructor() {
    this.stakingDetailsMap = new Map()
  }

  addStakingDetail(pack: number, index: number, stakingDetail: StakingDetails) {
    this.stakingDetailsMap.set([pack, index], stakingDetail)
  }

  getStakingDetailsMap() {
    return this.stakingDetailsMap
  }

  getStakingDetail(pack: number, index: number) {
    return this.stakingDetailsMap.get([pack, index])
  }
}
