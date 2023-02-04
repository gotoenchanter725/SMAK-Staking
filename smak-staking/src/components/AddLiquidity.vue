<template>
  <div>
    <div class="token-input-wrapper tokenA">
      <div class="input-row">
        <div
          class="open-token-dialog-button nopointer"
          v-bind:class="{
            noicon: tokenMetadataA.thumbnailUri == '',
          }"
        >
          <div class="token-logo-wrapper">

            <TokenImage :src="tokenMetadataA.thumbnailUri" alt="xtz logo" />
          </div>
          <div class="token-name-wrapper">
            {{
              tokenA.address
                ? tokenA.address == 'XTZ'
                  ? 'XTZ'
                  : getSwapContractForToken(tokenA.address, tokenA.tokenId).tokenContract.metadata.symbol
                : 'Loading...'
            }}
          </div>
        </div>

        <input
          class="input-amount"
          type="text"
          id="name"
          name="amount"
          autocomplete="off"
          placeholder="0"
          v-model="amountTokenA"
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
        Balance: {{ Math.floor(getTokenBalance('tokenA') * 10 ** getTokenMetadata('tokenA').decimals) / (10 ** getTokenMetadata('tokenA').decimals) | readableNumber(tokenMetadataA.decimals) }}
        {{ tokenMetadataA.symbol }} <a style="color:#98AFFF; font-weight=600;" @click="amountTokenA = Math.floor(getTokenBalance('tokenA') * 10 ** getTokenMetadata('tokenA').decimals) / (10 ** getTokenMetadata('tokenA').decimals)">(Max)</a>
      </div>
    </div>

    <div class="token-input-wrapper tokenB">
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
            <TokenImage :src="tokenMetadataB.thumbnailUri" alt="token logo" />
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
                : 'Loading...'
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
          class="input-amount"
          type="text"
          name="amount2"
          autocomplete="off"
          placeholder="0"
          v-model="amountTokenB"
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
        Balance: {{ Math.floor(getTokenBalance('tokenB') * 10 ** getTokenMetadata('tokenB').decimals) / (10 ** getTokenMetadata('tokenB').decimals) | readableNumber(tokenMetadataB.decimals) }}
        {{ tokenMetadataB.symbol }} <a style="color:#98AFFF; font-weight=600;" @click="amountTokenB = Math.floor(getTokenBalance('tokenB') * 10 ** getTokenMetadata('tokenB').decimals) / (10 ** getTokenMetadata('tokenB').decimals)"> (Max)</a>
      </div>
    </div>

    <div v-if="dexAction == 'send'" class="recipient-input-wrapper">
      <div class="input-row">
        <div class="description">Recipient Address</div>
        <input
          class="input-recipient"
          type="text"
          name="amount3"
          autocomplete="off"
          placeholder="tz1..."
          v-model="recipientAddress"
        />
      </div>
    </div>

    <div class="pannel-liquidity my-2">
      <div class="slippage-wrapper">
        <div class="description whitespace-nowrap">{{ getTokenMetadata('tokenB').symbol }} per XTZ</div>
        <div 
          class="slippage truncate"
          style="max-width: 110px"
        >
          <v-tooltip top :disabled="getXtzToTokenMarketRate().length <= 13">
            <template v-slot:activator="{ on, attrs }">
              <span
                v-bind="attrs"
                v-on="on"
              >{{ getXtzToTokenMarketRate() }}</span>
            </template>
            <span>{{ getXtzToTokenMarketRate() }}</span>
          </v-tooltip>
        </div>
      </div>
      <div class="slippage-wrapper">
        <div class="description whitespace-nowrap">XTZ per {{ getTokenMetadata('tokenB').symbol }}</div>
        <div 
          class="slippage truncate"
          style="max-width: 110px"
        >
          <v-tooltip top :disabled="getTokenToXtzMarketRate().length <= 13">
            <template v-slot:activator="{ on, attrs }">
              <span
                v-bind="attrs"
                v-on="on"
              >{{ getTokenToXtzMarketRate() }}</span>
            </template>
            <span>{{ getTokenToXtzMarketRate() }}</span>
          </v-tooltip>
        </div>
      </div>
      <div class="slippage-wrapper">
        <div class="description whitespace-nowrap">Pool Share</div>
        <div class="slippage">{{ poolShare | readableNumber(4) }}%</div>
      </div>
    </div>

    <div
      v-if="!isWalletConnected"
      @click="connectWallet()"
      class="connect-wallet-btn"
    >
      Connect wallet
    </div>

    <div
      v-if="isWalletConnected"
      class="connect-wallet-btn connected"
      :class="{
        'pointer-events-none opacity-50 bg-secondary': $store.state.swap.errors.swapAmountA || $store.state.swap.errors.swapAmountB
      }"
      @click="$store.commit('swap/updateShowLiquidityInfoDialog', true)"
    >
      Add Liquidity
    </div>

    <div class="swap-info pannel extra-info px-5">
      By adding liquidity you'll earn 0.25% of all trades on this pair proportional to your share of
      the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing
      your liquidity.
    </div>
  </div>
