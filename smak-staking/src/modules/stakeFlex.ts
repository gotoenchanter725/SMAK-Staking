/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module computes the flexible staking objects and information
 */

import dayjs from 'dayjs' // Enables date computations
import { StakingDetails, StakingDetailsMap } from './StakingDetails' // Staking details object module

/**
 * This class computes a flexible staking object
 */
export class StakeFlex {
  private reward: number
  private timestamp: Date
  private value: number
  private rate: number
  constructor(reward: number, timestamp: Date, value: number, rate: number) {
    this.reward = reward
    this.timestamp = timestamp
    this.value = value
    this.rate = rate
  }

  getReward() {
    return this.reward
  }

  getTimestamp() {
    return this.timestamp
  }

  getValue() {
    return this.value
  }

  getRate() {
    return this.rate
  }

  /**
   * This function computes the details of the flexible stake
   * @returns {StakingDetails} staking details map object
   */
  computeStakingDetails() {
    const percentage = this.getRate()
    const amount = this.getValue()
    const duration = dayjs().diff(dayjs(this.getTimestamp()), 'days')
    const reward_duration = dayjs().diff(dayjs(this.getTimestamp()), 'seconds')
    const reward = (percentage! / 100) * amount * (reward_duration / 31536000) + this.getReward()
    const flexMapDetails = new StakingDetailsMap()

    flexMapDetails.addStakingDetail(
      0,
      0,
      new StakingDetails(
        duration,
        0,
        dayjs(this.getTimestamp()).format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
        true,
        reward,
        amount,
        percentage!
      )
    )

    return flexMapDetails
  }
}
