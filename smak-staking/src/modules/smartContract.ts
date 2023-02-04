/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module is a helper module for all smart contract interactions
 */

 import {
  ContractAbstraction,
  ContractMethod,
  TezosToolkit,
  TransactionWalletOperation,
  Wallet,
  WalletOperationBatch,
} from '@taquito/taquito'
import { StakeFlex } from './stakeFlex'
import { StakeLock, StakeLockPack, StakeLockPackMap } from './stakeLock'
import { StakeOption, StakeOptionsMap } from './stakeOptions'
import { config } from '../../config/config'

export class SmartContract {
  private address: string
  private tk: TezosToolkit
  private storage: any

  /**
   * Construcot of a smart contract object
   * @param {string} address of the smart contract
   * @param {TezosToolkit} tk : tezos tool kit related to the smart contract
   */
  constructor(address: string, tk: TezosToolkit) {
    this.address = address
    this.tk = tk
  }

  /**
   * This function sets the storage for the smart contract
   */
  async setStorage() {
    const contract = await this.tk.contract.at(this.address)
    const storage: any = await contract.storage()
    this.storage = storage
  }

  /**
   * This function sends a transactions batch
   * @param {WalletOperationBatch} batch : transactions batch to send
   * @returns {Promise<WalletOperation>} batch operation object containing information such as if the batch is confirmed or its hash
   */
  async sendBatch(batch: WalletOperationBatch) {
    const batchOp = await batch.send()
    return batchOp
  }

  /**
   * This function sends a transaction
   * @param {Promise<ContractMethod<Wallet>>} transaction to send
   * @returns {Promise<TransactionWalletOperation>} transaction operation object containing information such as if the batch is confirmed or its hash
   */
  async sendTransaction(transaction: Promise<ContractMethod<Wallet>>) {
    const transactionOp = await (await transaction).send()
    return transactionOp
  }

  /**
   * This function returns the contract object of the smart contract
   * @returns {Promise<ContractAbstraction<Wallet>>} contract object
   */
  async getContract() {
    const contract = await this.tk.wallet.at(this.address)
    return contract
  }

  /***************** TOKEN SMART CONTRACT *****************/
  /**
   * This function returns the total supply for a given token smart contract
   * @returns {number} total supply of a token smart contract
   */
  getTotalSupply() {
    return this.storage.totalSupply
  }

  /**
   * This function returns the burned supply of the token smart contract that is sent to a given burn address
   * @returns {number} burned supply
   */
  async getBurnedSupply() {
    const burnedSupply = await this.storage.balances.get(config.BURN_ADDRESS)
    return burnedSupply ? Number(burnedSupply.balance) / 1000 : 0
  }

  /**
   * This function returns the balance of a given address
   * @param {string} address of the balance
   * @returns {number} balance amount
   */
  async getBalance(address: string) {
    const fullInfo = await this.storage.balances.get(address)
    return fullInfo ? fullInfo.balance / 1000 : 0
  }


  /**
   * This function builds the approve entrypoint of the token smart contract with a given amount for the staking smart contract address
   * @param {ContractAbstraction<Wallet>} contract where is located the entry point
   * @param {number} amount to aprove for the staking smart contract address
   * @returns {Promise<ContractMethod<Wallet>} transaction for the aprove entry point
   */
  async approve(contract: ContractAbstraction<Wallet>, amount: number) {
    return contract.methods.approve(config.SMART_CONTRACT_ADDRESS, amount)
  }

  async approveGen(contract: ContractAbstraction<Wallet>, amount: number, address: string) {
    return contract.methods.approve(address, amount)
  }

