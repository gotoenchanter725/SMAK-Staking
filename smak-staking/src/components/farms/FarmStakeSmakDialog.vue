<template>
  <Dialog v-model="isFarmStakeSmakShown" @close="closeFarmStakeSmakDialog">
    <div class="farm-stake-smak-dialog">
      <div class="farm-stake-smak-dialog__header mb-4">
        <div class="farm-stake-smak-dialog__header-title">Stake your SMAK</div>
        <div class="farm-stake-smak-dialog__header-close" @click="closeFarmStakeSmakDialog">
          &times;
        </div>
      </div>

      <p class="text-secondary-400 mb-4">You can stake your SMAK to earn more rewards!</p>

      <Card class="px-3 py-3 mb-4 d-flex" secondary4100>
        <Card
          class="px-3 py-3 cursor-pointer d-flex align-center justify-center w-full mr-4 hover:opacity-90"
          :gradientSecondary4300="isFlexible"
          :secondary4300="!isFlexible"
          @click="isFlexible = true; $router.push({ name: 'Staking' })"
        >
          <img class="h-40px w-40px mr-3" src="@/assets/smak-icon.svg" alt="" />
          <div class="d-flex flex-column">
            <p class="text-primary-3000 text-15px font-semibold mb-0">Flexible</p>
            <p class="text-17px font-semibold mb-0">APR 20%</p>
          </div>
        </Card>
        <Card
          class="px-3 py-3 cursor-pointer d-flex align-center justify-center w-full hover:opacity-90"
          :gradientSecondary4300="!isFlexible"
          :secondary4300="isFlexible"
          @click="isFlexible = false; $router.push({ name: 'Staking' })"
        >
          <img class="h-40px w-40px mr-3" src="@/assets/smak-icon.svg" alt="" />
          <div class="d-flex flex-column">
            <p class="text-primary-3000 text-15px font-semibold mb-0">Lock</p>
            <p class="text-17px font-semibold mb-0">APR 36%</p>
          </div>
        </Card>
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
        @click="closeFarmStakeSmakDialog"
      >
        Start Staking
      </button>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapGetters, mapMutations } from 'vuex'

import Dialog from '@/components/shared/Dialog.vue'
import Card from '@/components/shared/Card.vue'
import { TOKEN_METADATA, TOKENS } from '@/constants/tokens.const'
import TokenImage from '@/components/shared/TokenImage.vue'
import { numberMixin } from '@/mixins/number.mixin'

@Component({
  mixins: [numberMixin],
  components: {
    Dialog,
    Card,
    TokenImage,
  },
  computed: {
    ...mapGetters('farms', ['isFarmStakeSmakShown']),
  },
  methods: {
    ...mapMutations('farms', ['closeFarmStakeSmakDialog']),
  },
})
export default class FarmStakeSmakDialog extends Vue {
  isFlexible = true
  isFarmStakeSmakShown!: boolean
  closeFarmStakeSmakDialog!: () => void
  isNumber!: (element: HTMLElement) => boolean

  xtz = TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId]
  poolToken = TOKEN_METADATA[TOKENS.SMAK.address][TOKENS.SMAK.tokenId]
  balance = 123_230_322.23282
}
</script>

<style lang="scss" scoped>
.farm-stake-smak-dialog {
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