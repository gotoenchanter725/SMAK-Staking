<template>
  <Table :headers="tableHeaders" :items="shownTokens" :is-loading="!shownTokens.length" default-sort="tvl" :see-more="3" />
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Table from '@/components/shared/Table.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { EItemDirection, ETableAlignment, ETableItemType, ITableHeader, ITableItemDirection } from '@/interfaces/table.interface'
import { ITopToken } from '@/interfaces/smartlink.interface'
import { tokenIdentifier } from '@/helpers/token.helper'
import { EMPTY_METADATA } from '@/constants/tokens.const';
import { ITokenMetadata } from '@/interfaces/token.interface'

interface ITopTokenItem {
  name: string
  metadata: Partial<ITokenMetadata>
  usd_token_price: number,
  pct_token_price_24h: ITableItemDirection,
  usd_volume_24h: number,
  tvl: number,
  // priceWeekChart: IChartJSChartData,
}

@Component({
  mixins: [numberMixin],
  components: { Table },
  computed: {
    ...mapGetters('tokens', ['topTokens', 'tokensMetadata']),
  },
})
export default class SearchModalTable extends Vue {
  @Prop({ type: String, default: '' }) value!: string

  topTokens!: ITopToken[]
  tokensMetadata!: { [key: string]: ITokenMetadata }


  tableHeaders: ITableHeader[] = [
    {
      spacing: 18,
      displayText: 'Top Tokens',
      key: 'metadata',
      type: ETableItemType.TOKEN,
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
      displayText: 'Price',
      key: 'usd_token_price',
      type: ETableItemType.PRICE,
      align: ETableAlignment.RIGHT,
    },
  ]


  get tableItems(): ITopTokenItem[] {
    return this.topTokens.map(token => {
      const identifier = tokenIdentifier({
        address: token.token_address,
        tokenId: token.token_id || 0
      })
      const tokenMetadata = this.tokensMetadata[identifier] || EMPTY_METADATA

      return {
        ...token,
        metadata: tokenMetadata,
        pct_token_price_24h: {
          value: token.pct_token_price_24h,
          direction: token.pct_token_price_24h < 0 ? EItemDirection.DOWN : EItemDirection.UP,
        }
      }
    })
  }

  get shownTokens(): ITopTokenItem[] {
    return this.tableItems
      .filter((token) => {
        const search = this.value.toLowerCase()
        const tokenSymbol = (token.metadata.symbol || '').toLowerCase()
        const tokenName = (token.metadata.name || '').toLowerCase()

        return [tokenSymbol, tokenName].some((criteria) => criteria.includes(search))
      })
  }

}
</script>
