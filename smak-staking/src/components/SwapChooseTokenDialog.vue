<template>
  <div>
    <v-dialog
      v-model="showTokenSelectionDialog"
      :content-class="theme"
      @click:outside="close"
      :max-width="449"
      :width="412"
      transition="fade-transition"
    >
      <div class="card token-dialog-wrapper">
        <div class="header">
          <div class="modal-title">Select a token</div>
          <div class="close" @click="close">&times;</div>
        </div>

        <input
          type="text"
          id="token-search-input"
          placeholder="Search name or paste contract address"
          autocomplete="off"
          class="search-token-input"
          v-model="searchInput"
        />

        <div class="frequently-used-tokens-wrapper">
          <div class="description">Tokens frequently paired</div>
          <div class="token-buttons-wrapper">
            <div v-for="item in frequentlyPairedTokenMetadata" :key="item">
              <div
                class="token-button"
                :class="{
                  'pointer-events-none opacity-50 bg-secondary': disabledTokens.includes(tokenIdentifierFormat(item))
                }"
                @click="setToken(item.address, item.tokenId)"
              >
                <img :src="item.metadata.thumbnailUri" alt="token logo" />
                <div class="symbol">
                  {{ item.metadata.symbol }}
                </div>
              </div>
            </div>
            <div class="-mt-15px" v-if="!frequentlyPairedTokenMetadata.length">--</div>
          </div>
        </div>
        <div class="token-lines-wrapper scrollbar-none">
          <div v-for="item in shownTokens" :key="item">
            <div
              class="token-line"
              :class="{
                'pointer-events-none opacity-50': disabledTokens.includes(tokenIdentifierFormat(item))
              }"
              @click="setToken(item.address, item.tokenId)"
            >
              <img :src="item.metadata.thumbnailUri" />
              <div class="token-name-wrapper">
                <div class="token-symbol">
                  {{ item.metadata.symbol }}
                </div>
                <div class="token-name">
                  {{ item.metadata.name ? item.metadata.name : '' }}
                </div>
              </div>
              <div class="token-balance">--</div>
            </div>
          </div>
          <div class="no-token-shown" v-if="!shownTokens.length">No Tokens Shown</div>
        </div>

        <div class="add-token-btn" @click="showAddNewTokenDialog">+ Add new token</div>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { ITokenMetadata } from '@/interfaces/token.interface'
import { ISwapContracts } from '@/store/dexContracts'
import { ISwapTokenInfo } from '@/store/swap'
import { FREQUENTLY_PAIRED_TOKENS, FIRST_TOKENS } from '@/constants/tokens.const'
import { tokenIdentifier } from '../helpers/token.helper';
import { EMPTY_METADATA } from '../constants/tokens.const';

interface ITokenMetadataWrapper {
  address: string
  tokenId: number
  metadata: ITokenMetadata
}

@Component({
  computed: {
    ...mapState('swap', [
      'showTokenSelectionDialog',
      'tokenA',
      'tokenB',
    ]),
    ...mapState('dexContracts', ['swapContracts']),
    ...mapState(['theme']),
    ...mapGetters('tokens', ['tokensMetadata'])
  },
})
export default class SwapDialog extends Vue {
  searchInput = ''
  tokenMetadata: Array<ITokenMetadataWrapper> = []
  frequentlyPairedTokenMetadata: Array<ITokenMetadataWrapper> = []
  tokens: Array<ITokenMetadataWrapper> = []
  otherTokens: Array<ITokenMetadataWrapper> = []
  swapContracts!: ISwapContracts
  tokenA!: ISwapTokenInfo
  tokenB!: ISwapTokenInfo
  tokensMetadata!: { [key: string]: ITokenMetadata }

  beforeMount() {
    this.loadTokens()
  }

  showAddNewTokenDialog(): void {
    this.$store.commit('swap/updateShowAddNewTokenDialog', true)
    this.$store.commit('swap/updateShowTokenSelectionDialog', false)
  }

  get disabledTokens() {
    return [this.tokenIdentifierFormat(this.tokenA), this.tokenIdentifierFormat(this.tokenB)]
  }

  tokenIdentifierFormat(token: ISwapTokenInfo) {
    return `address:${token.address}|tokenId:${token.tokenId}`
  }

