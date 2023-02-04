/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module computes the staking history object
 */
import dayjs, { OpUnitType } from 'dayjs' // Enables dates computations

/**
 * This class computes the staking data object of an action (staking/unstaking) with the timestamp of the stake/unstake and the amount
 */
export class StakeData {
  private timestamp: string
  private stake: number

  constructor(timestamp: string, stake: number) {
    this.timestamp = timestamp
    this.stake = stake
  }

  getTimestamp() {
    return this.timestamp
  }

  getStake() {
    return this.stake
  }
}

/**
 * This class computes the staking history object (made of staking data objects) of the staked amount on the staking smart contract
 */
export class StakeHistory {
  private stakeHistory: Array<StakeData>
  private temp: number

  constructor() {
    this.stakeHistory = []
    this.temp = 0
  }

  /**
   * This function adds a new staking data object to the staking history array
   * @param {StakeData} data : data to add to the staking history
   */
  addStakeData(data: StakeData) {
    this.stakeHistory.push(data)
  }

  getStakeHistory() {
    return this.stakeHistory
  }

  getTemp() {
    return this.temp
  }

  incrementTemp(value: number) {
    this.temp = this.temp + value
  }

  /**
   * This function returns the full staking history formatted with a precision in seconds
   * @returns {StakeHistory} Staking history object formatted with a precision in seconds
   */
  getFullFormatedStakeHistory() {
    const fStakeHistory = new StakeHistory()
    const lastDate = this.stakeHistory.slice(-1)[0].getTimestamp()
    const firstDate = this.stakeHistory[0].getTimestamp()
    const format = dayjs(lastDate).isAfter(firstDate, 'day') ? 'DD/MM HH:mm:ss' : 'HH:mm:ss'
    this.stakeHistory.forEach((data: StakeData) => {
      const date = dayjs(data.getTimestamp()).format(format)
      const stakeData = new StakeData(date, data.getStake())
      fStakeHistory.addStakeData(stakeData)
    })
    return fStakeHistory
  }

  /**
   * This function returns the full staking history formatted with a given precision
   * @param {OpUnitType} timelaps : duration of the given period (hours, days, years...)
   * @param {string} format1 : format of the date if more than one timelaps has passed
   * @param {string} format2 : format of the date if no timelaps has passed
   * @returns {StakeHistory} Staking history object formatted with a given precision
   */
  getTimelyFormatedStakeHistory(timelaps: OpUnitType, format1: string, format2: string) {
    const tStakeHistory = new StakeHistory()
    const tempStakeHistory = new Map()

    const lastDate = this.stakeHistory.slice(-1)[0].getTimestamp()
    const firstDate = this.stakeHistory[0].getTimestamp()
    const format = dayjs(lastDate).isAfter(firstDate, timelaps) ? format1 : format2
    this.stakeHistory.forEach((data: StakeData) => {
      const date = dayjs(data.getTimestamp()).format(format)
      tempStakeHistory.set(date, data.getStake())
    })

    tempStakeHistory.forEach((stake: number, timestamp: string) => {
      const stakeData = new StakeData(timestamp, stake)
      tStakeHistory.addStakeData(stakeData)
    })

    return tStakeHistory
  }

  /**
   * This function computes the right staking history depending on how much time has passed since the contract origination
   * @returns {StakeData[]} Staking history array made of Stake data objects formatted with a given preicision
   */
  formatStakeHistory() {
    const today = dayjs(this.stakeHistory[0].getTimestamp())

    if (dayjs().isBefore(today.add(1, 'hour'))) {
      return this.getFullFormatedStakeHistory().getStakeHistory()
    } else if (dayjs().isBefore(today.add(6, 'hour')) && dayjs().isAfter(today.add(1, 'hour'))) {
      return this.getTimelyFormatedStakeHistory('day', 'DD/MM HH:mm', 'HH:mm').getStakeHistory()
    } else if (dayjs().isAfter(today.add(6, 'hour')) && dayjs().isBefore(today.add(7, 'day'))) {
      return this.getTimelyFormatedStakeHistory('day', 'DD/MM hha', 'hha').getStakeHistory()
    } else if (dayjs().isAfter(today.add(7, 'days')) && dayjs().isBefore(today.add(6, 'month'))) {
      return this.getTimelyFormatedStakeHistory('month', 'DD/MM', 'DD').getStakeHistory()
    } else {
      return this.getTimelyFormatedStakeHistory('year', 'MMM YYYY', 'MMM').getStakeHistory()
    }
  }
}
