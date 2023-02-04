<template>
  <DexLayout>
    <template v-slot:card>
      <div class="swap-wrapper pannel px-5">
        <div class="swap-config-button-wrapper">
          <v-icon
            class="swap-config-button"
            style="right: -10px; top: 1px; color: var(--text-unselected) !important"
            color="white"
            @click="showSwapConfigModal = !showSwapConfigModal"
          >
            mdi-cog-outline
          </v-icon>
        </div>
        <div class="stake-options">
          <div
            class="stake-options-item"
            :class="dexAction == 'swap' ? 'selected' : ''"
            v-on:click="$store.dispatch('swap/updateDexAction', 'swap')"
          >
            Swap
          </div>
          <div
            class="stake-options-item"
            :class="dexAction == 'send' ? 'selected' : ''"
            v-on:click="$store.dispatch('swap/updateDexAction', 'send')"
          >
            Send
          </div>
          <div
            class="stake-options-item"
            :class="dexAction == 'liquidity' ? 'selected' : ''"
            v-on:click="$store.dispatch('swap/updateDexAction', 'liquidity')"
          >
            Liquidity
          </div>
        </div>

        <SwapLiquidityInfoDialog />
        <SwapChooseTokenDialog />
        <SwapConfirmationDialog />
        <SwapConfigModal />
        <SwapWhitelistTokenDialog />
        <AddNewTokenDialog />
        <AddLiquiditySuccessDialog />

        <div v-if="dexAction != 'liquidity'">
          <div class="token-input-wrapper tokenA">
            <div class="input-row">
              <div
                class="open-token-dialog-button"
                v-on:click="
                  $store.state.dexContracts.areContractsLoaded
                    ? openSwapChooseTokenDialog('tokenA')
                    : null
                "
                v-bind:class="{
                  noicon: tokenMetadataA.thumbnailUri == '',
                  nopointer: !$store.state.dexContracts.areContractsLoaded,
                }"
              >
                <div class="token-logo-wrapper">
                  <img :src="tokenMetadataA.thumbnailUri" alt="token logo" />
                </div>

                <div
                  class="token-name-wrapper"
                  :class="{
                    'token-name-wrapper__ellipsis': tokenA.address,
                  }"
                >
                  {{
                    tokenA.address
                      ? tokenA.address == 'XTZ'
                        ? 'XTZ'
                        : getSwapContractForToken(tokenA.address, tokenA.tokenId).tokenContract.metadata.symbol
                      : 'loading...'
                  }}
                </div>

                <div>
                  <img
                    class="arrow-down"
                    src="https://www.smartlink.so/wp-content/uploads/2021/09/Frame-2-min-1.png"
                  />
                </div>
              </div>

              <input
                class="input-amount focus:placeholder-none pl-3"
                type="text"
                name="amount"
                autocomplete="off"
                placeholder="0"
                v-model="amountTokenA"
                v-on:keypress="isNumber($event)"
              />
            </div>

            <v-row v-if="$store.state.swap.errors.swapAmountA">
              <v-col>
                <div
                  style="font-size: 12px; font-family: 'Source Sans Pro'; font-weight: 600"
                  class="error-msg"
                >
                  {{ $store.state.swap.errors.swapAmountA }}
                </div>
              </v-col>
            </v-row>

            <div
              class="balance"
              v-bind:class="{
                noopacity: $store.state.swap.tokenA.address == '',
              }"
            >
              Balance: {{ Math.floor(getTokenBalance('tokenA') * 10 ** getTokenMetadata('tokenA').decimals)/(10 ** getTokenMetadata('tokenA').decimals) | readableNumber(tokenMetadataA.decimals) }}
              {{ tokenMetadataA.symbol }}
              <a style="color:#98AFFF; font-weight=600;" @click="amountTokenA = Math.floor(getTokenBalance('tokenA') * 10 ** getTokenMetadata('tokenA').decimals)/(10 ** getTokenMetadata('tokenA').decimals)">(Max)</a>
            </div>
          </div>

          <div class="token-input-wrapper tokenB">
            <button class="swap-button" @click="inverseTokens">
              <img v-if="theme === 'dark'" src="@/assets/swap-icon.svg" alt="" />
              <img v-else src="@/assets/swap-icon--black.svg" alt="" />
            </button>

            <div class="input-row">
              <div
                class="open-token-dialog-button"
                v-on:click="
                  $store.state.dexContracts.areContractsLoaded
                    ? openSwapChooseTokenDialog('tokenB')
                    : null
                "
                v-bind:class="{
                  noicon: tokenMetadataB.thumbnailUri == '',
                  nopointer: !$store.state.dexContracts.areContractsLoaded,
                }"
              >
                <div class="token-logo-wrapper">
                  <img :src="tokenMetadataB.thumbnailUri" alt="token logo" />
                </div>
                <div
                  class="token-name-wrapper"
                  :class="{
                    'token-name-wrapper__ellipsis': tokenB.address,
                  }"
                >
                  {{
                    tokenB.address
                      ? tokenB.address == 'XTZ'
                        ? 'XTZ'
                        : getSwapContractForToken(tokenB.address, tokenB.tokenId).tokenContract.metadata.symbol
                      : 'loading...'
                  }}
                </div>
                <div>
                  <img
                    class="arrow-down"
                    src="https://www.smartlink.so/wp-content/uploads/2021/09/Frame-2-min-1.png"
                  />
                </div>
              </div>

              <input
                class="input-amount focus:placeholder-none pl-3"
                type="text"
                name="amount2"
                autocomplete="off"
                placeholder="0"
                v-model="amountTokenB"
                v-on:keypress="isNumber($event)"
              />
            </div>

            <v-row v-if="$store.state.swap.errors.swapAmountB">
              <v-col>
                <div
                  style="font-size: 12px; font-family: 'Source Sans Pro'; font-weight: 600"
                  class="error-msg"
                >
                  {{ $store.state.swap.errors.swapAmountB }}
                </div>
              </v-col>
            </v-row>

            <div
              class="balance"
              v-bind:class="{
                noopacity: $store.state.swap.tokenB.address == '',
              }"
            >
              Balance: {{ getTokenBalance('tokenB') | readableNumber(tokenMetadataB.decimals) }}
              {{ getTokenMetadata('tokenB').symbol }}
            </div>
          </div>

          <div 
            v-if="dexAction == 'send'"
            class="recipient-input-wrapper"
            :class="{
              'border-error': !isValidTezosAddress
            }"
          >
            <div class="input-row">
              <div class="description">
                Recipient Address
              </div>
              <p
                v-if="!isValidTezosAddress"
                class="error-msg font-ssp font-bold text-12px"
              >
                Please provide valid Tezos address
              </p>
              <input
                class="input-recipient"
                type="text"
                id="name"
                name="tz1..."
                autocomplete="off"
                placeholder="tz1..."
                v-model="recipientAddress"
              />
            </div>
          </div>

          <div class="slippage-wrapper">
            <div class="description">Slippage tolerance</div>
            <div class="slippage">{{ config.slippage }}%</div>
          </div>

          <div v-if="!isWalletConnected" @click="connectWallet()" class="connect-wallet-btn">
            Connect wallet
          </div>

          <div 
            v-if="isWalletConnected"
            class="connect-wallet-btn connected"
            :class="{
              'pointer-events-none opacity-50 bg-secondary': $store.state.swap.errors.swapAmountA || $store.state.swap.errors.swapAmountB
            }"
            @click="swapTokens">
            {{ dexAction === 'send' ? 'Send' : 'Swap' }}
          </div>

          <div class="swap-info pannel extra-info px-5">
            <div class="line">
              <div class="description">
                Minimum received

                <InfoTooltip class="ml-1">
                  <div class="whitespace-nowrap">
                    Your transaction will revert  if there is <br> 
                    a large, unfavorable price movement <br>
                    before it is confirmed.
                  </div>
                </InfoTooltip>
              </div>
              <div class="value">{{ getMinimumReceived() }} {{ getTokenBMetadata().symbol }}</div>
            </div>
            <div class="line">
              <div class="description">
                Price impact

                <InfoTooltip class="ml-1">
                  <div class="whitespace-nowrap">
                    The difference between the market price <br>
                    and estimated price due to trade size.
                  </div>
                </InfoTooltip>
              </div>
              <div class="value">{{ priceImpact.toFixed(2) }}%</div>
            </div>
            <div class="line">
              <div class="description">
                Liquidity provider fee

                <InfoTooltip class="ml-1">
                  <div class="whitespace-nowrap">
                    <span class="d-inline-block mb-3">For each trade a 0.28% fee is paid</span><br />
                    - 0.25% to LP token holders <br />
                    - 0.01% to the Treasury <br />
                    - 0.02% towards SMAK buyback and burn
                  </div>
                </InfoTooltip>
              </div>
              <div class="value">{{ getLiquidityProviderFee() }}</div>
            </div>
          </div>
        </div>

        <div v-if="dexAction == 'liquidity'">
          <add-liquidity></add-liquidity>
        </div>
      </div>
    </template>

    <template v-slot:graph>
      <dex-graph></dex-graph>
    </template>
  </DexLayout>
