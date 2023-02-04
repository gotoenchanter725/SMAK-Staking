/**
 * @module smak-staking
 * @author Smart-Chain
 * @version 1.2.0
 * This module computes every smak staking dashboard elements in order to display them through the Staking.vue file
 */

// Config
import { config } from '@/../config/config'
import lotteryData from '@/modules/lottery-data'

// Display
import { Component, Vue } from 'vue-property-decorator'
import VChart from 'vue-echarts'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import StakingDialog from '@/components/StakingDialog.vue'
import StakingDialogLarge from '@/components/StakingDialogLarge.vue'
import BuyTickets from '@/components/lottery/BuyTickets.vue'
import LotteryChart from '@/components/lottery/LotteryChart.vue'
import ContractAddress from '@/components/lottery/ContractAddress.vue'
import Confetti from '@/components/lottery/Confetti.vue'
import SelectSettings from '@/components/shared/SelectSettings.vue'
import AppFooter from '@/components/AppFooter.vue'

// Modules
import { SmartContract } from '@/modules/smartContract'
import { tzktCommunication } from '@/modules/tzktCommunication'

// Taquito
import { TezosToolkit } from '@taquito/taquito'
import { mapGetters, mapState } from 'vuex'

const tk = new TezosToolkit(config.RPC_ADDRESS)
//Vue.config.silent = true;

interface WinningRound {
  winner: string
  number: number
  prize: number
}

@Component({
  components: {
    DefaultLayout,
    VChart,
    StakingDialog,
    StakingDialogLarge,
    BuyTickets,
    LotteryChart,
    ContractAddress,
    Confetti,
    SelectSettings,
    AppFooter,
  },
  computed: {
    ...mapState('wallet', [
      'isWalletConnected',
      'showConnectedWallet',
      'userAddress',
      'tk',
      'beaconWallet',
      'templeWallet',
      'tokenSmartContract',
    ]),
    ...mapState(['theme']),
    ...mapGetters('wallet', ['walletInUse']),
    ...mapGetters(['themeClass']),
  },
})
export default class Lottery extends Vue {
  lotteryData = lotteryData

  private theme!: string
  private walletInUse!: any
  private isWalletConnected!: boolean
  private templeWallet!: any
  numShownLottery = 30
  shownLotteryOptions = [10, 30, 50, { display: 'All', value: 0 }]

  /**
   * LOTTERY SMART CONTRACT
   */
  private lotterySmartContract: SmartContract = new SmartContract(
    config.LOTTERY_CONTRACT_ADDRESS,
    tk
  )

  /**
   * FA 1.2 TOKEN SMART CONTRACT
   */
  private tokenSmartContract: SmartContract = new SmartContract(
    config.CONTRACT_FA12TOKEN_CONTRACT_ADDRESS,
    tk
  )
  /**
   * TZKT INDEXER
   */
  tzkt: tzktCommunication = new tzktCommunication()

  /**
   * VUEJS DISPLAY
   */
  loading = false // Loads the main componenent

  drawer = false // Navigation drawer on mobile (open/close)
  get mobile(): boolean {
    // Computed variable to switch to mobile display
    return this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs
  }

  get mobileS(): boolean {
    // Computed variable to switch to mobile display
    return this.$vuetify.breakpoint.xs
  }

  get mobileXxs(): boolean {
    return this.$vuetify.breakpoint.width < 370
  }

  // Dialogs variables
  showConnectedWallet = false // Show or hide the wallet connection pop-up (triggered by the button in "Stake smak")
  stakeDialog = false // Show or hide the stake dialog

  // Alerts
  confirming = false // Show or hide the confirming alert
  action = '' // Action name in the confirming alert
  confirmed = false // Show or hide the confirmed alert
  walletError = false // Show or hide the error alert
  errormsg = '' // Error message in the error alert

  // Error messages
  errorMsgStake = '' // Displayed next to "Min Smak" value in "Stake SMAK"

  /**
   * CONNECT WALLET INFORMATION
   */
  amountToStake: number | string = '' // Amount that the user wishes to stake
  userAddress = '' // User address gathered from his wallet
  userBalance = 0 // User balance gathered from the FA1.2 token contract

  get chancesOfWinning() {
    return this.userTickets.length / lotteryData.ticketsPerRound
  }

  // Tickets bought by the user for the current round
  get userTickets() {
    return Object.entries(lotteryData.tickets)
      .filter(([_key, value]) => value === this.userAddress)
      .map(([key, _value]) => key)
  }

