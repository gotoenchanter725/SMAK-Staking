/**
 * @module smak-staking
 * @author Smart-Chain
 * @version 1.2.0
 * This module computes every smak staking dashboard elements in order to display them through the Staking.vue file
 */

// Config
import { config } from '@/../config/config'

// Display
import { Component, Vue, Watch } from 'vue-property-decorator'
import VChart from 'vue-echarts'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import StakingDialog from '@/components/StakingDialog.vue'
import StakingDialogLarge from '@/components/StakingDialogLarge.vue'
import AppFooter from '@/components/AppFooter.vue'

// Modules
import { SmartContract } from '@/modules/smartContract'
import { Graph } from '@/modules/graph'
import { StakeOption, StakeOptionsMap } from '@/modules/stakeOptions'
import { StakeHistory } from '@/modules/stakingHistory'
import { StakingDetailsMap } from '@/modules/StakingDetails'
import { tzktCommunication } from '@/modules/tzktCommunication'

// Taquito
import { ContractAbstraction, ContractMethod, TezosToolkit, Wallet } from '@taquito/taquito'

// Libraries
import dayjs from 'dayjs' // Time display and computation
import { StakeFlex } from '@/modules/stakeFlex'
import { StakeLockPackMap } from '@/modules/stakeLock'
import { mapActions, mapGetters, mapState } from 'vuex'
import { IHolders, ISmakStake } from '@/interfaces/smartlink.interface'

const tk = new TezosToolkit(config.RPC_ADDRESS)
//Vue.config.silent = true;

@Component({
  components: {
    DefaultLayout,
    VChart,
    StakingDialog,
    StakingDialogLarge,
    AppFooter,
  },
  computed: {
    ...mapState('wallet', [
      'isWalletConnected',
      'showConnectedWallet',
      'userAddress',
      'tk',
      'tokenSmartContract',
      'smakPrice',
      'smakVar',
    ]),
    ...mapState(['theme']),
    ...mapGetters('wallet', ['walletInUse']),
    ...mapGetters(['themeClass']),
    ...mapGetters('smak', [
      'circulatingSupply',
      'fullyDillutedSupply',
      'latestSmakBurned',
      'holders',
    ]),
  },
  methods: {
    ...mapActions('staking', ['getSmakStakeFlex', 'getSmakStakeLock']),
    ...mapActions('smak', ['getHolders', 'getSmakBurned']),
    ...mapActions({
      updateSmakPrice: 'wallet/updateSmakPrice',
      updateSmakVar: 'wallet/updateSmakVar',
      query: 'farms/query',
    }),
  },
})
export default class Staking extends Vue {
  getSmakStakeFlex!: () => Promise<ISmakStake[]>
  getSmakStakeLock!: () => Promise<ISmakStake[]>
  getHolders!: () => Promise<IHolders>
  getSmakBurned!: () => Promise<void>
  query!: (url: string) => Promise<any>
  private updateSmakPrice!: () => any
  private updateSmakVar!: () => any

  private theme!: any

  private isWalletConnected!: boolean
  private walletInUse!: any
  private tokenSmartContract!: any

  private userAddress = '' // User address gathered from his wallet
  private userBalance: string | number = 0 // User balance gathered from the FA1.2 token contract

  /**
   * STAKING SMART CONTRACT
   */
  private stakingSmartContract: SmartContract = new SmartContract(config.SMART_CONTRACT_ADDRESS, tk)
  private sContract: ContractAbstraction<Wallet> | undefined
  stakingOptionsMap: StakeOptionsMap = new StakeOptionsMap() // The staking options information map (flex, lock...),
  redeemedRewards = 0 // Total redeemed rewards
  numberOfStakers = 0 // Total stakers
  totalStake = 0 // Total stake value

  latestSmakBurned!: number // Total burned tokens
  totalSupply: number = Number(config.TOTAL_SUPPLY) / 1000 // Total contract supply
  tokenContractAddress: string = config.CONTRACT_FA12TOKEN_CONTRACT_ADDRESS // FA1.2 token contract address
  circulatingSupply!: number // circulating supply