</template>

<script lang="ts">
// Vuex
import { mapState, mapGetters } from 'vuex'

// Display
import { Component, Vue, Watch } from 'vue-property-decorator'

import DexLayout from '@/layouts/DexLayout.vue'

import SwapChooseTokenDialog from '@/components/SwapChooseTokenDialog.vue'

import SwapLiquidityInfoDialog from '@/components/SwapLiquidityInfoDialog.vue'
import SwapConfirmationDialog from '@/components/SwapConfirmationDialog.vue'
import DexGraph from '@/components/DexGraph.vue'
import InfoTooltip from '@/components/shared/InfoTooltip.vue'
import AddLiquidity from '@/components/AddLiquidity.vue'
import SwapConfigModal from '@/components/SwapConfigModal.vue'
import SwapWhitelistTokenDialog from '@/components/SwapWhitelistTokenDialog.vue'
import AddNewTokenDialog from '@/components/AddNewTokenDialog.vue'
import { getUserBalanceForToken, tokenAddressToMetadata } from '@/store/dexContracts'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { ISwapConfig, ISwapTokenInfo } from '@/store/swap'
import AddLiquiditySuccessDialog from '@/components/AddLiquiditySuccessDialog.vue'
import { validationMixin } from 'vuelidate'
import { isValidTezosAddress } from '@/validations/tezos.validation'
import { numberMixin } from '@/mixins/number.mixin'
import { isTokenWhitelisted } from '@/helpers/token.helper'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import vClickOutside from 'v-click-outside'
import { tokenIdentifier } from '../helpers/token.helper';
import { EMPTY_METADATA } from '@/constants/tokens.const'