  /***************** STAKING SMART CONTRACT *****************/
  /**
   * This function returns the stake flex object of a given address
   * @param {number} id of the user in the addressId map of the smart contract
   * @param {string} addr : address of the user holding the flexible stake
   * @returns {Promise<StakeFlex>} Flexible stake object
   */
  async getStakeFlex(id: number, addr: string) {
    const sStakeFlexMap = await this.storage.userStakeFlexPack.get(id)
    const sStakeFlex = sStakeFlexMap ? sStakeFlexMap.get(addr) : undefined
    return sStakeFlex
      ? new StakeFlex(
          Number(sStakeFlex.reward),
          sStakeFlex.timestamp,
          Number(sStakeFlex.value),
          Number(sStakeFlex.rate)
        )
      : undefined
  }

  /**
   * This function returns the locked stakings object of a given address
   * @param {string} addr : address of the user holding the locked stakes
   * @returns {Promise<StakeLockMap>} Object containing the information about all locked stakes
   */
  async getLockStakePackMap(addr: string) {
    const stakeLockStorage = await this.storage.userStakeLockPack
    const sAllStakeLock = stakeLockStorage ? await stakeLockStorage.get(addr) : undefined

    const lockStakeMap = new StakeLockPackMap()
    if (sAllStakeLock) {
      sAllStakeLock.forEach((sLocks: any[], id: number) => {
        const pack = new StakeLockPack()
        sLocks.forEach((stake: any, index: number) => {
          const stakeLock = new StakeLock(
            Number(stake.rate),
            stake.timestamp,
            Number(stake.value),
            Number(stake.period)
          )
          pack.addStakeLockList(Number(index), stakeLock)
        })
        lockStakeMap.addStakePack(Number(id), pack)
      })
    }
    return lockStakeMap
  }

  /**
   * This function returns the total number of stakers
   * @returns {number} Total number of stakers
   */
  getStakers() {
    return this.storage.numberOfStakers
  }

  /**
   * This function returns total amount of redeemed rewards
   * @returns {number} Total redeemed rewards
   */
  getTotalRedeemedRewards() {
    return Number(this.storage.totalRedeemedRewards)
  }

  /**
   * This function returns the amount of the redeemed rewards for a given address
   * @param {string} addr : redeemed rewards address
   * @returns {number} User redeemed rewards
   */

  async getUserRedeemedRewards(addr: string, flexRewardsClaimedWithoutStake: number) {
    const redeemedRewards = await this.storage.redeemedRewards.get(addr)

    return redeemedRewards
      ? Number(redeemedRewards) + Number(flexRewardsClaimedWithoutStake)
      : Number(flexRewardsClaimedWithoutStake)
  }

  /**
   * This function returns the map number of the staking history big map
   * @returns {number} staking history big map number
   */
  getStakingHistoryMapNumber() {
    return Number(this.storage.stakingHistory)
  }

  /**
   * This function returns the list of the staking smart contract staking options
   * @returns {StakeOptionsMap} Options that the staking smart contract enables
   */
  getStakeOptionsList() {
    const sOptionsList: any = this.storage.stakingOptions
    const stakeOptionsMap: any = new StakeOptionsMap()
    sOptionsList.forEach((option: any, id: number) => {
      const stakeOption = new StakeOption(
        Number(option.minStake),
        Number(option.maxStake),
        Number(option.stakingPeriod),
        Number(option.stakingPercentage)
      )
      stakeOptionsMap.addStakeOption(Number(id), stakeOption)
    })

    return stakeOptionsMap
  }

  /**
   * This function returns the id related to the addressId for a given address
   * @param addr: address of the holder of the seeked id
   * @returns {number} id for the given address in the addressId map in order to retrieve the flexible staking information
   */
  async getUserStakeFlexId(addr: string) {
    const stakeFlexId = await this.storage.addressId.get(addr)
    return stakeFlexId ? Number(stakeFlexId) : 0
  }

  /**
   * This function builds the batch for a flexible staking operation
   * @param {ContractAbstraction<Wallet>} cStaking : staking contract object
   * @param {ContractAbstraction<Wallet} cToken : token contract object
   * @param {number} amount : amount to stake
   * @returns {Promise<>WalletOperationBatch} Batch containing all the transactions for the flexible staking operation
   */
  async stakeFlex(
    cStaking: ContractAbstraction<Wallet>,
    cToken: ContractAbstraction<Wallet>,
    amount: number
  ) {
    const batch = this.tk.wallet.batch()

    batch.withContractCall(await this.approve(cToken, amount))
    batch.withContractCall(cStaking.methods.stakeFlex(amount))

    return batch
  }

