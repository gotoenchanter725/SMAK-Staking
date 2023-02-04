<template>
  <Dialog v-model="isFarmPopupShown">
    <div class="farm-pool-dialog">
      <div class="farm-pool-dialog__header mb-2">
        <div class="farm-pool-dialog__header-title">Stake your LP tokens and earn SMAK</div>
        <div class="farm-pool-dialog__header-close" @click="closeFarmPopup">&times;</div>
      </div>

      <p class="text-secondary-400 text-14px mb-4">
        You can stake your LP tokens in our farms to earn more!
      </p>

      <Card class="px-3 py-3 grid grid-cols-2 gap-0.75rem mb-4" secondary>
        <Card v-for="lpToken in lpTokens" :key="lpToken.address" class="px-5 py-3 d-flex align-center" gradient-primary300>
          <div class="d-flex mr-2">
            <TokenImage class="h-27px w-27px relative z-1" :src="lpToken.metadata.thumbnailUri"/>
            <TokenImage class="h-27px w-27px relative z-0 -ml-0.25rem" :src="xtz.metadata.thumbnailUri"/>
          </div>
          <div class="ml-auto">
            <p class="text-15px font-semibold mb-0">
              {{ lpToken.metadata.symbol }} - {{ xtz.metadata.symbol }}
            </p>
            <p class="text-secondary-500 font-semibold text-11px mb-0">
              APR 20%
            </p>
          </div>
        </Card>
      </Card>

      <router-link :to="{ name: 'Farms' }" class="d-flex align-center justify-center text-18px font-semibold bg-primary rounded-13px h-57px w-full hover:opacity-90">
        Start farming
      </router-link>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Dialog from '@/components/shared/Dialog.vue'
import Card from '@/components/shared/Card.vue'
import { TOKEN_METADATA, TOKENS } from '@/constants/tokens.const';
import TokenImage from '@/components/shared/TokenImage.vue';

@Component({
  components: {
    Dialog,
    Card,
    TokenImage,
  },
})
export default class FarmPoolDialog extends Vue {
  isFarmPopupShown = false

  xtz = TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId]
  lpTokens = Array(8).fill({
    ...TOKEN_METADATA[TOKENS.SMAK.address][TOKENS.SMAK.tokenId]
  })

  mounted() {
    this.isFarmPopupShown = true
  }

  closeFarmPopup() {
    this.isFarmPopupShown = false
  }
}
</script>

<style lang="scss" scoped>
.farm-pool-dialog {
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