  get ticketsLeftCount() {
    return lotteryData.ticketsPerRound - Object.keys(lotteryData.tickets).length
  }
  get participantsCount() {
    const participants: string[] = []

    Object.values(lotteryData.tickets).forEach((address) => {
      if (!participants.includes(address)) participants.push(address)
    })

    return participants.length
  }

  get userSpentSmakOnLottery() {
    return this.userTickets.length * lotteryData.ticketPrice
  }

  get totalLotteryRounds() {
    return Math.max(0, lotteryData.roundNumber - 1)
  }

  get totalLotteryGains() {
    return this.totalLotteryRounds * lotteryData.winningPrize
  }

  get totalLotteryBurned() {
    return this.totalLotteryRounds * lotteryData.burnedPerRound
  }

  get currentRound() {
    return lotteryData.winningHistory.find((round) => round.roundNumber === lotteryData.roundNumber)
  }

  get previousRound() {
    return lotteryData.winningHistory.find(
      (round) => round.roundNumber === lotteryData.roundNumber - 1
    )
  }

  get winningNumber() {
    return this.currentRound?.ticket ?? -1
  }

  get roundsWon() {
    return lotteryData.winningHistory.filter((round) => round.winner === this.userAddress)
  }

  showWinDialog = false
  showHistoryDialog = false

  /**
   * Function that allows a user to buy tickets
   */
  async buyTickets(tickets: number) {
    this.errorMsgStake = ''
    this.confirming = false

    const approvalContract = await tk.wallet.at(lotteryData.FA12TokenContract)
    const lotteryContract = await tk.wallet.at(config.LOTTERY_CONTRACT_ADDRESS)

    const batch = await this.lotterySmartContract.buyTicket(
      lotteryContract,
      approvalContract,
      tickets
    )

    this.stakeDialog = false // Close the stake dialog
    this.confirming = true

    await this.lotterySmartContract
      .sendBatch(batch)
      .then((confirmation) => {
        confirmation
          .confirmation()
          .then(() => {
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

  checkIfWonLottery() {
    if (this.previousRound?.winner === this.userAddress) this.showWinDialog = true
  }

  /**
   * Function that loads the required information before the mounting of the staking component
   */
  async beforeMount() {
    await this.tzkt.getLotteryData()
    await this.loadTokenContractData()
    // await this.templeWallet.setPermission()
    await this.loadWallet()
    this.loading = true
  }

  /**
   * Fnction that loads the FA1.2 Token smart contract storage data
   */
  async loadTokenContractData() {
    await this.tokenSmartContract.setStorage()
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
      //await this.computeStakingPacksData();

      this.checkIfWonLottery()
    }
  }

  /**
   * Function that computes wallet basic information and gathers information from staking and token contracts
   */
  async setWalletAddressInformation() {
    this.userAddress = await this.walletInUse.getWalletAddress()
    this.userBalance = await this.tokenSmartContract.getBalance(this.userAddress)
  }

  // /**
  //  * Function that displays the right error when the stake input value is not valid
  //  */
  // @Watch("amountToStake")
  // onAmountToStakeChange() {
  //   this.errorMsgStake = "";
  //   this.isStakeValid = true;
  //   if (Number(this.amountToStake) != 0) {
  //     if (isNaN(+this.amountToStake)) {
  //       this.errorMsgStake = "Please enter a numeric value.";
  //       this.isStakeValid = false;
  //     } else if (this.countDecimals(Number(this.amountToStake)) > 3) {
  //       this.errorMsgStake = "Only 3 decimals are accepted.";
  //       this.isStakeValid = false;
  //     } else if (this.minPrice > Number(this.amountToStake)) {
  //       this.errorMsgStake = "Amount too low";
  //       this.isStakeValid = false;
  //     }
  //   } else {
  //     this.errorMsgStake = "Please enter an amount";
  //     this.isStakeValid = false;
  //   }
  // }

  /**
   * Function that sets the amount to stake to the user's max balance
   */
  useMax() {
    this.amountToStake = this.userBalance
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
    await this.tzkt.getLotteryData()

    this.confirmed = true

    // Reset all error messages
    this.errormsg = ''

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
    await this.loadTokenContractData()
    this.loading = true
    await this.loadWallet()
    this.loading = true
  }

  onShownInput(value: any) {
    if (value === 'object') {
      this.numShownLottery = value.value
      return
    }
    this.numShownLottery = value
  }
}