  close() {
    this.$store.commit('swap/updateShowTokenSelectionDialog', false)
  }

  get shownTokens(): Array<ITokenMetadataWrapper> {
    if (!this.searchInput) return this.tokens.filter(this.shownTokensFilter)

    return [...this.tokens, ...this.otherTokens].filter(this.shownTokensFilter)
  }

  shownTokensFilter(token: ITokenMetadataWrapper): boolean {
    const search = this.searchInput.toLowerCase()
    const tokenAddress = token.address.toLowerCase()
    const tokenSymbol = token.metadata.symbol.toLowerCase()
    const tokenName = token.metadata.name.toLowerCase()

    return [tokenAddress, tokenSymbol, tokenName].some((criteria) => criteria.includes(search))
  }

  @Watch('swapContracts')
  loadTokens(): void {
    const swapContracts = this.$store.state.dexContracts.swapContracts

    const xtzMetadata = {
      address: 'XTZ',
      tokenId: 0,
      metadata: {
        decimals: 6,
        symbol: 'XTZ',
        name: 'Tezos',
        thumbnailUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png',
      },
    }

    let freqPairs = [xtzMetadata]
    for (const frequentlyPairedElement of FREQUENTLY_PAIRED_TOKENS) {
      for (const address of Object.keys(swapContracts)) {
        const tokenAddress = swapContracts[address].tokenContract.address
        const tokenId = swapContracts[address].tokenContract.getTokenId()
        if (frequentlyPairedElement.address == tokenAddress) {

          const identifier = tokenIdentifier({ address: tokenAddress, tokenId: tokenId })
          const metadata = { 
            ...swapContracts[address].tokenContract.metadata ,
            ...(this.tokensMetadata[identifier] || EMPTY_METADATA)
          }
    
          freqPairs.push({
            address: swapContracts[address].tokenContract.address,
            tokenId: frequentlyPairedElement.tokenId,
            metadata,
          })
        }
      }
    }

    const firstTokens: Array<ITokenMetadataWrapper> = []
    for (const firstTokenAddress of FIRST_TOKENS) {
      for (const address of Object.keys(swapContracts)) {
        const tokenAddress = swapContracts[address].tokenContract.address
        const tokenId = swapContracts[address].tokenContract.getTokenId()
        
        const identifier = tokenIdentifier({ address: tokenAddress, tokenId: tokenId })
        const metadata = { 
          ...swapContracts[address].tokenContract.metadata ,
          ...(this.tokensMetadata[identifier] || EMPTY_METADATA)
        }
        
        if (firstTokenAddress.address == tokenAddress && firstTokenAddress.tokenId == tokenId && !FREQUENTLY_PAIRED_TOKENS.includes(tokenAddress)) {
          firstTokens.push({
            address: swapContracts[address].tokenContract.address,
            tokenId: firstTokenAddress.tokenId,
            metadata,
          })
        }
      }
    }

    const otherTokens: Array<ITokenMetadataWrapper> = []
    for (const address of Object.keys(swapContracts)) {
      const tokenAddress = swapContracts[address].tokenContract.address
      const tokenId = swapContracts[address].tokenContract.getTokenId()
      if (
        FIRST_TOKENS.findIndex(
          e => e.address == tokenAddress && e.tokenId == tokenId
        ) < 0 &&
        FREQUENTLY_PAIRED_TOKENS.findIndex(
          e => e.address == tokenAddress && e.tokenId == tokenId
        ) < 0
      ) {

        const identifier = tokenIdentifier({ address: tokenAddress, tokenId: tokenId })
        const metadata = { 
          ...swapContracts[address].tokenContract.metadata ,
          ...(this.tokensMetadata[identifier] || EMPTY_METADATA)
        }
        
        otherTokens.push({
          address: swapContracts[address].tokenContract.address,
          tokenId: swapContracts[address].tokenContract.getTokenId(),
          metadata,
        })
      }
    }

    this.frequentlyPairedTokenMetadata = freqPairs
    this.tokens = firstTokens
    this.otherTokens = otherTokens
  }

