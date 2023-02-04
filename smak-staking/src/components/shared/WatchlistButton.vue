<template>
  <div class="watchlist-button">
    <img v-if="isIncluded" class="watchlist-button__image" src="@/assets/star-icon.svg" alt="" @click="removeToWatchlist" />
    <img v-else class="watchlist-button__image" src="@/assets/star-icon--inactive.svg" alt="" @click="addToWatchlist" />
  </div>
</template>

<script lang="ts">
import { ITopPool, ITopToken } from '@/interfaces/smartlink.interface'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mapState, mapGetters } from 'vuex'

@Component({
  computed: {
    ...mapState(['theme']),
    ...mapGetters('dashboard', ['watchlistTokens', 'watchlistPools']),
  },
})
export default class WatchlistButton extends Vue {
  watchlistTokens!: ITopToken[]
  watchlistPools!: ITopPool[]

  @Prop(String) address!: string
  @Prop(Number) tokenId!: number
  @Prop(Boolean) isPool!: boolean

  get isIncluded() {
    if (!this.isPool) {
      return this.watchlistTokens.some(
        (token) => token.token_address === this.address && +token.token_id === +this.tokenId
      )
    }

    return this.watchlistPools.some(
      (pool) => pool.pool_address === this.address
    )
  }

  addToWatchlist() {
    if (!this.isPool) {
      this.$store.commit('dashboard/addTokenToWatchlist', { 
        address: this.address,
        tokenId: this.tokenId,
      })
    }

    this.$store.commit('dashboard/addPoolToWatchlist', { 
      address: this.address,
    })
  }

  removeToWatchlist() {
    if (!this.isPool) {
      this.$store.commit('dashboard/removeTokenToWatchlist', { 
        address: this.address,
        tokenId: this.tokenId,
      })
    }
    this.$store.commit('dashboard/removePoolToWatchlist', { 
      address: this.address,
    })
  }

}
</script>

<style lang="scss" scoped>
.watchlist-button {
  display: flex;
  align-items: center;

  &__image {
    cursor: pointer;
    transition: all 0.1s ease;

    &:hover {
      opacity: .8
    }
  }
}
</style>
