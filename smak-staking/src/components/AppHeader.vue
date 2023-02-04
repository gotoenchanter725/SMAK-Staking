<template>
  <header class="app-header">
    <OverlayDialog :show="walletError">
      <div class="alert notsuccessful">
        ⚠️
        <div class="text ml-3">{{ errorMsg }}</div>
      </div>
    </OverlayDialog>

    <v-row
      :class="
        mobileXxs && isWalletConnected && !drawer
          ? 'mx-1 mt-1 menu-wrapper small-screen-adapt'
          : 'mx-1 mt-1 menu-wrapper'
      "
      align="center"
      justify="space-between"
    >
      <v-col cols="auto" lg="4">
        <a href="https://www.smartlink.so/"
          ><img
            draggable="false"
            v-if="!mobile"
            class="logo-top"
            :src="
              theme === 'dark'
                ? require('@/assets/full-logo-dark.svg')
                : require('@/assets/full-logo-light.svg')
            "
          />
          <img
            v-if="mobile && !(mobileXxs && isWalletConnected && !drawer)"
            class="logo-top"
            style="width: auto; height: 35px"
            :src="require('@/assets/ticker.svg')"
          />
          <img
            v-if="mobileXxs && isWalletConnected && !drawer"
            class="logo-top"
            style="width: auto; height: 35px"
            :src="require('@/assets/full-logo-dark.svg')"
          />
        </a>
      </v-col>

      <v-col v-if="!tablet" cols="auto" lg="4" class="d-flex justify-center">
        <TopNavbar />
      </v-col>

      <v-col cols="auto" lg="4" class="d-flex justify-end">
        <div>
          <button @click="$store.commit('updateTheme', theme === 'light' ? 'dark' : 'light')">
            <img
              draggable="false"
              :src="theme === 'dark' ? require('@/assets/moon.png') : require('@/assets/sun.png')"
              class="switch"
            />
          </button>
          <button class="user-address" v-if="isWalletConnected">
            {{ shortedUserAddress }}
          </button>
          <button @click="signout()" class="signout" v-if="isWalletConnected">Sign out</button>
          <button v-if="!isWalletConnected" class="connect-wallet" @click="connectWallet('beacon')">
            Connect wallet
          </button>
          <button v-if="tablet" @click.stop="toggleDrawer">
            <v-icon class="menu-btn" v-if="!drawer"> mdi-menu </v-icon>
            <v-icon class="menu-btn" v-else> mdi-close </v-icon>
          </button>
        </div> 
      </v-col>
    </v-row>
    
    <div v-if="drawer && tablet" class="mobile-menu">
      <router-link
        class="item"
        :class="{ selected: $route.path === '/dashboard' || $route.path === '/' }"
        to="/dashboard"
        @click.native="closeDrawer()"
      >
        Dashboard
      </router-link>
      <router-link
        class="item"
        :class="{ selected: $route.path === '/vortex' && $route.query.tab !== 'liquidity' }"
        to="/vortex"
        @click.native="closeDrawer()"
      >
        Swap
      </router-link>
      <router-link
        class="item"
        :class="{ selected: $route.path === 'vortex' && $route.query.tab === 'liquidity' }"
        :to="{ path: 'vortex', query: { tab: 'liquidity' } }"
        @click.native="closeDrawer()"
      >
        Liquidity
      </router-link>
      <router-link
        class="item"
        :class="{ selected: $route.path === '/track' }"
        to="/track"
        @click.native="closeDrawer()"
      >
        Track
      </router-link>
      <router-link
        class="item"
        :class="{ selected: $route.path === '/earn/farms' }"
        to="/earn/farms"
        @click.native="closeDrawer()"
      >
        Farms
      </router-link>
      <router-link
        class="item"
        :class="{ selected: $route.path === '/charts' }"
        to="/charts"
        @click.native="closeDrawer()"
      >
        Charts
      </router-link>
      <router-link
        class="item"
        :class="{ selected: $route.path === '/earn/staking'}"
        to="/earn/staking"
        @click.native="closeDrawer()"
      >
        Stake
      </router-link>
      <router-link to="/win/lottery">
        <div class="item" :class="{ selected: $route.path === '/win/lottery' }">Lottery</div>
      </router-link>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { mapGetters, mapState } from 'vuex'
import OverlayDialog from '@/components/OverlayDialog.vue'
import TopNavbar from '@/components/TopNavbar.vue'

Vue.config.silent = true

@Component({
  components: { OverlayDialog, TopNavbar },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'showConnectedWallet', 'userAddress']),
    ...mapState(['theme', 'drawer']),
    ...mapGetters('wallet', ['walletInUse']),
  },
})
export default class AppHeader extends Vue {
  walletError = false // Show or hide the error alert
  errorMsg = '' // Error message in the error alert

  private isWalletConnected!: boolean
  private walletInUse!: any
  private userAddress!: string

  private drawer!: boolean // Navigation drawer on mobile (open/close)

  get shortedUserAddress(): string {
    const { userAddress } = this
    if (!userAddress) {
      return ''
    }

    return `${userAddress.substring(0, 4)}....${userAddress.substring(userAddress.length - 4)}`
  }

  get tablet(): boolean {
    return this.$vuetify.breakpoint.width < 1280
  }

  get mobile(): boolean {
    return this.$vuetify.breakpoint.width < 600
  }

  get mobileXxs(): boolean {
    return this.$vuetify.breakpoint.width < 370
  }

  /**
   * Function that allows the user to connect a wallet
   * @param {string} wallet: name of the used wallet by the client
   */
  async connectWallet(wallet: string): Promise<void> {
    this.$store.commit('wallet/updateWalletType', wallet)

    await this.walletInUse
      .setupWallet()
      .then(() => this.$store.dispatch('wallet/loadWallet'))
      .catch((error: { message: string }) => {
        this.walletErrorAlert(error.message)
      })

    await this.$store.dispatch('dexContracts/reloadBalances')
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

  /**
   * Function that allows a user to signout
   */
  async signout(): Promise<void> {
    this.$store.commit('wallet/updateShowConnectedWallet', false)
    await this.walletInUse.signOut()
    this.$store.commit('wallet/updateIsWalletConnected', false)
    this.$store.commit('wallet/updateUserAddress', '')
    this.$store.commit('wallet/updateBalance', 0)
    this.$store.dispatch('dexContracts/resetBalances', null, { root: true })
  }

  toggleDrawer(): void {
    this.$store.commit('updateMobileDrawer', !this.drawer)
  }

  closeDrawer(): void {
    this.$store.commit('updateMobileDrawer', false)
  }

  goToPage(path: string): void {
    this.$router.push(path)
    this.closeDrawer()
  }

  /**
   * Function that closes the mobile drawer if needed when going from the mobile display to desktop display
   */
  @Watch('mobile')
  endDrawer(): void {
    this.$store.commit('updateMobileDrawer', false)
  }
}
</script>