const DexProps = Vue.extend({
  props: {
    isWalletConnected: Boolean,
  },
})

@Component({
  mixins: [validationMixin, numberMixin],
  components: {
    AddLiquidity: Vue.extend(AddLiquidity),
    DexLayout: Vue.extend(DexLayout),
    DexGraph: Vue.extend(DexGraph),
    SwapChooseTokenDialog: Vue.extend(SwapChooseTokenDialog),
    SwapConfirmationDialog: Vue.extend(SwapConfirmationDialog),
    SwapConfigModal: Vue.extend(SwapConfigModal),
    SwapWhitelistTokenDialog: Vue.extend(SwapWhitelistTokenDialog),
    AddNewTokenDialog: Vue.extend(AddNewTokenDialog),
    AddLiquiditySuccessDialog: Vue.extend(AddLiquiditySuccessDialog),
    SwapLiquidityInfoDialog: Vue.extend(SwapLiquidityInfoDialog),
    InfoTooltip: Vue.extend(InfoTooltip),
  },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'tk']),
    ...mapState(['theme']),
    ...mapState('swap', [
      'tokenA',
      'tokenB',
      'graphLoading',
      'graph',
      'config',
      'dexAction',
      'showSwapConfigModal',
      'priceImpact',
      'showLiquidityInfoDialog',
    ]),
    ...mapState('dexContracts', ['swapContracts']),
    ...mapGetters('wallet', ['walletInUse']),
    ...mapState('dexContracts', ['areContractsLoaded']),
    ...mapGetters('tokens', ['tokensMetadata'])
  },
  directives: {
    clickOutside: vClickOutside.directive,
  },
  validations: {
    recipientAddress: {
      isValidTezosAddress
    }
  },
})
export default class Dex extends DexProps {
  /**
   * DEX
   */

  // Alerts
  walletError = false // Show or hide the error alert
  errormsg = ''
  private minimumReceived = 0
  private config!: ISwapConfig
  private priceImpact!: number
  private tokenB!: ISwapTokenInfo
  private walletInUse!: any
  dexAction!: string
  areContractsLoaded!: boolean
  tokensMetadata!: { [key: string]: ITokenMetadata }

  get isValidTezosAddress() {
    const { isValidTezosAddress, $dirty } = this.$v.recipientAddress
    return isValidTezosAddress || !$dirty
  }

  swapTokens(): void {
    this.$v.$touch()

    if (this.$v.$invalid && this.dexAction === 'send') return

    if (
      !isTokenWhitelisted(this.$store.state.swap.tokenA.address, this.$store.state.swap.tokenA.tokenId)
      || !isTokenWhitelisted(this.$store.state.swap.tokenB.address, this.$store.state.swap.tokenB.tokenId)
      
    ) {
      this.$store.commit('swap/updateWhitelistDialogType', 'swap')
      this.$store.commit('swap/updateShowWhitelistDialog', true)
    } else {
      this.$store.commit('swap/updateShowSwapConfirmationDialog', true)
    }
  }

