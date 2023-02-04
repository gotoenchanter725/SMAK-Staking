<template>
  <div class="top-movers px-6 pt-4 pb-6">
    <h3 class="top-movers__title">Top Movers</h3>

    <div v-if="isTokensLoaded" class="top-movers__list">
      <router-link
        v-for="token in topMovers"
        :key="token.token_address"
        class="hover:opacity-90"
        :to="{
          name: 'TokenDashboard',
          query: { address: token.token_address, tokenId: token.token_id },
        }"
      >
        <Card class="top-movers__token" secondary3000>
          <TokenImage class="top-movers__token-image" :src="token.metadata.thumbnailUri" />
          <div class="top-movers__token-details">
            <p class="top-movers__token-pair">{{ token.metadata.symbol }}</p>
            <div class="top-movers__token-price">
              <p class="top-movers__token-value">${{ token.usd_token_price | shortNumber }}</p>
              <p
                class="top-movers__token-percentage"
                :class="{
                  'top-movers__token-percentage--negative': token.pct_token_price_24h < 0,
                }"
              >
                {{ token.pct_token_price_24h | readableNumber(2) }}%
                <img v-if="token.pct_token_price_24h < 0" src="@/assets/arrow-down.svg" alt="" />
                <img v-else src="@/assets/arrow-up.svg" alt="" />
              </p>
            </div>
          </div>
        </Card>
      </router-link>
    </div>
    <div v-else class="top-movers__list">
      <div
        v-for="index in numShown"
        :key="index"
        class="h-85px w-full content-placeholder content-placeholder--card rounded-lg"
        secondary
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
import { isTokenWhitelisted, tokenIdentifier } from '@/helpers/token.helper'
import { ITopToken } from '@/interfaces/smartlink.interface'
import { EMPTY_METADATA } from '@/constants/tokens.const'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'

interface ITopMover extends ITopToken {
  metadata: Partial<ITokenMetadata>
}

@Component({
  mixins: [numberMixin],
  components: {
    Card,
    TokenImage,
  },
  computed: {
    ...mapGetters('tokens', ['topTokens', 'tokensMetadata']),
  },
  methods: {
    ...mapActions('tokens', ['getTopTokens'])
  }
})
export default class TopMovers extends Vue {
  getTopTokens!: () => Promise<ITopToken[]>

  tokensMetadata!: { [key: string]: ITokenMetadata }
  topTokens!: ITopToken[]
  isTokensLoaded = false

  get topMovers(): ITopMover[] {
    const topMovers = [...this.topTokens]
      .filter(
        (token) =>
          isTokenWhitelisted(token.token_address, token.token_id || 0)
      )
      .map(token => {
        const identifier = tokenIdentifier({
          address: token.token_address,
          tokenId: token.token_id || 0
        })
        const tokenMetadata = this.tokensMetadata[identifier] || EMPTY_METADATA

        return {
          ...token,
          metadata: tokenMetadata
        }
      })
      .sort((a, b) => {
        if (a.pct_token_price_24h === b.pct_token_price_24h) return 0
        return a.pct_token_price_24h < b.pct_token_price_24h ? 1 : -1
      })

    return topMovers.slice(0, this.numShown)
  }

  get numShown() {
    if (this.$vuetify.breakpoint.width <= 1189) return 12
    if (this.$vuetify.breakpoint.width <= 1400) return 10
    return 12
  }

  async mounted() {
    this.isTokensLoaded = !!this.topTokens.length;

    await this.getTopTokens()

    this.isTokensLoaded = true
  }
}
</script>

<style lang="scss" scoped>
.top-movers {
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
    margin-right: 1rem;
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
  .top-movers {
    &__list {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}

@media (min-width: 1190px) and (max-width: 1400px) {
  .top-movers {
    &__list {
      grid-template-columns: repeat(5, 1fr);
    }
  }
}

@media (min-width: 1010px) and (max-width: 1189px) {
  .top-movers {
    &__list {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

@media (min-width: 770px) and (max-width: 1009px) {
  .top-movers {
    &__list {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media (min-width: 550px) and (max-width: 769px) {
  .top-movers {
    &__list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
