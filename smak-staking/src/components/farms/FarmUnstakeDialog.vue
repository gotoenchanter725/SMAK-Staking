<template>
  <Dialog v-model="isFarmUnstakeShown" @close="closeFarmUnstakeDialog">
    <div class="farm-unstake-dialog">
      <div class="farm-unstake-dialog__header mb-4">
        <div class="farm-unstake-dialog__header-title">Unstake LP Tokens</div>
        <div class="farm-unstake-dialog__header-close" @click="closeFarmUnstakeDialog">&times;</div>
      </div>

      <p class="text-secondary-400 mb-4">Enter the amount of LP tokens you want to unstake</p>

      <Card class="px-3 py-3 mb-4 d-flex flex-column" secondary>
        <div class="d-flex mb-2">
          <div class="d-flex">
            <p class="font-semibold text-15px mb-0 mr-2">Unstake</p>
            <p class="text-primary-1300 text-15px font-semibold mb-0">
              {{ xtz.metadata.symbol }} - {{ poolToken.metadata.symbol }} - LP
            </p>
          </div>

          <p class="text-secondary-600 font-semibold text-14px mb-0 ml-auto">
            LP Staked: {{ getLpStaked() || 0 }}
          </p>
        </div>
        <div class="d-flex align-center">
          <div class="d-flex flex-column">
            <input type="text" class="text-25px font-scp w-full pr-4" placeholder="0.0" v-model="amount" v-on:keypress="isNumber($event)" >
            <p class="text-12px text-primary-1400 font-semibold mb-0 mt-n1">~${{ (amount ? amount * getLpUsd(): 0).toFixed(4)}}</p>
          </div>
          <button class="bg-secondary h-40px rounded-9px w-115px font-semibold flex-shrink-0 hover:opacity-90" @click="useMax()">
            Max
          </button>
        </div>
      </Card>

      <button
        class="
          text-white
          d-flex
          align-center
          justify-center
          text-18px
          font-semibold
          bg-primary
          rounded-13px
          h-57px
          w-full
          hover:opacity-90
        "
        @click="closeFarmUnstakeDialog(); unstakeFarm()"
      >
        Confirm
      </button>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

import Dialog from '@/components/shared/Dialog.vue'
import Card from '@/components/shared/Card.vue'
import { TOKEN_METADATA, TOKENS } from '@/constants/tokens.const'
import TokenImage from '@/components/shared/TokenImage.vue'
import { numberMixin } from '@/mixins/number.mixin'
import { TezosToolkit } from '@taquito/taquito'
import { IFarm } from '@/interfaces/farm.interface'

@Component({
  mixins: [numberMixin],
  components: {
    Dialog,
    Card,
    TokenImage,
  },
  computed: {
    ...mapGetters('farms', ['isFarmUnstakeShown']),
    ...mapState('wallet', ['tk']),
    ...mapState('farms', ['farmAddress', 'farmList']),
      
  },
  methods: {
    ...mapMutations('farms', ['closeFarmUnstakeDialog']),
    ...mapActions({
    unstake: 'farms/unstake',
  })
  }
})
export default class FarmUnstakeDialog extends Vue {
  isFarmUnstakeShown!: boolean;
  closeFarmUnstakeDialog!: () => void
  isNumber!: (element: HTMLElement) => boolean
  amount = 0
  tk!: TezosToolkit
  farmAddress!: string
  farmList!: IFarm[]
  data() {
    return {
      amount: this.amount,
    };
  }
  getLpStaked(): number {
    for (const farm of this.farmList) {
      if (farm.contractAddress === this.farmAddress) return farm.lpStaked 
    }
    return 0
  }

  getLpUsd(): number {
    for (const farm of this.farmList) {
      if (farm.contractAddress === this.farmAddress) return farm.lpUsd 
    }
    return 0
  }

  useMax(): void {
    this.amount = Math.floor(this.getLpStaked() * 10**6) / 10**6 || 0
  }
  async unstakeFarm(): Promise<void> {
    await this.$store.dispatch('farms/unstake', { amount: Number(this.amount), tk: this.tk })
  }
  xtz = TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId]
  poolToken = TOKEN_METADATA[TOKENS.SMAK.address][TOKENS.SMAK.tokenId]
}
</script>

<style lang="scss" scoped>
.farm-unstake-dialog {
  padding: 1.3rem 1.5rem 1.5rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__header-title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
  }
  &__header-close {
    font-size: 2.25rem;
    margin: -1.25rem 0;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>