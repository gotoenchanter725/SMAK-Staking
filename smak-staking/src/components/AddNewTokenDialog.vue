<template>
  <v-dialog
    v-model="showAddNewTokenDialog"
    :content-class="theme"
    :max-width="400"
    :width="400"
    transition="fade-transition"
    @close="resetData"
    @click:outside="close"
  >
    <div class="pannel add-new-token-dialog">
      <div class="modal-header">
        <h4>Select token type</h4>
        <div class="close-btn" @click="close">
          <h3>&times;</h3>
        </div>
      </div>

      <div class="fa-type-selection">
        <div
          :class="
            selectedTokenMode == 'FA12' ? 'fa-type-selection-btn selected' : 'fa-type-selection-btn'
          "
          @click="selectedTokenMode = 'FA12'"
        >
          FA 1.2
        </div>
        <div
          :class="
            selectedTokenMode == 'FA2' ? 'fa-type-selection-btn selected' : 'fa-type-selection-btn'
          "
          @click="selectedTokenMode = 'FA2'"
        >
          FA 2
        </div>
      </div>

      <div class="token-dialog-container">
        <div class="recipient-input-wrapper">
          <div class="input-row">
            <div class="description">Add token address</div>
            <input
              class="input-recipient"
              type="text"
              id="token"
              name="token"
              autocomplete="off"
              placeholder="KT1c578hd...."
              v-model="tokenAddress"
            />
          </div>
        </div>

        <div v-if="selectedTokenMode == 'FA2'" class="recipient-input-wrapper">
          <div class="input-row">
            <div class="description">Token Id</div>
            <input
              class="input-recipient"
              type="text"
              id="name"
              name="tokenId"
              autocomplete="off"
              placeholder="0"
              v-model="tokenId"
            />
          </div>
        </div>

        <div class="recipient-input-wrapper">
          <div class="input-row">
            <div class="description">Deposit amount</div>
            <input
              class="input-recipient"
              type="text"
              id="depositAmount"
              name="depositAmount"
              autocomplete="off"
              placeholder="0.0"
              v-model="tokenAmount"
            />
          </div>
        </div>

        <div class="recipient-input-wrapper">
          <div class="input-row">
            <div class="description">Your pair</div>
            <div class="select-pair-wrapper">
              <div class="select-pair">
                <img
                  style="margin-left: -6px"
                  src="https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png"
                  width="20px"
                  height="20px"
                />
                <h3 style="font-size: 16px">XTZ</h3>
              </div>
              <input
                class="input-recipient"
                type="text"
                id="recipient2"
                name="recipient2"
                autocomplete="off"
                placeholder="0.0"
                v-model="xtzAmount"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="rate-infos-wrapper">
        <p class="font-semibold">Rate</p>
        <p class="rate">1 XTZ = {{ getRate() }} TOKEN</p>
      </div>

      <button
        v-if="!isWalletConnected"
        @click="connectWallet()"
        class="add-token-btn w-full font-semibold"
      >
        Connect wallet
      </button>
      <button v-else @click="swapTokens" class="add-token-btn w-full font-semibold">
        Add new token
      </button>
      <!-- <div
        @click="swapTokens"
        style="font-weight: 600"
        class="add-token-btn"
      >
        Add new token
      </div> -->
    </div>
  </v-dialog>
</template>
<script lang="ts">
// Vuex
import { mapState, mapGetters } from 'vuex'

// Display
import { Component, Vue } from 'vue-property-decorator'
import { FaMode } from '@/store/swap'
import { TEZ_DECIMALS } from '@/constants'
import { isTokenWhitelisted } from '@/helpers/token.helper'

const AddNewTokenDialogProps = Vue.extend({
  props: {},
})

@Component({
  components: {},
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'tk']),
    ...mapState(['theme']),
    ...mapState('swap', ['showAddNewTokenDialog', 'selectedTokenMode', 'addToken']),
    ...mapGetters('wallet', ['walletInUse']),
  },
})
export default class AddNewTokenDialog extends AddNewTokenDialogProps {
  private walletInUse!: any

  /**
   * Add New Token Dialog
   */
  swapTokens(): void {
    if (
      !isTokenWhitelisted(this.$store.state.swap.tokenA.address, this.$store.state.swap.tokenA.tokenId) ||
      !isTokenWhitelisted(this.$store.state.swap.tokenB, this.$store.state.swap.tokenB.tokenId)
    ) {
      this.$store.commit('swap/updateWhitelistDialogType', 'addToken')
      this.$store.commit('swap/updateShowWhitelistDialog', true)
    } else {
      this.$store.dispatch('swap/launchExchange')
    }
  }

  async connectWallet(wallet = 'beacon'): Promise<void> {
    this.$store.commit('wallet/updateWalletType', wallet)

    await this.walletInUse.setupWallet().then(() => this.$store.dispatch('wallet/loadWallet'))

    await this.$store.dispatch('dexContracts/reloadBalances')
  }