  @Watch('$route.query.tab')
  updateDexAction(): void {
    this.$store.dispatch('swap/updateDexAction', this.$route.query.tab || 'swap')
  }

  async mounted() {
    if (this.$route.query.tab) {
      await this.$store.dispatch('swap/updateDexAction', this.$route.query.tab)
    }
  }

  getMinimumReceived(): string {
    return ((Number(this.tokenB.amount) * (100 - this.config.slippage)) / 100).toFixed(
      this.getTokenBMetadata().decimals
    )
  }

  getLiquidityProviderFee(): string {
    return (Number(this.tokenB.amount) * 0.0025).toFixed(this.getTokenBMetadata().decimals)
  }

  getTokenBMetadata(): ITokenMetadata {
    if (this.tokenB.address) {
      const identifier = tokenIdentifier({ address: this.tokenB.address, tokenId: this.tokenB.tokenId })
      
      return this.tokensMetadata[identifier] || EMPTY_METADATA
    }
    
    return EMPTY_METADATA
  }

  /**
   * Function that loads the required information before the mounting of the staking component
   */
  async beforeMount() {
    await this.$store.dispatch('swap/loadGraphData')
  }

  async inverseTokens() {
    await this.$store.dispatch('swap/inverseTokens')
  }

  async connectWallet(wallet = 'beacon'): Promise<void> {
    this.$store.commit('wallet/updateWalletType', wallet)
    await this.walletInUse.setupWallet().then(() => this.$store.dispatch('wallet/loadWallet'))
    await this.$store.dispatch('dexContracts/reloadBalances')
  }

  get tokenMetadataA() {
    return this.getTokenMetadata('tokenA')
  }

  get tokenMetadataB() {
    return this.getTokenMetadata('tokenB')
  }

  getTokenMetadata(token: 'tokenA' | 'tokenB') {
    const tokenAddress = this.$store.state.swap[token].address
    const tokenId = this.$store.state.swap[token].tokenId

    if (this.tokenB.address) {
      const identifier = tokenIdentifier({ address: tokenAddress, tokenId: tokenId })
      
      return this.tokensMetadata[identifier] || EMPTY_METADATA
    }
    
    return EMPTY_METADATA
  }

  get tk() {
    return this.$store.state.wallet.tk
  }

  getTokenBalance(token: 'tokenA' | 'tokenB'): number {
    const tokenAddress = this.$store.state.swap[token].address
    const tokenId = this.$store.state.swap[token].tokenId
    const metadata = tokenAddressToMetadata(tokenAddress, tokenId, this.$store.state.dexContracts)
    if (tokenAddress)
      return (
        getUserBalanceForToken(
          tokenAddress,
          tokenId,
          this.$store.state.dexContracts,
          this.$store.state.wallet
        ) * Math.pow(10, -metadata.decimals)
      )
    else return 0
  }

  get recipientAddress() {
    return this.$store.state.swap.recipientAddress
  }

  set recipientAddress(recipientAddress: string) {
    this.$store.commit('swap/updateRecipientAddress', recipientAddress)
  }

  get amountTokenA() {
    return this.$store.state.swap.tokenA.amount
  }

  set amountTokenA(amount: number) {
    this.$store.dispatch('swap/updateTokenAmount', {
      whichToken: 'tokenA',
      amount: amount,
    })
  }

  get swapContracts() {
    return this.$store.state.dexContracts.swapContracts
  }

  getSwapContractForToken(tokenAddress: string, tokenId: number) {
    const swapContractAddress =
      this.$store.state.dexContracts.tokenAddressToSwapContractAddress[tokenAddress][tokenId]
    return this.swapContracts[swapContractAddress]
  }

  get amountTokenB() {
    return this.$store.state.swap.tokenB.amount
  }

  set amountTokenB(amount: number) {
    this.$store.dispatch('swap/updateTokenAmount', {
      whichToken: 'tokenB',
      amount: amount,
    })
  }

  get showSwapConfigModal() {
    return this.$store.state.swap.showSwapConfigModal
  }

  set showSwapConfigModal(show: boolean) {
    this.$store.commit('swap/updateShowSwapConfigModal', show)
  }

  openSwapChooseTokenDialog(currentTokenModified: 'tokenA' | 'tokenB') {
    this.$store.commit('swap/updateCurrentTokenModified', currentTokenModified)
    this.$store.commit('swap/updateShowTokenSelectionDialog', true)
  }