  /**
   * TZKT INDEXER
   */
  tzkt: tzktCommunication = new tzktCommunication()
  smakVar!: string // SMAK variation during the last 8 hours
  //smakVarSign = '+' // SMAK variation sign (positive or negative)
  smakMarketcap = 0
  fullyDillutedSupply!: number
  smakFullyDilutedMarketCap = 0
  smakPrice!: number // Current SMAL price in USD
  history!: StakeHistory // Staking history for the graph display
  claimRewardsTransactionsHistory: any
  flexPackStorageHistory: any

  /**
   * VUEJS DISPLAY
   */
  loading = false // Loads the main componenent
  priceChange = true // Displays the price change component
  packId = 0 // The id of the pack to display on the "Stake SMAK" componenent.

  drawer = false // Navigation drawer on mobile (open/close)
  get mobile(): boolean {
    // Computed variable to switch to mobile display
    return this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs
  }

  get mobileS(): boolean {
    // Computed variable to switch to mobile display
    return this.$vuetify.breakpoint.xs
  }

  get mobileXsAndMoreThan3Packs(): boolean {
    // Computed variable to switch to mobile display
    return (
      this.$vuetify.breakpoint.width < 415 && this.stakingOptionsMap.getStakeOptionsMap().size > 3
    )
  }

  get mobileXxs(): boolean {
    return this.$vuetify.breakpoint.width < 370
  }

  infoPack = -1 // Displays the right pack information in the "Staking Information/Locked staking/flexible staking pop-ups"

  // Dialogs variables
  show = false // Show or hide the wallet connection pop-up (triggered by the up right button)
  dialog1: boolean[] = [false, false, false] // Show or hide the first level of "Staking Information/Locked staking/flexible staking" pop-ups
  dialog2: boolean[] = [false, false, false] // Show or hide the second level of "Staking Information/Locked staking/flexible staking" pop-ups
  dialog3: boolean[] = [false, false, false] // Show or hide the third level of "Staking Information/Locked staking/flexible staking" pop-ups
  showConnectedWallet = false // Show or hide the wallet connection pop-up (triggered by the button in "Stake smak")
  stakeDialog = false // Show or hide the stake dialog

  // Alerts
  confirming = false // Show or hide the confirming alert
  action = '' // Action name in the confirming alert
  confirmed = false // Show or hide the confirmed alert
  walletError = false // Show or hide the error alert
  errormsg = '' // Error message in the error alert
  closeAllDialogs = false // Trigger the closure of all the dialogs of "Staking Information/Locked staking/flexible staking" pop-ups

  dialogMenuOptions: Map<number, string> = new Map([
    [-1, 'All lots'],
    [0, 'Flex'],
    [1, 'Lock'],
  ]) // Menu options in the "Staking Information/Locked staking/flexible staking" pop-ups

  // Unstake information
  datenow: string = dayjs().format('YYYY-MM-DD HH:mm:ss') // Current date formatted
  valuedate: string = dayjs().add(1, 'day').format('YYYY-MM-DD HH:00:00') // Value date = current date formatted
  selectedPackAPY = 0 // Selected pack APY
  selectedPackDuration = 0 // Selected pack duration in seconds
  selectedPackRedemptionDate: string = dayjs().format('YYYY-MM-DD HH:00:00') // Selected pack redemption date formatted
  flexRewardPeriod = 7 // Flex reward default period in days (set to 7 days)

  // Error messages
  errorMsgStake = '' // Displayed next to "Min Smak" value in "Stake SMAK"
  isStakeValid = true // Displays an error if the stake value is not valid
  errorMsgUnstakeRedeem = '' // Displayed above the unstake/redeem button in Staking Information/Locked staking/flexible staking" pop-ups
  isUnstakeValid = true // Displays an error if the unstake amount is not valid