  getRate(): string {
    if (this.xtzAmount && this.tokenAmount) {
      return (Number(this.tokenAmount) / Number(this.xtzAmount)).toFixed(TEZ_DECIMALS)
    }

    return '0'
  }

  get tokenAddress(): string {
    return this.$store.state.swap.addToken.tokenAddress
  }

  set tokenAddress(address: string) {
    this.$store.commit('swap/updateAddTokenAddress', address)
  }

  get tokenId(): string {
    return this.$store.state.swap.addToken.tokenId
  }

  set tokenId(id: string) {
    this.$store.commit('swap/updateAddTokenId', id)
  }

  get xtzAmount(): string {
    return this.$store.state.swap.addToken.xtzAmount
  }

  set xtzAmount(amount: string) {
    this.$store.commit('swap/updateAddTokenXtzAmount', amount)
  }

  get tokenAmount(): string {
    return this.$store.state.swap.addToken.tokenAmount
  }

  set tokenAmount(amount: string) {
    this.$store.commit('swap/updateAddTokenTokenAmount', amount)
  }

  get selectedTokenMode(): FaMode {
    return this.$store.state.swap.addToken.faMode
  }

  set selectedTokenMode(mode: FaMode) {
    this.$store.commit('swap/updateAddTokenFaMode', mode)
  }

  close(): void {
    this.$store.commit('swap/updateShowAddNewTokenDialog', false)
    this.resetData()
  }

  resetData(): void {
    this.$store.commit('swap/updateAddTokenAddress', '')
    this.$store.commit('swap/updateAddTokenId', '')
    this.$store.commit('swap/updateAddTokenXtzAmount', '')
    this.$store.commit('swap/updateAddTokenTokenAmount', '')
  }
}
</script>

<style lang="scss" scoped>
.add-new-token-dialog {
  color: var(--text);

  .token-dialog-container {
    @media only screen and (max-height: 740px) {
      overflow-y: auto;
      max-height: 40vh;
    }
  }

  .modal-header {
    display: flex;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    margin-top: 6px;
    margin-right: 4px;

    h4 {
      flex: 1;
      margin-top: 6px;
    }

    .close-btn {
      cursor: pointer;
      font-size: 27px;
      margin-top: -2px;
      margin-right: 4px;
    }
  }

  ::placeholder {
    color: rgb(117, 114, 160);
  }

  .fa-type-selection {
    display: flex;
    background-color: var(--connect-wallet-btn);
    border-radius: 9999em;
    width: calc(100px + 4 * 0.3rem);
    min-height: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;

    .fa-type-selection-btn {
      color: var(--connect-wallet-btn-txt);
      border-radius: 99999em;
      height: 100%;
      width: 50%;
      text-align: center;
      cursor: pointer;
      margin: 3px;
      padding: 0 0.3rem;
      padding: 0.2rem 0.2rem 0.2rem 0.2rem;
      margin: 0.2rem 0.2rem 0.2rem 0.2rem;
    }

    .selected {
      background-color: var(--active);
      color: white;
    }
  }

  .recipient-input-wrapper {
    background-color: var(--nested-pannel);
    padding: 1rem;
    padding-bottom: 2rem;
    border-radius: 1.1rem;
    border: 1px solid rgb(82 89 115 / 43%);
    margin-top: 0.5rem;

    .input-row {
      display: flex;
      flex-direction: column;

      .description {
        font-weight: 600;
      }

      .input-recipient {
        font-family: 'Source Code Pro';
        color: var(--text);
        text-align: right;
        font-size: 1.3rem;
        width: 100%;
      }
    }
  }

  .select-pair-wrapper {
    display: flex;
    margin-top: 1rem;

    .select-pair {
      display: flex;
      align-items: center;
      background: rgb(103 117 154 / 67%);
      padding: 0.1rem 0.9rem 0.2rem;
      border-radius: 999em;

      h3 {
        flex: 1;
        margin: 0 0.3rem;
      }
    }

    .input-recipient {
      flex: 1;
    }
  }

  .rate-infos-wrapper {
    display: flex;
    padding: 1rem 0 1rem 1rem;

    .rate {
      flex: 1;
      text-align: right;
      font-weight: 600;
      margin-right: 6px;
      margin-bottom: 7px;
    }
  }

  .add-token-btn {
    background-color: var(--connect-wallet-btn);
    border-radius: 15px;
    margin-top: -10px;
    padding: 14px;
    transition: 0.1s;
    color: var(--connect-wallet-btn-txt);
    text-align: center;

    &:hover {
      cursor: pointer;
      background-color: var(--active);
      color: white;
    }
  }
}

// Responsive
@media only screen and (max-width: 950px) {
}
</style>
