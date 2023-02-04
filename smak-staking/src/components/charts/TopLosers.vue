<template>
  <div class="top-losers pt-8">
    <h3 class="top-losers__title px-6">Top losers 24h</h3>

    <Table has-index :headers="tableHeaders" :items="tableItems" :per-page="8" table-class="px-6" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Table from '@/components/shared/Table.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { ISwapToken } from '@/interfaces/swap-token.interface'
import { TOKEN_METADATA, TOKENS } from '@/constants/tokens.const';
import {
  EItemDirection,
  ETableAlignment,
  ETableItemType,
  ITableHeader,
  ITableItem,
} from '@/interfaces/table.interface'
import { mapActions, mapState } from 'vuex';

@Component({
  mixins: [numberMixin],
  components: {
    Table,
  },
  computed: {
    ...mapState('farms', ['tokenMap'])
  },
  methods: {
    ...mapActions({
      query: 'farms/query',
      setTokens: 'farms/setTokens'
    })
  }
})
export default class TopLosers extends Vue {
  areContractsLoaded!: boolean
  swapTokens!: ISwapToken[]
  tokenMap!: Map<string,any>
  tableItems = new Array<ITableItem>()
  query!: (url:string) => any
  setTokens!: () => void

  tableHeaders: ITableHeader[] = [
    {
      spacing: 38,
      displayText: 'Token name',
      key: 'tokens',
      type: ETableItemType.POOL,
    },
    {
      spacing: 20,
      displayText: 'Fees',
      key: 'fees',
      type: ETableItemType.PRICE_DIRECTION,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 20,
      displayText: 'TVL',
      key: 'tvl',
      type: ETableItemType.SHORT_PRICE_DIRECTION,
      align: ETableAlignment.RIGHT,
    },
    // {
    //   spacing: 20,
    //   displayText: 'Liquidity',
    //   key: 'liquidity',
    //   type: ETableItemType.PERCENTAGE_DIRECTION,
    //   align: ETableAlignment.RIGHT,
    // },
  ]
  async beforeMount() {
    await this.setTokens()
    const result = await this.query("https://smartlink-indexer-api.deployments.smart-chain.fr/v1/top/losers")
    for (const pool of result) {
      const tvl = (await this.query(`https://smartlink-indexer-api.deployments.smart-chain.fr/v1/pool/${pool.pool_address}/value_locked?rate=D`))[0]
      this.tableItems.push({
        ...pool,
        tokens: [
          TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId].metadata,
          this.tokenMap.get(pool.symbol).metadata
        ],
        fees: {
          direction: pool.pct_change < 0 ? EItemDirection.DOWN : EItemDirection.UP, 
          value: pool.usd_fees
        },
        tvl : {
          direction: tvl.pct_change < 0 ? EItemDirection.DOWN : EItemDirection.UP,
          value: tvl.vl_usd
        },
        liquidity:{
          direction:tvl.pct_change < 0 ? EItemDirection.DOWN : EItemDirection.UP,
          value: tvl.pct_change 
        }
      })
    }

  }
  // tableItems: ITableItem[] = Array(20).fill({
  //   tokens: [
  //     TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId].metadata,
  //     TOKEN_METADATA[TOKENS.SMAK.address][TOKENS.SMAK.tokenId].metadata,
  //   ],
  //   fees: { direction: EItemDirection.DOWN, value: 500 },
  //   tvl: { direction: EItemDirection.DOWN, value: 3_450_000 },
  //   liquidity: { direction: EItemDirection.DOWN, value: 200 },
  // })
}
</script>

<style lang="scss" scoped>
.top-losers {
  &__title {
    font-weight: 600;
    font-size: 20px;
    line-height: 153.5%;
    margin: 0 0 1rem;
  }
}
</style>