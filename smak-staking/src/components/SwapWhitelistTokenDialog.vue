<template>
  <v-dialog 
    v-model="showWhitelistDialog" 
    :content-class="theme" 
    :max-width="447" 
    :width="375" 
    transition="fade-transition"
    @close="close"
    @click:outside="close"
  >
    <div class="pannel select-token-type-dialog">
      <div class="modal-header">
        <h4>Alert</h4>
        <div
          style="font-size: 30px; margin-right: 3px; margin-top: -6px"
          class="close-btn"
          @click="close"
        >
          <h3>&times;</h3>
        </div>
      </div>
      <div class="token-not-whitelisted-warning">
        <v-icon color="red" x-large class="warning-icon">mdi-alert-circle-outline</v-icon>
        <p>
          This token doesn’t appear to be whitelisted. Are you sure you want to
          {{ dexAction === 'liquidity' ? 'add' : 'trade' }} this token?
        </p>
      </div>
      <div v-if="nonWhitelistedTokenMetaData" class="token-infos">
        <TokenImage class="h-36px" :src="nonWhitelistedTokenMetaData.thumbnail_uri || nonWhitelistedTokenMetaData.token_info.icon | imgUrlByIpfs" alt="" />
        <h4>{{ nonWhitelistedTokenMetaData.symbol }}</h4>
        <h5>Token Name :</h5>
        <p class="token-name-label">{{ nonWhitelistedTokenMetaData.name }}</p>
      </div>
      <div 
        style="font-weight: 600" 
        class="add-token-btn" 
        :class="{
          'pointer-events-none': isLoading
        }"
        @click="confirm"
      >
        <template v-if="!isLoading">
          Confirm
        </template>
        <PulseLoader v-else class="-mb-2px" color="rgba(94, 84, 208, 1)" />
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import { Component, Vue, Watch } from 'vue-property-decorator'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

import TokenImage from '@/components/shared/TokenImage.vue'

import { isTokenWhitelisted } from '@/helpers/token.helper'
import { tokenMixin } from '@/mixins/token.mixin'
import { getTokenDetailsByAddress } from '@/modules/betterCall'

const SelectTokenTypeModalProps = Vue.extend({
  props: {},
})

@Component({
  mixins: [tokenMixin],
  components: {
    TokenImage,
    PulseLoader,
  },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'tk']),
    ...mapState(['theme']),
    ...mapState('swap', ['showSelectTokenTypeModal', 'showWhitelistDialog', 'whitelistDialogType', 'tokenA', 'tokenB', 'addToken', 'dexAction']),
    ...mapState('dexContracts', ['swapContracts']),
  },
})
export default class SelectTokenTypeModal extends SelectTokenTypeModalProps {
  /**
   * Select Token Type Modal
   */
  showWhitelistDialog!: boolean
  whitelistDialogType!: 'addToken' | 'swap'
  isLoading = false
  tokenA!: any
  tokenB!: any
  addToken!: any
  swapContracts!: any
  nonWhitelistedToken!: any
  nonWhitelistedTokenMetaData!: any
  theme!: string
  dexAction!: string

  @Watch('addToken', { deep: true })
  @Watch('tokenA', { deep: true })
  @Watch('tokenB', { deep: true })
  requestNonWhitelistedToken() {
    const token = this.addToken.tokenAddress 
    ? {
      address: this.addToken.tokenAddress,
      tokenId: this.addToken.tokenId,
      } 
    : !isTokenWhitelisted(this.tokenA.address, this.tokenA.tokenId) 
      ? this.tokenA 
      : this.tokenB
    
    if (this.nonWhitelistedToken && this.nonWhitelistedToken.address === token.address) return

    this.nonWhitelistedToken = token
    getTokenDetailsByAddress(token.address, token.tokenId).then(metadata => {
      this.nonWhitelistedTokenMetaData = metadata
    })
  }


  async confirm(): Promise<void> {
    this.isLoading = true;
    if (this.whitelistDialogType == 'swap') {
      this.$store.commit('swap/updateShowSwapConfirmationDialog', true)
      this.$store.commit('swap/updateShowWhitelistDialog', false)
    } else {
      await this.$store.dispatch('swap/launchExchange')
    }
    this.isLoading = false;
  }

  close() {
    this.isLoading = false;
    this.$store.commit('swap/updateShowWhitelistDialog', false)
  }
}
</script>

<style lang="scss" scoped>
.v-application .red--text {
  color: #ff7b71 !important;
  caret-color: #ff7b71 !important;
}
.select-token-type-dialog {
  color: var(--text);

  .modal-header {
    display: flex;
    margin-bottom: 1rem;
    font-size: 20px;
    margin-top: 8px;

    h4 {
      flex: 1;
      padding: 0.3rem;
    }

    .close-btn {
      cursor: pointer;
      margin-top: -2px;
      margin-right: 8px;
      height: 40px;
    }
  }

  .token-not-whitelisted-warning {
    margin-bottom: 1rem;
    text-align: center;
    background-color: var(--nested-pannel);
    padding: 1rem;
    border-radius: 17px;

    p {
      font-weight: 600;
    }

    .warning-icon {
      margin: 0.8rem;
    }
  }

  .token-infos {
    text-align: center;
    padding: 0.7rem;

    .token-name-label {
      color: var(--text2);
    }
  }

  .add-token-btn {
    background-color: var(--connect-wallet-btn);
    border-radius: 15px;
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
