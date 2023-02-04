<template>
  <Dialog v-model="isFarmHarvestShown" @close="closeFarmHarvestDialog">
    <div class="farm-harvest-dialog">
      <div class="farm-harvest-dialog__header mb-4">
        <div class="farm-harvest-dialog__header-title">Harvest rewards</div>
        <div class="farm-harvest-dialog__header-close" @click="closeFarmHarvestDialog">&times;</div>
      </div>

      <p class="text-secondary-400 mb-4">Collect your SMAK already earned </p>

      <Card class="px-3 py-3 mb-4 d-flex flex-column" secondary>
        <div class="d-flex mb-2">
          <p class="text-secondary-600 font-semibold text-14px mb-0">Total Pending Rewards: </p>
          
          <p class="text-secondary-600 font-semibold text-14px mb-0 ml-auto">
            ~{{ getClaimableRewards() + getRewardEstimation() | readableNumber }} SMAK
          </p>
        </div>
        <div class="d-flex align-center">
          <p class="font-semibold text-18px mb-0">SMAK Rewards: </p>
          <div class="d-flex flex-column ml-auto">
            <p class="font-semibold text-25px mb-0">{{ getClaimableRewards() | readableNumber }}</p>
            <p class="text-12px text-primary-1400 font-semibold mb-0 mt-n1 text-right">~${{ getUsdClaimableRewards() | readableNumber }}</p>
          </div>
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
        @click="collectRewards(); harvestFarm();"
      >
        Collect
      </button>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
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
    ...mapGetters('farms', ['isFarmHarvestShown']),
    ...mapState('wallet', ['tk']),
    ...mapState('farms', ['farmAddress', 'farmList']),
  },
  methods: {
    ...mapMutations('farms', ['closeFarmHarvestDialog', 'showFarmStakeSmakDialog']),
  }
})
export default class FarmHarvestDialog extends Vue {
  isFarmHarvestShown!: boolean;
  farmAddress!: string
  closeFarmHarvestDialog!: () => void
  showFarmStakeSmakDialog!: () => void
  isNumber!: (element: HTMLElement) => boolean
  harvest!: (tk: TezosToolkit) => void
  tk!: TezosToolkit
  farmList!: IFarm[]


  xtz = TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId]
  poolToken = TOKEN_METADATA[TOKENS.SMAK.address][TOKENS.SMAK.tokenId]

  collectRewards() {
    this.showFarmStakeSmakDialog()
    this.closeFarmHarvestDialog()
  }

  getCurrentFarm() {
    for (const farm of this.farmList) {
      if (farm.contractAddress === this.farmAddress) return farm
    }
    return this.farmList[0]
  }

  async harvestFarm() {
    await this.$store.dispatch('farms/harvest', { tk: this.tk })
  }

  getClaimableRewards() : number {
    const farm = this.getCurrentFarm()
    if (!farm) return 0
    let reward = 0
    for (const el of Object.entries(farm.weeks)) {
      const  [_,  week ] : any = el
      reward += week.total_reward * week.points / week.total_points
    }
    return reward
  }
  getUsdClaimableRewards() : number {
    const farm = this.getCurrentFarm()
    if (!farm) return 0
    let reward = 0
    for (const el of Object.entries(farm.weeks)) {
      const  [_,  week ] : any = el
      reward += week.total_reward * week.points / week.total_points
    }
    return reward * farm.smakPrice
  }

  getRewardEstimation() : number {
    const farm = this.getCurrentFarm()
    if (!farm || !farm.weeks[farm.currentWeek]) return 0
    return farm.weeks[farm.currentWeek].points * farm.weeks[farm.currentWeek].total_reward / farm.weeks[farm.currentWeek].total_points
  }
}
</script>

<style lang="scss" scoped>
.farm-harvest-dialog {
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