</template>

<script lang="ts">
// Vuex
import { mapState, mapGetters } from 'vuex'

// Display
import { Component, Vue } from 'vue-property-decorator'
import SwapChooseTokenDialog from '@/components/SwapChooseTokenDialog.vue'
import SwapConfirmationDialog from '@/components/SwapConfirmationDialog.vue'
import {
  getUserBalanceForToken,
  tokenAddressToMetadata,
  ISwapContracts,
  ISwapContractsValue,
  tokenAddressToSwapContract,
} from '@/store/dexContracts'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import dexterCalculations from '@/modules/dexter-calculations'
import {
  ISwapTokenInfo,
  getTokenToXtzMarketRate,
  getPoolXtzToTokenMarketRate,
  getPoolTokenMetadata,
} from '@/store/swap'
import TokenImage from '@/components/shared/TokenImage.vue'
import { numberMixin } from '@/mixins/number.mixin'

const { xtzToTokenMarketRate, tokenToXtzMarketRate } = dexterCalculations

const DexProps = Vue.extend({
  props: {
    isWalletConnected: Boolean,
  },
})

@Component({
  mixins: [numberMixin],
  components: {
    SwapChooseTokenDialog,
    SwapConfirmationDialog,
    TokenImage,
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
      'poolShare',
    ]),
    ...mapState('dexContracts', ['swapContracts']),
    ...mapGetters('wallet', ['walletInUse']),
    //...mapState({isWalletConnected: s => s.isWalletConnected}),
  },
})
export default class Dex extends DexProps {
  /**
   * DEX
   */

  // Alerts
  walletError = false // Show or hide the error alert
  errormsg = ''
  private tokenB!: ISwapTokenInfo
  private poolShare!: string
  private walletInUse!: any

  async connectWallet(wallet = 'beacon'): Promise<void> {
    this.$store.commit('wallet/updateWalletType', wallet)
    await this.walletInUse
      .setupWallet()
      .then(() => this.$store.dispatch('wallet/loadWallet'))
    await this.$store.dispatch('dexContracts/reloadBalances')
  }
  private balanceA = 0
  private balanceB = 0

  get tokenMetadataA() {
    return this.getTokenMetadata('tokenA')
  }

  get tokenMetadataB() {
    return this.getTokenMetadata('tokenB')
  }

  getTokenMetadata(token: 'tokenA' | 'tokenB'): ITokenMetadata {
    return getPoolTokenMetadata(token, this.$store.state.swap, this.$store.state.dexContracts)
  }

  getXtzToTokenMarketRate(): string {
    return getPoolXtzToTokenMarketRate(this.$store.state.swap, this.$store.state.dexContracts)
  }

  getTokenToXtzMarketRate(): string {
    return getTokenToXtzMarketRate(this.$store.state.swap, this.$store.state.dexContracts)
  }

  get tk() {
    return this.$store.state.wallet.tk
  }

