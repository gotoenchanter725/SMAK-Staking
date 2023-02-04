/**
 * @module smak-staking
 * @author Smart-Chain
 * @version 1.2.0
 * This module computes every smak global layout in order to display them through the App.vue file
 */

import { mapState, mapGetters } from 'vuex'
import { Component, Vue, Watch } from 'vue-property-decorator'

// Config
import { TezosToolkit } from '@taquito/taquito'

// Components
import AppHeader from '@/components/AppHeader.vue'
import OverlayDialog from '@/components/OverlayDialog.vue'

@Component({
  components: {
    AppHeader,
    OverlayDialog,
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
    ...mapState('notificationCenter', [
      'isConfirmed',
      'confirming',
      'errorMessage',
      'showErrorMessage',
    ]),
    ...mapState(['theme']),
    ...mapGetters('wallet', ['walletInUse']),
    ...mapGetters(['themeClass']),
  },
})
export default class App extends Vue {
  /**
   * VUEJS DISPLAY
   */
  walletError = false // Show or hide the error alert
  errorMsg = '' // Error message in the error alert
  errorMessage!: string
  showErrorMessage!: boolean

  // Dialogs variables
  stakeDialog = false

  /**
   * WALLET
   */
  private templeWallet!: any

  /**
   * FA 1.2 TOKEN SMART CONTRACT
   */
  private tokenSmartContract!: any
  private tk!: TezosToolkit

  created() {
    this.$store.commit('updateTheme', this.getCookie('theme') || 'dark')
  }
  /**
   * Function that loads the required information before the mounting of the staking component
   */
  async beforeMount(): Promise<void> {
    this.$store.dispatch('tokens/getXtzUsdPrice')
    await Promise.all([
      this.$store.dispatch('pools/getPools'),
      this.tokenSmartContract.setStorage(),
    ])
    await this.$store.dispatch('wallet/loadWallet')
    this.$store.dispatch('dexContracts/loadSmakDexContractData')
    this.$store.dispatch('dexContracts/loadDexContractData')
  }

  getCookie(name: string) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    if (parts.length === 2) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return parts.pop().split(';').shift()
    }

    return ''
  }

  /**
   * Function that manages the wallet error alert
   * @param {string} error : Error to display
   */
  walletErrorAlert(error: string): void {
    this.walletError = true
    this.errorMsg = error
    window.setTimeout(() => {
      this.errorMsg = ''
      this.walletError = false
    }, 3000)
  }
}
