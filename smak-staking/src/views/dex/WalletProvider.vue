<template>
  <v-app class="theme-colors" :class="{ ...themeClass }">
    <v-main fill-height fluid>
      <div>
        <OverlayDialog :show="walletError">
          <div class="alert notsuccessful">
            ⚠️
            <div class="text ml-3">{{ errormsg }}</div>
          </div>
        </OverlayDialog>

        <OverlayDialog :show="isConfirmed">
          <div class="alert confirmation">
            <v-icon dark right> mdi-check-circle-outline </v-icon>
            <div class="text ml-3">Success</div>
          </div>
        </OverlayDialog>
        <OverlayDialog :show="confirming">
          <div class="alert confirmation">
            <div class="text ml-3">Confirming...</div>
          </div>
        </OverlayDialog>

        <v-row
          :class="
            mobileXxs & isWalletConnected & !drawer
              ? 'ml-5 mr-5 mt-1 menu-wrapper small-screen-adapt'
              : 'ml-5 mr-5 mt-1 menu-wrapper'
          "
          align="center"
          justify="space-between"
        >
          <v-col cols="auto">
            <a href="https://www.smartlink.so/"
              ><img
                draggable="false"
                v-if="!mobile"
                class="logo-top"
                :src="
                  theme === 'dark'
                    ? require('../../assets/full-logo-dark.png')
                    : require('../../assets/full-logo-light.png')
                "
              />
              <img
                v-if="mobile & !(mobileXxs & isWalletConnected & !drawer)"
                class="logo-top"
                style="width: auto; height: 35px"
                :src="require('../../assets/ticker.png')"
              />
              <img
                v-if="mobileXxs & isWalletConnected & !drawer"
                class="logo-top"
                style="width: auto; height: 35px"
                :src="require('../../assets/full-logo-dark.png')"
              />
            </a>
          </v-col>
          <v-col cols="auto" v-if="!mobile">
            <div class="menu">
              <div class="menu-item">Stake</div>
              <router-link to="/swap">
                <div class="menu-item" v-bind:class="{ selected: $route.name == 'Dex' }">Dex</div>
              </router-link>
              <router-link to="/pool">
                <div class="menu-item" v-bind:class="{ selected: $route.name == 'Pool' }">Pool</div>
              </router-link>
              <router-link to="/charts">
                <div class="menu-item" v-bind:class="{ selected: $route.name == 'Charts' }">
                  Charts
                </div>
              </router-link>
            </div>
          </v-col>
          <v-col cols="auto">
            <button
              v-if="!mobile"
              @click="$store.dispatch('updateTheme', theme === 'light' ? 'dark' : 'light')"
            >
              <img
                draggable="false"
                :src="
                  theme === 'dark'
                    ? require('../../assets/moon.png')
                    : require('../../assets/sun.png')
                "
                class="switch"
              />
            </button>
            <button class="user-address" v-if="isWalletConnected & !drawer">
              {{ userAddress }}
            </button>
            <button @click="signout()" class="signout" v-if="isWalletConnected & !drawer">
              Sign out
            </button>
            <button
              v-if="!isWalletConnected & !drawer & mobile"
              class="connect-wallet"
              @click="connectWallet('beacon')"
            >
              Connect wallet
            </button>
            <v-dialog
              v-if="!isWalletConnected & !drawer & !mobile"
              v-model="showConnectedWallet"
              :max-width="447"
              overlay-opacity="0.75"
              :content-class="theme"
              :hide-overlay="!showConnectedWallet"
              transition="fade-transition"
            >
              <template v-slot:activator="{ on }">
                <button v-on="on" class="connect-wallet">Connect wallet</button>
              </template>
              <div class="wallet-connection-dialog theme-colors" :class="{ ...themeClass }">
                <div class="dialog-title">Connect a wallet</div>

                <div class="text">
                  Please select a wallet to connect to the Smartlink Staking Dapp. You can find more
                  information about Tezos wallets by visiting
                  <a 
                    href="https://tezos.com/learn/store-and-use/" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span class="highlight">this page</span>
                  </a>.
                </div>
                <div class="wallet-buttons-wrapper">
                  <div class="wallet-button" @click="connectWallet('temple')">
                    <img width="25" height="25" :src="require('../../assets/temple.png')" />
                    <br />
                    Connect Temple
                  </div>

                  <div class="wallet-button" @click="connectWallet('beacon')">
                    <img width="25" height="25" :src="require('../../assets/beacon_logo.png')" />
                    <br />
                    Select wallet
                  </div>
                </div>
              </div>
            </v-dialog>
            <button v-if="mobile" @click.stop="drawer = !drawer">
              <v-icon class="menu-btn"> mdi-menu </v-icon>
            </button>
          </v-col>
        </v-row>
      </div>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import OverlayDialog from '@/components/OverlayDialog.vue'