  getTokenBalance(token: 'tokenA' | 'tokenB'): string {
    const tokenAddress = this.$store.state.swap[token].address
    const tokenId = this.$store.state.swap[token].tokenId
    const metadata = tokenAddressToMetadata(tokenAddress, tokenId, this.$store.state.dexContracts)
    if (tokenAddress) {
      const balance = getUserBalanceForToken(
          tokenAddress,
          tokenId,
          this.$store.state.dexContracts,
          this.$store.state.wallet
        ) * Math.pow(10, -metadata.decimals)
        if (token ===  'tokenA') this.balanceA = balance
        else this.balanceB = balance
      return String(balance)
    }
      
    else return ''
  }

  get balance1(): number {
    return this.balanceA
  }

  get balance2(): number {
    return this.balanceB
  }

  get recipientAddress(): string {
    return this.$store.state.swap.recipientAddress
  }

  set recipientAddress(recipientAddress: string) {
    this.$store.commit('swap/updateRecipientAddress', recipientAddress)
  }

  get amountTokenA(): number {
    return this.$store.state.swap.tokenA.amount
  }

  set amountTokenA(amount: number) {
    this.$store.dispatch('swap/updateTokenAmount', {
      whichToken: 'tokenA',
      amount: amount,
    })
  }

  get swapContracts(): ISwapContracts {
    return this.$store.state.dexContracts.swapContracts
  }

  getSwapContractForToken(tokenAddress: string, tokenId: number): ISwapContractsValue {
    const swapContractAddress = this.$store.state.dexContracts.tokenAddressToSwapContractAddress[
      tokenAddress
    ][tokenId]
    return this.swapContracts[swapContractAddress]
  }

  get amountTokenB(): number {
    return this.$store.state.swap.tokenB.amount
  }

  set amountTokenB(amount: number) {
    this.$store.dispatch('swap/updateTokenAmount', {
      whichToken: 'tokenB',
      amount: amount,
    })
  }

  openSwapChooseTokenDialog(currentTokenModified: 'tokenA' | 'tokenB'): void {
    this.$store.commit('swap/updateCurrentTokenModified', currentTokenModified)
    this.$store.commit('swap/updateShowTokenSelectionDialog', true)
  }

  get tokenAddresses(): string[] {
    return Object.keys(this.swapContracts).map(
      (address: string) => this.swapContracts[address].swapContract.storage.tokenAddress
    )
  }

  countDecimals(value: number): number {
    if (value.toString().split('.').length > 1) {
      return value.toString().split('.')[1].length || 0
    } else return 0
  }

  /**
   * Function that manages the wallet error alert
   */
  walletErrorAlert(error: string): void {
    this.walletError = true
    this.errormsg = error
    window.setTimeout(() => {
      this.errormsg = ''
      this.walletError = false
    }, 3000)
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

.swap-wrapper {
  position: relative;

  .swap-info {
    position: absolute;
    top: calc(100% + 0.8rem);
  }
}

.pannel {
  width: 100%;
  margin-bottom: 16px;
  padding: 20px;

  &.extra-info {
    width: calc(100% - 1rem);
    margin-left: -10px;
    font-weight: 400;
    font-size: 14px;
    font-family: 'Source Sans Pro';
    text-align: center;
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

.token-input-wrapper {
  background-color: var(--nested-pannel);
  padding: 1rem;
  padding-bottom: 2rem;
  border-radius: 1.5rem;
  border: 1px solid var(--pannel-border);

  .input-row {
    display: flex;

    .open-token-dialog-button {
      background-color: #5b58c9;
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
  font-weight: 600;
  border-radius: 1.5rem;
  font-family: 'Source Sans Pro';
  border: 1px solid var(--pannel-border);
  margin-top: 0.5rem;

  .input-row {
    display: flex;
    flex-direction: column;

    .description {
    }

    .input-recipient {
      font-family: 'Source Code Pro';
      color: var(--text);
      text-align: right;
      font-size: 1.5rem;
      width: 100%;
    }
  }
}

.pannel-liquidity {
  background-color: var(--nested-pannel);

  border-radius: 20px;
  padding: 20px;

  border: 1px solid var(--pannel-border);

  color: var(--active);

  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-width;
  gap: 1rem;
}

.slippage-wrapper {
  font-size: 14px;
  color: var(--slippage-tol);
  font-weight: 600;
  text-align: left;
}
</style>