  /**
   * ECHARTS GRAPH
   */
  update = true // is the graph automatically updatable
  option: any // options containing all the data of the graph

  /**
   * CONNECT WALLET INFORMATION
   */
  amountToStake: number | string = '' // Amount that the user wishes to stake
  amountToUnstake: number | string = '' // Amount that the user wished to unstake in their flex pack
  minPrice = 0 // Minimum required SMAK USD price for a selected type of pack
  userTotalStakedSMAK = 0 // User total staked SMAK value gathered from the staking contract
  userRedeemedRewards = 0 // User total redeemed rewards gathered from the staking contract
  userStakeFlexId = 0 // User id in the addressid map used to gatheir their information in the staking flex map
  userStakeFlexDetails: StakingDetailsMap = new StakingDetailsMap() // Flexible staking user information
  userStakeLockDetails: StakingDetailsMap = new StakingDetailsMap() // Locked staking user information

  /**
   * Function that loads the required information before the mounting of the staking component
   */
  async beforeMount() {
    this.getSmakStakeFlex()
    this.getSmakStakeLock()
    this.getHolders()
    await this.updateSmakPrice()
    await this.updateSmakVar()
    await this.getSmakBurned()
    this.smakFullyDilutedMarketCap = this.fullyDillutedSupply * this.smakPrice
    this.smakMarketcap = this.circulatingSupply * this.smakPrice
    this.numberOfStakers = (
      await this.query('https://smartlink-indexer-api.deployments.smart-chain.fr/v1/holders')
    ).smak_staker
    //this.loadTokenPrice()
    this.loadTokenContractData()
    await this.loadStakingContractData()
    this.loadpack(0)
    await this.loadGraphData()
    await this.loadWallet()

    // this.$store.commit('wallet/updateUserBalance')
    this.loading = true
  }

  /**
   * Function that loads the token price with information gathered with the tzkt indexer
   */
  // async loadTokenPrice() {
  //   this.smakPrice = await this.tzkt.computeSMAKPrice()
  //   const smakVarObj = await this.tzkt.computeTokenVar()
  //   this.smakVar = smakVarObj.value
  //   this.smakVarSign = smakVarObj.sign
  //   this.smakMarketcap = Number(this.smakPrice) * this.circulatingSupply
  //   this.smakFullyDilutedMarketCap = Number(this.smakPrice) * this.totalSupply
  // }
  /**
   * Fnction that loads the FA1.2 Token smart contract storage data
   */
  async loadTokenContractData() {
    await this.tokenSmartContract.setStorage()
    //this.burnedTokens = await this.tokenSmartContract.getBurnedSupply()
  }

  /**
   * Function that allows the user to connect a wallet
   * @param {string} wallet: name of the used wallet by the client
   */
  async connectWallet(wallet: string) {
    this.$store.commit('wallet/updateWalletType', wallet)

    return await this.walletInUse
      .setupWallet()
      .then(() => this.$store.dispatch('wallet/loadWallet'))
      .catch((error: any) => {
        this.walletErrorAlert(error.message)
      })
  }

  /**
   * Function that loads wallet information
   */
  async loadWallet() {
    if (this.isWalletConnected) {
      tk.setWalletProvider(this.walletInUse.getWallet())
      await this.setWalletAddressInformation()
      await this.computeStakingPacksData()
    }
  }

  /**
   * Function that computes wallet basic information and gathers information from staking and token contracts
   */
  async setWalletAddressInformation() {
    this.userAddress = await this.walletInUse.getWalletAddress()
    this.userBalance = await this.tokenSmartContract.getBalance(this.userAddress)
    const userRedeemedRewardsWithoutStake = await this.tzkt.getRedeemedFlexRewardsWithoutStake(
      this.claimRewardsTransactionsHistory,
      this.flexPackStorageHistory,
      this.userAddress
    )
    this.userRedeemedRewards = await this.stakingSmartContract.getUserRedeemedRewards(
      this.userAddress,
      Number(userRedeemedRewardsWithoutStake)
    )
    this.userStakeFlexId = await this.stakingSmartContract.getUserStakeFlexId(this.userAddress)
  }

