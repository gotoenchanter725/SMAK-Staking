<template>
  <div class="top-pools-by-fees px-6 pt-4 pb-6">
    <h3 class="top-pools-by-fees__title">Top Pools by Fees</h3>

    <div v-if="isTokensLoaded" class="top-pools-by-fees__list">
      <router-link
        v-for="pool in poolsShown"
        :key="pool.pool_address"
        class="hover:opacity-90"
        :to="{
          name: 'PoolDashboard',
          query: { address: pool.pool_address },
        }"
      >
        <Card class="top-pools-by-fees__token" secondary3000>
          <div class="d-flex mr-4">
            <TokenImage class="top-pools-by-fees__token-image" :src="xtz.metadata.thumbnailUri" />
            <TokenImage class="top-pools-by-fees__token-image" :src="pool.icon" />
          </div>
          <div class="top-pools-by-fees__token-details">
            <p class="top-pools-by-fees__token-pair whitespace-nowrap">
              XTZ - {{ pool.symbol }}
            </p>
            <div class="top-pools-by-fees__token-price">
              <p class="top-pools-by-fees__token-value">${{ pool.usd_fees | readableNumber(2) }}</p>
            </div>
          </div>
        </Card>
      </router-link>
    </div>
    <div v-else class="top-pools-by-fees__list">
      <div
        v-for="index in numShown"
        :key="index"
        class="h-85px w-full content-placeholder content-placeholder--card rounded-lg"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { mapActions, mapGetters } from 'vuex'

import Card from '@/components/shared/Card.vue'
import TokenImage from '@/components/shared/TokenImage.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { TOKEN_METADATA, TOKENS } from '@/constants/tokens.const'
import { ITopPoolsByFees } from '@/interfaces/smartlink.interface'
import { isTokenWhitelisted } from '@/helpers/token.helper';

@Component({
  mixins: [numberMixin],
  components: {
    Card,
    TokenImage,
  },
  computed: {
    ...mapGetters('pools', ['topPoolsByFees']),
  },
  methods: {
    ...mapActions('pools', [
      'getTopPoolsByFees',
    ]),
  }
})
export default class TopPoolsByFees extends Vue {
  getTopPoolsByFees!: () => Promise<ITopPoolsByFees[]>

  topPoolsByFees!: ITopPoolsByFees[]
  isTokensLoaded = false
  xtz = TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId]

  get poolsShown() {
    const whitelistedPools = this.topPoolsByFees.filter(pool => {
      return isTokenWhitelisted(pool.token_address, pool.token_id)
    })
    return whitelistedPools.slice(0, this.numShown)
  }

  get numShown() {
    if (this.$vuetify.breakpoint.width <= 1189) return 12
    if (this.$vuetify.breakpoint.width <= 1400) return 10
    return 12
  }

  async mounted() {
    await this.getTopPoolsByFees()
    this.isTokensLoaded = true
  }
}
</script>

<style lang="scss" scoped>
.top-pools-by-fees {
  &__title {
    font-weight: 600;
    font-size: 20px;
    line-height: 153.5%;
    margin: 0 0 1rem;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }

  &__token {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
  }
  &__token-image {
    width: 38px;
    height: 38px;
    z-index: 1;
  }
  &__token-image + &__token-image {
    margin-left: -0.5rem;
    z-index: 2;
  }

  &__token-pair {
    font-weight: 600;
    font-size: 16px;
    line-height: 153.5%;
    margin: 0;
  }
  &__token-price {
    display: flex;
    font-weight: 600;
    font-size: 16px;
    line-height: 153.5%;
    margin: 0;
  }
  &__token-value {
    margin: 0 0.5rem 0 0;
  }
  &__token-percentage {
    display: flex;
    color: var(--positive);
    margin: 0;

    &--negative {
      color: var(--negative);
    }
  }
}

@media screen and (min-width: 1401px) {
  .top-pools-by-fees {
    &__list {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}

@media (min-width: 1190px) and (max-width: 1400px) {
  .top-pools-by-fees {
    &__list {
      grid-template-columns: repeat(5, 1fr);
    }
  }
}

@media (min-width: 1010px) and (max-width: 1189px) {
  .top-pools-by-fees {
    &__list {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

@media (min-width: 770px) and (max-width: 1009px) {
  .top-pools-by-fees {
    &__list {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media (min-width: 550px) and (max-width: 769px) {
  .top-pools-by-fees {
    &__list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