  displaySwapConfigModal($event: any) {
    this.showSwapConfigModal = !this.showSwapConfigModal
  }

  get tokenAddresses(): string[] {
    return Object.keys(this.swapContracts).map(
      (address: string) => this.swapContracts[address].swapContract.storage.tokenAddress
    )
  }

  countDecimals(value: number) {
    if (value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    } else return 0
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

  isNumber($event: any) {
    let keyCode = ($event.keyCode ? $event.keyCode : $event.which);
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
      $event.preventDefault();
    }
  }

}
</script>

<style lang="scss" scoped>
.nopointer {
  cursor: default !important;
}

.noopacity {
  opacity: 0;
}

.swap-wrapper.pannel {
  position: relative;
  flex-grow: 0;
  padding-top: 8px;

  .swap-info {
    position: absolute;
    top: calc(100% + 1rem);
  }
}

.swap-config-button-wrapper {
  text-align: right;

  .swap-config-button {
    &:hover {
      cursor: pointer;
    }

    &:focus:after {
      opacity: 0;
    }
  }
}

.pannel {
  width: 100%;
  margin-bottom: 16px;

  &.extra-info {
    font-size: 0.8rem;
    font-weight: 600;
    font-family: 'Source Sans Pro';
    width: 94%;
    margin-left: -7px;
    padding: 20px;

    .line {
      display: flex;

      .description {
        display: flex;
        flex: 1;
      }

      .value {
        display: flex;
      }
    }
  }
}

.token-input-wrapper {
  background-color: var(--nested-pannel);
  padding: 1rem;
  padding-bottom: 2rem;
  border-radius: 1.5rem;
  border: 1px solid var(--pannel-border);

  .input-row {
    display: flex;

    .open-token-dialog-button {
      background-color: rgba(91, 88, 201);
      cursor: pointer;
      display: ruby;
      padding: 0rem 1rem;
      padding-left: 2.2rem;
      font-size: 0.8rem;
      height: 1.8rem;
      border-radius: 100px;
      position: relative;
      min-width: 8em;

      .token-logo-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        display: flex;
        height: 100%;
        align-items: center;
        padding-left: 0.5rem;

        img {
          height: 70%;
        }
      }

      .token-name-wrapper {
        display: inline-block;
        height: 100%;
        font-weight: 600;
        color: white;
        margin: 0.28rem 16px 0 0;
        max-width: 45px;

        &__ellipsis {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      &.noicon {
        padding-left: 1rem;

        img {
          display: none;
        }
      }
    }

    .input-amount {
      font-family: 'Source Code Pro';
      color: var(--text);
      text-align: right;
      font-size: 1.5rem;
      width: 100%;
    }
  }

  .balance {
    font-size: 0.9rem;
    font-family: 'Source Sans Pro';
    margin-top: 1.5rem;
    margin-bottom: -1.2rem;
  }

  &.tokenA {
    margin-bottom: 0.5rem;
  }

  &.tokenB {
    position: relative;

    .swap-button {
      position: absolute;
      background-color: var(--nested-pannel);
      margin: 0 0 0 -14px;
      top: -24px;
      left: 50%;
      height: 38px;
      width: 38px;
      line-height: 28px;
      border: 2px solid var(--pannel);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      svg,
      img {
        fill: red;
        width: 80%;
      }
    }

    .open-token-dialog-button {
      background-color: #8488b5;
    }
  }
}

.recipient-input-wrapper {
  background-color: var(--nested-pannel);
  padding-bottom: 1.5rem;
  padding-top: 1.5rem;
  padding-right: 1.2rem;
  padding-left: 1.2rem;
  font-weight: 500;
  border-radius: 1.5rem;
  border: 1px solid var(--pannel-border);
  margin-top: 0.5rem;

  .input-row {
    display: flex;
    flex-direction: column;
    font-family: 'Source Sans Pro';
    font-weight: 600;

    .description {
    }

    .input-recipient {
      font-family: 'Source Sans Pro';
      color: var(--text);
      text-align: right;
      font-size: 1.2rem;
      width: 100%;
    }
  }
}

.arrow-down {
  width: 14px;
  display: flex;
  float: right;
  position: absolute;
  bottom: 7px;
  right: 10px;
}

.slippage-wrapper {
  display: flex;
  padding: 0 0.5rem;
  margin: 1rem 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--slippage-tol);
  font-family: 'Source Sans Pro';

  .description {
    flex: 1;
  }
}

@media only screen and (max-width: 700px) {
  .pannel {
  }
}
</style>
