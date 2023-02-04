<template>
  <div class="relative d-flex">
    <transition name="fade">
      <div
        v-show="isResultShown"
        class="fixed top-0 left-0 w-screen h-screen bg-secondary-1800 z-210"
        @click="hideResults"
      ></div>
    </transition>

    <SearchInput
      :class="{
        'z-220': isResultShown,
      }"
      placeholder="Search farms"
      v-model="searchInput"
      @click="showResults"
    />

    <transition name="fade">
      <div
        v-if="isResultShown"
        class="
          bg-secondary-1900
          border-gradient-primary-200
          rounded-14px
          w-full w-lg-735px
          px-5
          pt-2
          pb-4
          z-220
          absolute
          top-4rem
          right-0
        "
      >
        <Table :headers="tableHeaders" :items="res" default-sort="apy" :see-more="5" @click-link="onLinkClicked" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import SearchInput from '@/components/shared/SearchInput.vue'
import SearchIcon from '@/components/svgs/SearchIcon.vue'
import { ITokenMetadata } from '@/interfaces/token.interface'
import Table from '@/components/shared/Table.vue'
import { ETableAlignment, ETableItemType, ITableHeader, ITablePairLink } from '@/interfaces/table.interface'
import { IFarm } from '@/interfaces/farm.interface'
import { numberMixin } from '@/mixins/number.mixin'
import { tokenIdentifier } from '../../helpers/token.helper';
import { EMPTY_METADATA } from '../../constants/tokens.const';
import { mapGetters } from 'vuex'

interface IFarmSearchItem {
  pair: ITablePairLink
  liquidity: number
  apr: string
  apy: string
}

@Component({
  components: {
    SearchInput,
    SearchIcon,
    Table,
  },
  computed: {
    ...mapGetters('tokens', ['tokensMetadata'])
  }
})
export default class FarmSearch extends Vue {
  @Prop(Object) farmList!: IFarm[]
  tableItems: IFarmSearchItem[] = []
  res: IFarmSearchItem[] = []
  isResultShown = false
  searchInput = ''
  tokensMetadata!: { [key: string]: ITokenMetadata }

  tableHeaders: ITableHeader[] = [
    {
      spacing: 40,
      displayText: 'Farm name',
      key: 'pair',
      type: ETableItemType.TOKEN_PAIR_LINK,
    },
    {
      spacing: 20,
      displayText: 'Liquidity',
      key: 'liquidity',
      type: ETableItemType.PRICE,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 20,
      displayText: 'APR',
      key: 'apr',
      type: ETableItemType.TEXT,
      align: ETableAlignment.RIGHT,
    },
    {
      spacing: 20,
      displayText: 'APY',
      key: 'apy',
      type: ETableItemType.TEXT,
      align: ETableAlignment.RIGHT,
    },
  ]
  

  @Watch('farmList')
  setInitial() {
    let temp = new Array<IFarmSearchItem>()
    for (const farm of this.farmList) {
      const identifier = tokenIdentifier({ address: farm.tokenB.address, tokenId: farm.tokenB.metadata.tokenId })
      const tokenMetadataB = this.tokensMetadata[identifier] || farm.tokenB.metadata || EMPTY_METADATA
      const item: IFarmSearchItem = {
        pair: { 
          tokens: [
          farm.tokenA.metadata,
          tokenMetadataB
        ],
        link: `#${farm.contractAddress}`
        },
        liquidity: farm.tvl,
        apr: numberMixin.filters.limitNumber(farm.apr, 2, 0) + '%',
        apy: numberMixin.filters.limitNumber(farm.apy, 2, 0) + '%',
      }
      temp .push(
        item
      )
    } 
    this.tableItems = [...temp]
    this.res = [...temp]
  } 

  @Watch('searchInput')
  searchName() {
    this.res = this.tableItems.filter(item => (item.pair.tokens[1] as any).symbol.toLowerCase().startsWith(this.searchInput.toLowerCase()))
  }
  showResults() {
    this.isResultShown = true
  }

  hideResults() {
    this.isResultShown = false
  }

  onLinkClicked(linkId: string) {
    this.hideResults()

    const farmCard = document.querySelector(linkId)

    farmCard?.classList.add('scale-animate')

    setTimeout(() => {
      farmCard?.classList.remove('scale-animate')
    }, 1000)
  }
}
</script>