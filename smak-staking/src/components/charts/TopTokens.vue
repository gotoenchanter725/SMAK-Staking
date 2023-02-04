<template>
  <div class="top-tokens pt-6">
    <h3 class="top-tokens__title px-6">Top Tokens</h3>

    <Table
      has-index
      :headers="tableHeaders"
      :items="tableItems"
      :per-page="8"
      table-class="px-6"
      :is-loading="!isTokensLoaded"
      default-sort="tvl"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Table from '@/components/shared/Table.vue'

import { numberMixin } from '@/mixins/number.mixin'
import {
  EItemDirection,
  ETableAlignment,
  ETableItemType,
  ITableHeader,
  ITableItemDirection,
} from '@/interfaces/table.interface'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { mapActions, mapGetters } from 'vuex'
import { ITokenPrice, ITopToken } from '@/interfaces/smartlink.interface'
import { EMPTY_METADATA } from '@/constants/tokens.const'
import { tokenIdentifier } from '@/helpers/token.helper'
import { IChartJSChartData } from '@/interfaces/chartjs.interface'
import dayjs from 'dayjs'

interface ITopTokenItem {
  name: string
  metadata: Partial<ITokenMetadata>
  usd_token_price: number
  pct_token_price_24h: ITableItemDirection
  usd_volume_24h: number
  tvl: number
  priceWeekChart: IChartJSChartData
}

@Component({
  mixins: [numberMixin],
  components: {
    Table,
  },
  computed: {
    ...mapGetters('tokens', ['topTokens', 'tokensMetadata', 'tokenPrice']),
  },
  methods: {
    ...mapActions('tokens', ['getTopTokens']),
  },
})
export default class TopTokens extends Vue {
  getTopTokens!: (params: { isPriceLoaded: boolean }) => Promise<ITopToken[]>
  getPriceByPoolAddress!: (params: {
    poolAddress: string
    tokenAddress: string
    tokenId: number
  }) => Promise<ITokenPrice>

  areContractsLoaded!: boolean
  topTokens!: ITopToken[]
  tokensMetadata!: { [key: string]: ITokenMetadata }
  tokenPrice!: { [key: string]: ITokenPrice[] }
  isTokensLoaded = false

  tableHeaders: ITableHeader[] = [
    {
      spacing: 18,
      displayText: 'Token name',
      key: 'metadata',
      type: ETableItemType.TOKEN,
    },
    {
      spacing: 10,
      displayText: 'Price',
      key: 'usd_token_price',
      type: ETableItemType.PRICE,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 10,
      displayText: 'Price Change',
      key: 'pct_token_price_24h',
      type: ETableItemType.PERCENTAGE_DIRECTION,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 10,
      displayText: 'Volume 24H',
      key: 'usd_volume_24h',
      type: ETableItemType.SHORT_PRICE,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 10,
      displayText: 'TVL',
      key: 'tvl',
      type: ETableItemType.SHORT_PRICE,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 10,
      displayText: 'Last 7 days',
      key: 'priceWeekChart',
      type: ETableItemType.LINE_CHART,
      align: ETableAlignment.RIGHT,
    },
  ]

  get tableItems(): ITopTokenItem[] {
    return this.topTokens.map((token) => {
      const identifier = tokenIdentifier({
        address: token.token_address,
        tokenId: token.token_id || 0,
      })
      const tokenMetadata = this.tokensMetadata[identifier] || EMPTY_METADATA
      const tokenPrices = (this.tokenPrice[identifier] || []).reduce((acc, cur) => {
        const label = dayjs(cur.timestamp).format('YYYY-MM-DD')
        acc[label] = cur
        return acc
      }, {} as any)
      const priceLabels = Array(7).fill(0).map((label, index) => {
        return dayjs().subtract(index, 'day').format('YYYY-MM-DD')
      }).reverse()


      const priceWeekChart = {
        labels: priceLabels,
        datasets: [
          {
            label: 'Last 7 days',
            data: priceLabels.map((label) => tokenPrices[label] ? tokenPrices[label].usd_token_price : 0),
            backgroundColor: 'transparent',
            borderColor: token.pct_token_price_24h ? '#FF6363' : '#3BDBAB',
          },
        ],
      }

      return {
        ...token,
        metadata: tokenMetadata,
        pct_token_price_24h: {
          value: token.pct_token_price_24h,
          direction: token.pct_token_price_24h < 0 ? EItemDirection.DOWN : EItemDirection.UP,
        },
        priceWeekChart,
      }
    })
  }

  async mounted() {
    this.isTokensLoaded = !!this.topTokens.length

    await this.getTopTokens({ isPriceLoaded: true })

    this.isTokensLoaded = true
  }
}
</script>

<style lang="scss" scoped>
.top-tokens {
  &__title {
    font-weight: 600;
    font-size: 20px;
    line-height: 153.5%;
    margin: 0 0 1rem;
  }
}
</style>
