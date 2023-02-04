<template>
  <div class="my-wallet">
    <div class="my-wallet__displays">
      <div class="my-wallet__display">
        <div class="my-wallet__title-container">
          <img src="@/assets/smak-logo.svg" alt="" />
          <h3 class="my-wallet__brand-title">SMAK</h3>
        </div>
        <h6 class="my-wallet__label">Live price</h6>
        <p class="my-wallet__value">
          $ {{ smakPrice }}
          <span
            class="my-wallet__percentage"
            :class="{ 'my-wallet__percentage--positive': smakVar > 0 }"
          >
            {{ smakVar }}%
          </span>
        </p>
      </div>

      <div class="my-wallet__display">
        <div class="my-wallet__title-container">
          <img v-if="theme === 'dark'" src="@/assets/wallet-icon.svg" alt="" />
          <img v-else src="@/assets/wallet-icon--light.svg" alt="" />
        </div>
        <h6 class="my-wallet__label">SMAK Balance</h6>
        <p class="my-wallet__value">{{ userBalance.toLocaleString('en-US') }}</p>
      </div>
    </div>

    <button v-if="!isWalletConnected" @click="connectWallet()" class="my-wallet__button">
      Connect wallet
    </button>
    <button v-else @click="signout()" class="my-wallet__button my-wallet__button--white">
      Sign out
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapState, mapActions, mapGetters } from 'vuex'

import { WalletBeacon } from '@/modules/wallets/beaconWallet'

@Component({
  computed: {
    ...mapState(['theme']),
    ...mapState('wallet', ['userBalance', 'smakPrice', 'smakVar', 'isWalletConnected', 'tk']),
    ...mapGetters('wallet', ['walletInUse']),
  },
  methods: {
    ...mapActions({
      updateSmakPrice: 'wallet/updateSmakPrice',
      updateSmakVar: 'wallet/updateSmakVar',
    }),
  },
})
export default class MyWallet extends Vue {
  private updateSmakPrice!: () => any
  private updateSmakVar!: () => any
  private tk!: any
  private walletInUse!: any

  private beaconWallet: WalletBeacon = new WalletBeacon(this.tk)
  walletType = ''
  smakPrice!: number
  smakVar!: number
  isWalletConnected!: boolean
  theme!: string
  userBalance!: number

  async beforeMount(): Promise<void> {
    await this.updateSmakPrice()
    await this.updateSmakVar()
  }

  async isWalletProvierConnected() {
    const isBeaconConnected = await this.beaconWallet.isConnected()

    this.$store.commit('wallet/updateIsWalletConnected', isBeaconConnected)
  }

  async setWalletAddressInformation() {
    this.$store.commit('wallet/updateUserAddress', await this.walletInUse().getWalletAddress())
  }

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

  async signout() {
    // this.$store.commit('wallet/updateShowConnectedWallet', false)
    // await this.walletInUse().signOut()
    // this.$store.commit('wallet/updateIsWalletConnected', false)
    // this.$store.commit('wallet/updateUserAddress', '')
    this.$store.commit('wallet/updateShowConnectedWallet', false)
    await this.walletInUse.signOut()
    this.$store.commit('wallet/updateIsWalletConnected', false)
    this.$store.commit('wallet/updateUserAddress', '')
    this.$store.commit('wallet/updateBalance', 0)
    this.$store.dispatch('dexContracts/resetBalances', null, { root: true })
  }

  async connectWallet(wallet = 'beacon'): Promise<void> {
    this.$store.commit('wallet/updateWalletType', wallet)

    await this.walletInUse.setupWallet().then(() => this.$store.dispatch('wallet/loadWallet'))

    await this.$store.dispatch('dexContracts/reloadBalances')
  }
}
</script>

<style lang="scss" scoped>
.my-wallet {
  display: flex;
  flex-direction: column;

  padding: 1.5rem;
  background-color: var(--pannel-dashboard);

  width: 100%;
  height: 220px;

  border: 0.5px solid var(--pannel-border);
  border-radius: 20px;

  &__title-container {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    grid-gap: 0.5rem;
    margin: 0;
    align-items: center;
  }

  &__brand-title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 18px;
    margin: 0;
  }

  &__label {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 17px;
    color: var(--text2-dashboard);
    margin-bottom: 0;
  }

  &__value {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-weight: 600;
    font-size: 16px;
    margin: 0;
  }

  &__percentage {
    background-color: #5f3b43;
    width: 51px;
    height: 20px;
    border-radius: 0.5rem;
    margin-left: 0.25rem;
    padding: 0.125rem 0.5rem;

    color: #ff7c7c;
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-align: center;

    &--positive {
     background-color: var(--price-background);
    color: var(--price-color);
    }
  }

  &__displays {
    height: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    margin-bottom: 0.5rem;
  }

  &__display {
    display: grid;
    grid-auto-flow: row;
    grid-auto-rows: max-content;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  &__button {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    background: var(--wallet-connect-button);
    color: var(--wallet-connect-text);
    height: 48px;
    width: 100%;
    border-radius: 15px;
    text-align: center;
    transition: all 0.1s ease;
    flex-shrink: 0;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      box-shadow: inset 1px 1px 10px #4b43a3;
    }

    &--white {
      color: var(--white);
    }
  }
}

@media only screen and (max-width: 700px) {
  .my-wallet {
    height: 203px;

    &__display {
      gap: 0.5rem;
    }
  }
}
</style>