  get frequentlyUsedTokens() {
    const tokenMetadata = this.tokenMetadata
    const nFrequentlyUsedTokens = 8
    if (tokenMetadata.length > nFrequentlyUsedTokens) {
      return tokenMetadata.slice(0, 8)
    }
    return tokenMetadata
  }

  setToken(address: string, tokenId: number) {
    this.$store.dispatch('swap/updateTokenAddress', {
      whichToken: this.$store.state.swap.currentTokenModified,
      address,
      tokenId,
    })
    this.close()
  }

  set showSwapWhitelistTokenModal(show: boolean) {
    this.$store.commit('swap/updateShowSwapWhitelistTokenModal', show)
    this.$store.commit('swap/updateShowTokenSelectionDialog', show ? false : true)
  }
}
</script>

<style lang="scss" scoped>
.v-dialog {
  width: 20rem;

  .card.token-dialog-wrapper {
    --card-margin: 1.5rem;

    overflow: hidden;
    height: 100%;
    max-height: 90vh;
    background-color: var(--pannel);
    border: 1px solid #484d5f;
    color: var(--text);
    display: flex;
    flex-direction: column;
    border-radius: 20px;

    input:focus {
      border: solid;
      border-width: 1px;
      border-color: #3d6168;
    }

    .header {
      display: flex;
      padding: 0 var(--card-margin);
      font-weight: 600;
      align-items: center;
      background: 0 none;

      .modal-title {
        font-size: 1.2rem;
        margin-top: 10px;
        margin-bottom: 10px;
        flex: 1;
      }

      .close {
        cursor: pointer;
        margin-top: 9px;
        margin-bottom: 9px;
        font-size: 2.2rem;
      }
    }
    .description {
      margin-top: 7px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    input {
      background-color: var(--input);
      margin-bottom: 7px;
      border-radius: 13px;
      padding: 3px 14px 3px 15px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      border: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-family: 'Source Sans Pro';
      font-size: 1rem;
      font-weight: 400;
      line-height: 42px;
      color: #9fa9c0;
      margin: -0.2rem 1rem 0.8rem 1rem;
    }

    .frequently-used-tokens-wrapper {
      padding: 0 var(--card-margin);
      border-bottom: 1px solid var(--pannel-border);
      margin-bottom: 10px;

      .token-buttons-wrapper {
        display: flex;
        flex-wrap: wrap;
        padding: 0.25rem 0;

        .token-button {
          height: 2rem;
          display: flex;
          border: 1px solid var(--pannel-border);
          padding-right: 10px;
          padding-top: 3px;
          padding-bottom: 3px;
          padding-left: 5px;
          border-radius: 20px;
          margin: 0.25rem 0;
          cursor: pointer;
          margin-left: 2px;

          &:hover {
            background-color: rgba(96, 72, 199, 0.178);
          }

          img {
            height: 100%;
            width: auto;
          }

          .symbol {
            display: flex;
            align-items: center;
            margin-left: 10px;
          }

          @media only screen and (max-width: 410px) {
            font-size: 12px;

            img {
              height: 22px;
            }
          }
        }
      }
    }

    .token-lines-wrapper {
      height: 25rem;
      overflow: hidden auto;

      @media only screen and (max-width: 700px) {
        height: 16rem;
        max-height: 16rem;
      }

      .token-line {
        display: flex;
        align-items: center;
        padding: 0 var(--card-margin);
        cursor: pointer;
        margin: 5px 0;
        display: flex;

        &:hover {
          background-color: rgba(56, 48, 87, 0.219);
        }

        img {
          width: 30px;
          height: 30px;
          margin-right: 10px;
        }

        .token-name-wrapper {
          display: flex;
          flex-direction: column;

          .token-name {
            color: #6d748e;
            font-size: 0.8rem;
          }
        }
        .token-balance {
          display: none;
          flex: 1;
          text-align: right;
        }
      }
    }

    .add-token-btn {
      background-color: var(--active);
      border-radius: 15px;
      padding: 14px;
      transition: 0.1s;
      color: var(--active-btn-text);
      text-align: center;
      font-weight: 600;
      margin: 1rem;

      &:hover {
        cursor: pointer;
        background-color: var(--active);
        color: white;
      }
    }
  }
}

.no-token-shown {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