import Dex from '@/components/Dex.vue'
import { WalletBeacon } from '@/modules/wallets/beaconWallet'

const HeaderProps = Vue.extend({
  props: {
    errormsg: String,
    action: String,
    confirming: Boolean,
    walletError: Boolean,
  },
})

@Component({
  components: {
    OverlayDialog,
    Dex,
  },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'showConnectedWallet', 'userAddress', 'tk']),
    ...mapState('notificationCenter', ['isConfirmed', 'confirming']),
    ...mapState(['theme']),
  },
})
export default class Header extends HeaderProps {
  private beaconWallet: WalletBeacon = new WalletBeacon(this.tk)
  private walletType = ''

  private drawer = false // Navigation drawer on mobile (open/close)

  get tk() {
    return this.$store.state.wallet.tk
  }

  async beforeMount() {
    await this.loadWallet()
    await this.$store.dispatch('dexContracts/loadDexContractData')
  }

  /**
   * Function that checks if there is a connected wallet provider
   */
  async isWalletProvierConnected() {
    const isBeaconConnected = await this.beaconWallet.isConnected()

    this.$store.commit('wallet/updateIsWalletConnected', isBeaconConnected)
  }

  /**
   * Function that computes wallet basic information and gathers information from staking and token contracts
   */
  async setWalletAddressInformation() {
    console.log('wallet', this.walletInUse())
    this.$store.commit('wallet/updateUserAddress', await this.walletInUse().getWalletAddress())
  }

  /**
   * Function that loads wallet information
   */
  async loadWallet() {
    await this.isWalletProvierConnected()

    if (this.$store.state.wallet.isWalletConnected) {
      this.walletType = 'beacon'
      this.tk.setWalletProvider(this.walletInUse().getWallet())
      await this.setWalletAddressInformation()

      await this.$store.dispatch('dexContracts/loadDexContractData')
      await this.$store.dispatch('wallet/updateBalance')
    }
  }

  /**
   * Function that allows the user to connect a wallet
   */
  async connectWallet(wallet: string) {
    this.walletType = wallet
    await this.walletInUse()
      .setupWallet()
      .then(() => this.loadWallet())
      .catch((error) => {
        this.walletErrorAlert(error.message)
      })
  }

  /**
   * Function that manages the wallet error alert
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
   * Function that sets the wallet in use if there is any
   */
  walletInUse() {
    return this.beaconWallet
  }

  /**
   * Function that allows a user to signout
   */
  async signout() {
    this.$store.commit('wallet/updateShowConnectedWallet', false)
    await this.walletInUse().signOut()
    this.$store.commit('wallet/updateIsWalletConnected', false)
    this.$store.commit('wallet/updateUserAddress', '')
  }

  get themeClass(): any {
    // Computed variable to switch theme
    return {
      light: this.$store.state.theme === 'light',
      dark: this.$store.state.theme === 'dark',
    }
  }

  get mobileXxs(): boolean {
    return this.$vuetify.breakpoint.width < 370
  }

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
    return this.$vuetify.breakpoint.width < 415
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
}
</script>

<style lang="scss" src="./dex.scss"></style>