  /**
   * Function that computes staking packs information
   */
  async computeStakingPacksData() {
    const flex: StakeFlex | undefined = await this.stakingSmartContract.getStakeFlex(
      this.userStakeFlexId,
      this.userAddress
    )
    const lock: StakeLockPackMap = await this.stakingSmartContract.getLockStakePackMap(
      this.userAddress
    )
    this.userTotalStakedSMAK = (lock ? lock.getTotalStakeLock() : 0) + (flex ? flex.getValue() : 0)
    this.userStakeFlexDetails = flex ? flex.computeStakingDetails() : new StakingDetailsMap()
    this.userStakeLockDetails = lock.computeStakingDetails()
  }

  /**
   * Function that loads the graph data
   */
  async loadGraphData() {
    const mapNumber: number = this.stakingSmartContract.getStakingHistoryMapNumber()
    this.history = await this.tzkt.getStakingHistory(6240, new StakeHistory())
    // this.history = await this.tzkt.getStakingHistory(mapNumber, this.history, 18988)
    this.history = await this.tzkt.getGraph(this.history)
    this.totalStake = this.history.getStakeHistory().slice(-1)[0].getStake()
    this.option = new Graph(this.history.formatStakeHistory(), this.theme).getOptions()
  }

  /**
   * Function that loads the staking contract data
   */
  async loadStakingContractData() {
    await this.stakingSmartContract.setStorage()
    this.claimRewardsTransactionsHistory = await this.tzkt.getClaimRewardsTransactionsHistory()
    this.flexPackStorageHistory = await this.tzkt.getFlexPackStorageHistory()
    this.sContract = await this.stakingSmartContract.getContract()
    this.stakingOptionsMap = this.stakingSmartContract.getStakeOptionsList()
    // this.numberOfStakers = this.stakingSmartContract.getStakers()

    const claimedFlexRewardsWithoutStake = await this.tzkt.getRedeemedFlexRewardsWithoutStake(
      this.claimRewardsTransactionsHistory,
      this.flexPackStorageHistory
    )
    this.redeemedRewards =
      (this.stakingSmartContract.getTotalRedeemedRewards() +
        Number(claimedFlexRewardsWithoutStake)) /
      1000
  }

  /**
   * Function that loads the data of a selected pack
   * @param {number} pack  : the id of the pack to load
   */
  loadpack(pack: number) {
    this.errorMsgStake = '' // resets the error message in the stake component
    this.packId = pack
    const selectedPack: StakeOption = this.stakingOptionsMap.getStakeOptionsMap().get(pack)!
    this.minPrice = Number(selectedPack.getMinStake()) / 1000
    this.selectedPackAPY = selectedPack.getStakingPercentage()
    this.selectedPackDuration = selectedPack.getStakingPeriod()
    this.selectedPackRedemptionDate =
      pack == 0
        ? dayjs().add(7, 'days').format('YYYY-MM-DD HH:00:00')
        : dayjs().add(this.selectedPackDuration, 'seconds').format('YYYY-MM-DD HH:00:00')
  }

  /**
   * Function that counts the number of decimals entered by the user
   * @param {number} value : the number of which you need to count decimals
   */
  countDecimals(value: number) {
    if (value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    } else return 0
  }

  /**
   * Function that resets the date each time a pop-up is entered
   */
  @Watch('stakeDialog')
  onStakeDialogOpen() {
    this.datenow = dayjs().format('YYYY-MM-DD HH:mm:ss') // Current date formatted
  }

