/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module computes the staking options object that contains the information of every staking options on the smart-contract
 */

/**
 * This class computes the staking option object for a signle staking option
 */
export class StakeOption {
  private minStake: number
  private maxStake: number
  private stakingPeriod: number
  private stakingPerecentage: number

  constructor(
    minStake: number,
    maxStake: number,
    stakingPeriod: number,
    stakingPercentage: number
  ) {
    this.minStake = minStake
    this.maxStake = maxStake
    this.stakingPeriod = stakingPeriod
    this.stakingPerecentage = stakingPercentage
  }

  getMaxStake() {
    return this.maxStake
  }

  getMinStake() {
    return this.minStake
  }

  getStakingPeriod() {
    return this.stakingPeriod
  }

  getStakingPercentage() {
    return this.stakingPerecentage
  }
}

/**
 * This class computes the staking options map containing all the staking options of the smart contract.
 */
export class StakeOptionsMap {
  private stakeOptionsMap: Map<number, StakeOption>

  constructor() {
    this.stakeOptionsMap = new Map<number, StakeOption>()
  }

  getStakeOptionsMap() {
    return this.stakeOptionsMap
  }

  getStakeOption(id: number) {
    return this.stakeOptionsMap.get(id)
  }

  addStakeOption(id: number, option: StakeOption) {
    this.stakeOptionsMap.set(id, option)
  }
}
