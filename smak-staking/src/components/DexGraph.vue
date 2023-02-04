<template>
  <div v-if="shouldRender" class="component-wrapper">
    <div class="header-wrapper">
      <div class="ticker-wrapper">
        <div class="token-logos-wrapper">
          <img
            :src="getTokenMetadata('tokenA').thumbnailUri"
            class="token-logo tokenA"
            alt="logo token in"
          />
          <img
            :src="getTokenMetadata('tokenB').thumbnailUri"
            class="token-logo tokenB"
            alt="logo token out"
          />
        </div>
        <span class="ticker in">
          {{ tokenA.symbol }}
        </span>
        <span class="ticker out"> / {{ tokenB.symbol }} </span>
      </div>
      <div class="d-flex flex-row align-center">
        <div class="rate-wrapper mr-5">{{ priceInfo.amount | readableNumber(tokenB.decimals, tokenB.decimals) }} {{ tokenB.symbol }}</div>
        <div
          class="price-variation mr-2"
          v-bind:class="{ negative: graph.getTimeSeries().isNegativePriceVariation() }"
        >
          {{ pricePrefix }}{{ priceVariation | readableNumber }}%
        </div>
        <div
          class="info-wrapper"
          v-bind:class="{ negative: graph.getTimeSeries().isNegativePriceVariation() }"
        >
          Past 24h
        </div>
      </div>
      <div class="d-flex">
        <div class="date">{{ priceInfo.date }}</div>
        <!-- <GraphTabs class="ml-auto" v-model="selectedTime" /> -->
      </div>
    </div>
    <LineGraph
      :timeSeries="graph.timeSeries"
      :crosshairMovedCallback="updatePrice"
      :showTooltip="false"
      containerId="graph-container"
      :height="490"
      :decimals="tokenB.decimals"
    />
  </div>
  <div class="graph-loader" v-else>
    <img v-if="theme === 'dark'" class="graph-loader__image" src="@/assets/vortex-logo.svg" />
    <img v-else class="graph-loader__image" src="@/assets/vortex-logo--white.svg" />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import VChart from 'vue-echarts'
import { Component, Vue } from 'vue-property-decorator'
import { tokenAddressToMetadata } from '@/store/dexContracts'
import LineGraph from '@/components/LineGraph.vue'
import GraphTabs from '@/components/shared/GraphTabs.vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Graph } from '@/modules/timeSeriesGraph'
import { numberMixin } from '@/mixins/number.mixin'
import { EMPTY_METADATA } from '../constants/tokens.const';
import { ITokenMetadata } from '@/interfaces/token.interface'
import { tokenIdentifier } from '../helpers/token.helper';

dayjs.extend(customParseFormat)

const DexGraphProps = Vue.extend({
  props: {},
})

@Component({
  mixins: [numberMixin],
  components: {
    VChart,
    LineGraph,
    GraphTabs,
  },
  computed: {
    ...mapState('graph', ['graphLoading', 'graph', 'tokenA', 'tokenB', 'priceInfo']),
    ...mapState(['theme']),
    ...mapGetters('tokens', ['tokensMetadata'])
  },
})
export default class DexGraph extends DexGraphProps {
  tokensMetadata!: { [key: string]: ITokenMetadata }
  private graph!: Graph
  selectedTime = '24H'

  getTokenMetadata(token: 'tokenA' | 'tokenB') {
    const tokenAddress = this.$store.state.swap[token].address
    const tokenId = this.$store.state.swap[token].tokenId

    const identifier = tokenIdentifier({ address: tokenAddress, tokenId: tokenId })
    
    return this.tokensMetadata[identifier] || EMPTY_METADATA
  }

  get pricePrefix(): string {
    if (this.priceVariation > 0) {
      return '+'
    }
    return ''
  }

  get priceVariation(): number {
    const variation = this.graph.getTimeSeries().getVariationAbsolute('day')
    return variation
  }

  formatDate(date: string): string {
    const dayjsDate = dayjs(date, 'DD/MM/YYYY, HH:mm:ss')
    return dayjsDate.format('MMM D, YYYY, h:mmA')
  }

  updatePrice(amount?: number, date?: string): void {
    if (amount == undefined || date == undefined) {
      const tsData = this.$store.state.graph.graph.timeSeries.getData()
      const tsLength = tsData.length
      const { value } = tsData[tsLength - 1]
      this.$store.commit('graph/updatePriceInfo', {
        amount: value,
        date: this.formatDate(new Date().toLocaleString('fr-FR')),
      })
    } else {
      this.$store.commit('graph/updatePriceInfo', {
        amount: amount ? amount : '0',
        date: this.formatDate(date),
      })
    }
  }

  get shouldRender(): boolean {
    return this.$store.state.swap.tokenA.address && this.$store.state.swap.tokenB.address && this.graph.timeSeries.getData().length
  }
}
</script>

<style lang="scss" scoped>
.component-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.date {
  color: var(--gray);
}

.header-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  margin-top: -12px;

  .ticker-wrapper {
    display: flex;

    .token-logos-wrapper {
      display: flex;
      align-items: flex-end;

      .token-logo {
        height: 2rem;
        width: auto;

        &.tokenA {
          z-index: 1;
        }

        &.tokenB {
          transform: translateX(-0.5rem);
        }
      }
    }

    .ticker {
      display: flex;
      align-items: center;
      &.in {
        font-weight: 600;
      }

      &.out {
        color: grey;
      }
    }
  }

  .rate-wrapper {
    font-weight: 600;
    padding: 0.5rem 0;
    font-size: 26px;
    font-family: 'Source Sans Pro';
  }

  .info-wrapper {
    color: var(--price-color);
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 3px;
    margin-left: 3px;

    &.negative {
      color: var(--neg-price-color);
    }
  }

  .price-variation {
    font-weight: 600;
    background: var(--price-background);
    color: var(--price-color);
    border-radius: 9px;
    padding: 0 8px;

    &.negative {
      color: var(--neg-price-color);
      background: var(--neg-price-background);
    }
  }
}

@media only screen and (max-width: 700px) {
}

.graph-loader {
  margin-top: -0.75rem;
  height: 611px;
  max-height: 100%;
  width: 100%;
  background-color: var(--pannel);
  border: 1px solid var(--pannel-border);
  border-radius: 1rem;

  display: flex;
  justify-content: center;
  align-items: center;

  &__image {
    height: 60px;
    animation: pulse 1.2s linear infinite;
  }
}
</style>