    /**
   * This function builds the batch for a flexible staking operation
   * @param {ContractAbstraction<Wallet>} cStaking : staking contract object
   * @param {ContractAbstraction<Wallet} cToken : token contract object
   * @param {number} amount : amount to stake
   * @returns {Promise<>WalletOperationBatch} Batch containing all the transactions for the flexible staking operation
   */
    async stake(
      cStaking: ContractAbstraction<Wallet>,
      cToken: ContractAbstraction<Wallet>,
      amount: number
    ) {
      const batch = this.tk.wallet.batch()
      batch.withContractCall(await this.approveGen(cToken, amount, cStaking.address))
      batch.withContractCall(cStaking.methods.stake(amount))
  
      return batch
    }

  /**
   * This function builds the batch for a flexible staking operation
   * @param {ContractAbstraction<Wallet>} cStaking : staking contract object
   * @param {ContractAbstraction<Wallet} cToken : token contract object
   * @param {number} amount : amount to stake
   * @returns {Promise<>WalletOperationBatch} Batch containing all the transactions for the flexible staking operation
   */
  async buyTicket(
    cLottery: ContractAbstraction<Wallet>,
    cToken: ContractAbstraction<Wallet>,
    amount: number
  ) {
    const batch = this.tk.wallet.batch()

    batch.withContractCall(
      await this.approveGen(cToken, amount * config.PRICE, config.LOTTERY_CONTRACT_ADDRESS)
    )
    batch.withContractCall(cLottery.methods.buyTicket(amount))

    return batch
  }

  /**
   * This function builds the batch for a locked staking operation
   * @param {ContractAbstraction<Wallet>} cStaking : staking contract object
   * @param {ContractAbstraction<Wallet} cToken : token contract object
   * @param {number} amount : amount to stake
   * @param {number} pack : chosen staking pack
   * @returns {Promise<>WalletOperationBatch} Batch containing all the transactions for the locked staking operation
   */
  async stakeLock(
    cStaking: ContractAbstraction<Wallet>,
    cToken: ContractAbstraction<Wallet>,
    pack: number,
    amount: number
  ) {
    const batch = this.tk.wallet.batch()

    batch.withContractCall(await this.approve(cToken, amount))

    batch.withContractCall(cStaking.methods.stakeLock(amount, pack))

    return batch
  }

  /**
   * This functionb builds the transaction for the flexible claim reward operation
   * @param {ContractAbstraction<Wallet>} cStaking : staking contract object
   * @returns {Promise<ContractMethod<Wallet>>} Batch containing all the transactions for the flexible staking operation
   */
  async claimRewardFlex(cStaking: ContractAbstraction<Wallet>) {
    return cStaking.methods.claimRewardFlex([['unit']])
  }

  /**
   * This function builds the transaction for the unstake locked staking operation
   * @param {ContractAbstraction<Wallet>} cStaking : staking contract object
   * @param {number} pack id of the locked stake
   * @param {number} index of the locked stake in the given pack
   * @returns {Promise<ContractMethod<Wallet>>} Transaction for the unstake lock operation
   */
  async unstakeLock(cStaking: ContractAbstraction<Wallet>, pack: number, index: number) {
    return cStaking.methods.unstakeLock(index, pack)
  }

  /**
   * This function builds the transaction for the unstake flexible staking operation
   * @param {ContractAbstraction<Wallet>} cStaking : staking contract object
   * @param {number} amount to unstake
   * @returns {Promise<ContractMethod<Wallet>>} Transaction for the unstake lock operation
   */
  async unstakeFlex(cStaking: ContractAbstraction<Wallet>, amount: number) {
    return cStaking.methods.unstakeFlex(amount)
  }
}