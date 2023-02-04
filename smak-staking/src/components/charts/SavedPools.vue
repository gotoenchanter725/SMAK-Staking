<template>
  <div class="saved-pools pt-6">
    <h3 class="saved-pools__title px-6">Saved Pools</h3>

    <Table
      has-index
      :headers="tableHeaders"
      :items="tableItems"
      :per-page="8"
      table-class="px-6"
      :is-loading="!isTokensLoaded"
      default-sort="roi_1y"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Table from '@/components/shared/Table.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { ISwapToken } from '@/interfaces/swap-token.interface'
import { ETableAlignment, ETableItemType, ITableHeader } from '@/interfaces/table.interface'
import { mapActions, mapGetters } from 'vuex'
import { TOKEN_METADATA } from '@/constants/tokens.const'
import { TOKENS } from '@/constants/tokens.const'
import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { ITopPool } from '@/interfaces/smartlink.interface'

interface ISavedPoolsItem {
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
    ...mapGetters('dashboard', ['watchlistPools']),
  },
  methods: {
    ...mapActions('pools', ['getTopPools'])
  }
})
export default class SavedPools extends Vue {
  getTopPools!: () => Promise<ITopPool[]>
  watchlistPools!: ITopPool[]
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

  get tableItems(): ISavedPoolsItem[] {
    return this.watchlistPools.map((poolToken) => {
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
        roi_1y: poolToken.roi_1y * 100
      }
    })
  }

  async mounted() {
    this.isTokensLoaded = !!this.watchlistPools.length;

    await this.getTopPools()

    this.isTokensLoaded = true
  }
}
</script>

<style lang="scss" scoped>
.saved-pools {
  &__title {
    font-weight: 600;
    font-size: 20px;
    line-height: 153.5%;
    margin: 0 0 1rem;
  }
}
</style>