  /**
   * Function that displays the right error when the stake input value is not valid
   */
  @Watch('amountToStake')
  onAmountToStakeChange() {
    this.errorMsgStake = ''
    this.isStakeValid = true
    if (Number(this.amountToStake) != 0) {
      if (isNaN(+this.amountToStake)) {
        this.errorMsgStake = 'Please enter a numeric value.'
        this.isStakeValid = false
      } else if (this.countDecimals(Number(this.amountToStake)) > 3) {
        this.errorMsgStake = 'Only 3 decimals are accepted.'
        this.isStakeValid = false
      } else if (this.minPrice > Number(this.amountToStake)) {
        this.errorMsgStake = 'Amount too low'
        this.isStakeValid = false
      }
    } else {
      this.errorMsgStake = 'Please enter an amount'
      this.isStakeValid = false
    }
  }

  /**
   * Function that displays the right error when the unstake input value is not valid
   */
  @Watch('amountToUnstake')
  onAmountToUnstakeChange() {
    this.errorMsgUnstakeRedeem = ''
    this.isUnstakeValid = true

    if (Number(this.amountToUnstake) != 0) {
      if (isNaN(+this.amountToUnstake)) {
        this.errorMsgUnstakeRedeem = 'Please enter a numeric value.'
        this.isUnstakeValid = false
      } else if (this.countDecimals(Number(this.amountToUnstake)) > 3) {
        this.isUnstakeValid = false
        this.errorMsgUnstakeRedeem = 'Only 3 decimals are accepted.'
      } else if (0 > Number(this.amountToUnstake)) {
        this.errorMsgUnstakeRedeem = 'Amount too low'
        this.isUnstakeValid = false
      }
    } else {
      this.errorMsgUnstakeRedeem = 'Please enter an amount'
      this.isUnstakeValid = false
    }
  }

  /**
   * Function that changes the graph theme when the theme changes
   */
  @Watch('theme')
  onPropertyChanged() {
    this.option = new Graph(this.history.formatStakeHistory(), this.theme).getOptions()
  }

  /**
   * Function that closes the mobile drawer if needed when going from the mobile display to desktop display
   */
  @Watch('mobile')
  endDrawer() {
    if (!this.mobile) {
      this.drawer = false
    }
  }

  /**
   * Function that closes all the "Staking Information/Locked staking/flexible staking" pop-ups
   */
  @Watch('closeAllDialogs')
  closeAll() {
    this.errorMsgUnstakeRedeem = ''
    this.errorMsgStake = ''
    if (!this.closeAllDialogs) {
      this.closeDialogs()
    }
  }

