/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module computes the locked staking objects and information
 */

import { StakingDetailsMap, StakingDetails } from './StakingDetails' // Staking details object module
import dayjs from 'dayjs' // Allows computations with dates

/**
 * This class computes a single locked staking object
 */
export class StakeLock {
  private rate: number
  private timestamp: Date
  private value: number
  private duration: number

  constructor(rate: number, timestamp: Date, value: number, duration: number) {
    this.rate = rate
    this.timestamp = timestamp
    this.value = value
    this.duration = duration
  }

  getRate() {
    return this.rate
  }

  getTimestamp() {
    return this.timestamp
  }

  getValue() {
    return this.value
  }

  getDuration() {
    return this.duration
  }
}

/**
 * This class computes a pack object that contains its related locked staking objects
 */
export class StakeLockPack {
  private stakeLockList: Map<number, StakeLock>

  constructor() {
    this.stakeLockList = new Map()
  }

  getStakeLockList() {
    return this.stakeLockList
  }

  addStakeLockList(index: number, stakeLock: StakeLock) {
    this.stakeLockList.set(index, stakeLock)
  }

  getStakeLock(index: number) {
    return this.stakeLockList.get(index)
  }
}

/**
 * This class computes the locked staking packs map object, with all the packs and their related locked staking objects
 */
export class StakeLockPackMap {
  private stakeLockPackMap: Map<number, StakeLockPack>

  constructor() {
    this.stakeLockPackMap = new Map()
  }

  getStakeLockPackList() {
    return this.stakeLockPackMap
  }

  addStakePack(index: number, stakePack: StakeLockPack) {
    this.stakeLockPackMap.set(index, stakePack)
  }

  getStakePack(index: number) {
    return this.stakeLockPackMap.get(index)
  }

  /**
   * This function computes the total locked stake amount (in all packs)
   */
  getTotalStakeLock() {
    let totalStake = 0
    this.stakeLockPackMap.forEach((sLocks: StakeLockPack, pack: number) => {
      sLocks.getStakeLockList().forEach((stake: StakeLock, index: number) => {
        totalStake += stake.getValue()
      })
    })
    return totalStake
  }

  /**
   * This function computes the details of all the staking packs and their related locked stakes
   * @returns {StakingDetails} staking details map object
   */
  computeStakingDetails() {
    const stakingDetailsMap = new StakingDetailsMap()
    this.stakeLockPackMap.forEach((sLocks: StakeLockPack, pack: number) => {
      sLocks.getStakeLockList().forEach((stake: StakeLock, index: number) => {
        const totalDuration = stake.getDuration()
          ? Math.floor(stake.getDuration() / (3600 * 24))
          : 0
        const percentage = stake.getRate() ? stake.getRate() : 0
        const amount = stake.getValue() ? stake.getValue() : 0
        const period = stake.getTimestamp() ? stake.getTimestamp() : new Date(Date.now())
        const duration = dayjs().diff(dayjs(period), 'day')
        const unlock = dayjs().isAfter(dayjs(period).add(stake.getDuration(), 'seconds'))
        const endDate = dayjs(period).add(stake.getDuration() ? stake.getDuration() : 0, 'seconds')

        //calcul du interest
        const reward = (percentage / 100) * amount * (stake.getDuration() / 31536000)

        stakingDetailsMap.addStakingDetail(
          pack,
          index,
          new StakingDetails(
            duration,
            totalDuration,
            dayjs(period).format('YYYY-MM-DD'),
            dayjs(endDate).format('YYYY-MM-DD'),
            unlock,
            Number(reward),
            amount,
            percentage
          )
        )
      })
    })
    return stakingDetailsMap
  }
}
