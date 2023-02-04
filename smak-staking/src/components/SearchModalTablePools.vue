<template>
  <Table :headers="tableHeaders" :items="shownTokens" :is-loading="!shownTokens.length" default-sort="tvl" :see-more="3" />
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Table from '@/components/shared/Table.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { ITokenMetadata } from '@/interfaces/token.interface'
import { ETableAlignment, ETableItemType, ITableHeader } from '@/interfaces/table.interface'
import { ITopPool } from '@/interfaces/smartlink.interface'
import { TOKENS, TOKEN_METADATA } from '@/constants/tokens.const'

interface ITopPoolItem {
  tokens: Partial<ITokenMetadata>[]
  usd_volume_24h: number
  usd_volume_7d: number
  fees_24h: number
  fees_7d: number
  tvl: number
  roi_1y: number
}

@Component({
  mixins: [numberMixin],
  components: { Table },
  computed: {
    ...mapGetters('pools', ['topPools']),
  },
})
export default class SearchModalTable extends Vue {
  topPools!: ITopPool[]

  @Prop({ type: String, default: '' }) value!: string

  tableHeaders: ITableHeader[] = [
    {
      spacing: 18,
      displayText: 'Top Pools',
      key: 'tokens',
      type: ETableItemType.POOL,
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
      displayText: 'Volume 7D',
      key: 'usd_volume_7d',
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
  ]

  get shownTokens(): ITopPoolItem[] {
    return this.tableItems
      .filter((token) => {
        const search = this.value.toLowerCase()
        const tokenSymbol = (token.tokens[1].symbol || '').toLowerCase()
        const tokenName = (token.tokens[1].name || '').toLowerCase()

        return [tokenSymbol, tokenName].some((criteria) => criteria.includes(search))
      })
  }

  get tableItems(): ITopPoolItem[] {
    return this.topPools.map((poolToken) => {
      return {
        ...poolToken,
        tokens: [
          { ...TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId].metadata },
          { 
            name: poolToken.name,
            symbol: poolToken.symbol,
            thumbnailUri: poolToken.icon
           },
        ],
      }
    })
  }

}
</script>

<style lang="scss" scoped>
.search-modal-table-wrapper {
  &__no-shown {
    height: 50px;
    font-size: 14px;
    text-align: left;
  }

  .search-modal-table {
    width: 100%;
    color: var(--text);

    .search-modal-table-header {
      width: 100%;
      line-height: 3rem;

      th {
        color: var(--text2);
        cursor: pointer;
      }
    }

    .search-modal-table-body {
      .search-modal-table-row {
        > * {
          padding: 0.6rem 0;
          font-weight: 900;
        }
        .token-name-column {
          display: flex;
          align-items: center;

          > * {
            margin: 0 0.4rem;
          }

          .token-abreviation {
            flex: 1;
            color: var(--text2);
          }

          img {
            width: 30px;
            height: 30px;
          }
        }
      }
    }

    .right-aligned-column {
      text-align: right;
    }

    .left-aligned-column {
      text-align: left;
    }
  }

  .see-more-button {
    color: var(--search-see-more);
    margin-top: 13px;
    margin-left: 10px;

    &:hover {
      cursor: pointer;
    }
  }

  .xtz-thumbnail {
  }

  .token-thumbnail {
    transform: translateX(-1.5rem);
    z-index: 2;
  }

  .token-name-wrapper {
    transform: translateX(-1.5rem);
    display: flex;

    p {
      margin-right: 1rem;
      margin-bottom: 0;
    }
  }
}

// Responsive
@media only screen and (max-width: 700px) {
}
</style>