  /**
   * Function that resets the error message in the "Staking Information/Locked staking/flexible staking" pop-ups when the pop-ups are closed
   */
  @Watch('dialog1')
  @Watch('dialog2')
  @Watch('dialog3')
  reloadData() {
    this.errorMsgUnstakeRedeem = ''
    this.errorMsgStake = ''
    this.datenow = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  /**
   * Function that changes the pack displayed in the "Staking Information/Locked staking/flexible staking" pop-ups
   * @param {number} pack : id of the selected pack of which the info should be displayed in the "All / Flex / lock " pop ups
   */
  changeInfoPack(pack: number) {
    this.infoPack = pack
  }

  /**
   * Function that sets the amount to stake to the user's max balance
   */
  useMax() {
    this.amountToStake = this.userBalance
  }

  /**
   * Function that sets the amount to unstake to the user's max stake
   * @param {number} maxValue : maximum value of smak staked with the flexible pack
   */
  unstakeMax(maxValue: number) {
    this.amountToUnstake = maxValue / 1000
  }

  /**
   * Function that allows a user to stake their SMAK tokens
   */
  async stake() {
    if (this.isStakeValid) {
      this.errorMsgStake = ''
      this.confirming = false

      const cToken = await tk.wallet.at(config.CONTRACT_FA12TOKEN_CONTRACT_ADDRESS)
      const batch =
        this.packId == 0
          ? await this.stakingSmartContract.stakeFlex(
              this.sContract!,
              cToken,
              Number(this.amountToStake) * 1000
            )
          : await this.stakingSmartContract.stakeLock(
              this.sContract!,
              cToken,
              this.packId,
              Number(this.amountToStake) * 1000
            )

      this.stakeDialog = false // Close the stake dialog
      this.confirming = true

      await this.stakingSmartContract
        .sendBatch(batch)
        .then((confirmation) => {
          confirmation
            .confirmation()
            .then(() => {
              this.action = 'Stake'
              this.reload()
            })
            .catch((error) => {
              this.walletErrorAlert(error.message)
            })
        })
        .catch((error) => {
          this.confirming = false
          this.errorMsgStake = error.message
        })
    }
  }

  /**
   * Function that manages the wallet error alert
   * @param {string} error : Error to display
   */
  walletErrorAlert(error: string) {
    this.walletError = true
    this.errormsg = error
    window.setTimeout(() => {
      this.errormsg = ''
      this.walletError = false
    }, 3000)
  }

  /**
   * Function that reloads the data after a successful transaction
   */
  async reload() {
    this.amountToStake = 0
    this.confirmed = true

    // Reset all error messages
    this.errormsg = ''
    this.errorMsgUnstakeRedeem = ''
    this.errorMsgStake = ''

    // Disable all unused alerts
    this.walletError = false
    this.confirming = false

    // Close all dialogs
    //this.closeDialogs()

    this.loading = false // sart loading data

    // Make the success alert disappear
    window.setTimeout(() => {
      this.confirmed = false
      this.action = ''
    }, 3000)

    // Load all the other data
    await this.updateSmakPrice()
    await this.updateSmakVar()
    await this.loadTokenContractData()
    await this.loadStakingContractData()
    this.loadpack(0)
    await this.loadGraphData()
    this.loading = true
    await this.loadWallet()
    this.loading = true
  }

  /**
   * Function that allows a user to redeem their reward
   */
  async redeemFlexReward() {
    this.errorMsgUnstakeRedeem = '' // Reset the error msg
    const transaction = this.stakingSmartContract.claimRewardFlex(this.sContract!)
    await this.sendTransaction(transaction, 'Rewards redeem')
  }

  /**
   * Function that closes all dialogs
   */
  closeDialogs() {
    this.dialog1 = [false, false, false]
    this.dialog2 = [false, false, false]
    this.dialog3 = [false, false, false]
  }

  /**
   * Function that sends a given transaction to the blockchain
   * @param {Promise<ContractMethod<Wallet>>} transaction : transaction to send, previously built
   * @param {string} action : action that the transaction perfoms (unstake, stake...)
   */
  async sendTransaction(transaction: Promise<ContractMethod<Wallet>>, action: string) {
    this.confirming = true // Display the confirming alert
    await this.stakingSmartContract
      .sendTransaction(transaction)
      .then((op) => {
        this.closeDialogs()
        this.confirming = true
        op.confirmation()
          .then(() => {
            this.action = action
            this.reload()
          })
          .catch((error) => {
            this.walletErrorAlert(error.message)
          })
      })
      .catch((error) => {
        this.confirming = false
        this.errorMsgUnstakeRedeem = error.message
      })
  }

  /**
   * Function that allows the user to unstake their locked staking
   * @param {number} index : index of the stake lock to unstake (information taken from the smart-contract)
   * @param {number} pack : pack number that the client is unstaking.
   */
  async unstakeLock(pack: number, index: number) {
    this.errorMsgUnstakeRedeem = ''
    const transaction = this.stakingSmartContract.unstakeLock(this.sContract!, pack, index)
    await this.sendTransaction(transaction, 'Unstake')
  }

  /**
   * Function that allows a user to unstake tokens from their flexible staking
   * @param {number} amount: amount to unstake
   */
  async unstakeFlex(amount: number) {
    if (this.isUnstakeValid && amount > 0) {
      this.errorMsgUnstakeRedeem = ''
      const transaction = this.stakingSmartContract.unstakeFlex(this.sContract!, amount * 1000)
      await this.sendTransaction(transaction, 'Unstake')
      this.amountToUnstake = 0
    }
  }
}