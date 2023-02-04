<template>
  <div class="top-pools pt-6">
    <h3 class="top-pools__title px-6">Top Pools</h3>

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
import { ETableAlignment, ETableItemType, ITableHeader } from '@/interfaces/table.interface'
import { mapActions, mapGetters } from 'vuex'
import { EMPTY_METADATA, TOKEN_METADATA } from '@/constants/tokens.const'
import { TOKENS } from '@/constants/tokens.const'
import { ITopPool } from '@/interfaces/smartlink.interface'
import { ITokenMetadata } from '@/interfaces/token.interface'

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
  components: {
    Table,
  },
  computed: {
    ...mapGetters('pools', ['topPools']),
  },
  methods: {
    ...mapActions('pools', ['getTopPools'])
  }
})
export default class TopPools extends Vue {
  getTopPools!: () => Promise<ITopPool[]>
  topPools!: ITopPool[]
  isTokensLoaded = false

  tableHeaders: ITableHeader[] = [
    {
      spacing: 18,
      displayText: 'Token name',
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
      displayText: 'Fees 24H',
      key: 'fees_24h',
      type: ETableItemType.PRICE,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 10,
      displayText: 'Fees 7D',
      key: 'fees_7d',
      type: ETableItemType.PRICE,
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
      displayText: 'ROI(1Y)',
      key: 'roi_1y',
      type: ETableItemType.PERCENTAGE,
      align: ETableAlignment.RIGHT,
    },
  ]

  get tableItems(): ITopPoolItem[] {
    return this.topPools.map((poolToken) => {
      return {
        ...poolToken,
        tokens: [
          { ...TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId].metadata },
          poolToken.metadata || EMPTY_METADATA
        ],
        roi_1y: poolToken.roi_1y * 100,
      }
    })
  }

  async mounted() {
    this.isTokensLoaded = !!this.topPools.length;

    await this.getTopPools()

    this.isTokensLoaded = true
  }
}
</script>

<style lang="scss" scoped>
.top-pools {
  &__title {
    font-weight: 600;
    font-size: 20px;
    line-height: 153.5%;
    margin: 0 0 1rem;
  }
}
</style>
