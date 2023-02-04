<template>
  <div
    v-if="!isLoading"
    class="table"
    :class="{
      'table--no-height': seeMore,
    }"
  >
    <div class="table__container">
      <table class="table__table" :class="tableClass">
        <!-- TABLE PARTITION -->
        <colgroup>
          <col v-if="hasIndex" style="width: 2%" />
          <col
            v-for="header in headers"
            :key="header.key"
            :style="{
              width: `${header.spacing}%`,
            }"
          />
        </colgroup>

        <!-- TABLE HEADERS -->
        <thead>
          <tr>
            <th v-if="hasIndex">
              <div class="table__header justify-start">#</div>
            </th>
            <th v-for="header in headers" :key="header.key">
              <div
                class="table__header select-none cursor-pointer hover:opacity-90"
                :class="{
                  'justify-start':
                    header.align === eTableAlignments.LEFT ||
                    (header.align !== eTableAlignments.CENTER &&
                      header.align !== eTableAlignments.RIGHT),
                  'justify-center': header.align === eTableAlignments.CENTER,
                  'justify-end': header.align === eTableAlignments.RIGHT,
                }"
              >
                <span @click="sortItems(header.key)">
                  {{ header.displayText }}
                  <TableSortArrow
                    class="ml-2"
                    :sort="header.key"
                    :current-sort="sortBy"
                    :direction="sortDirection"
                  />
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- TABLE BODY -->
        <tbody>
          <tr v-for="(item, index) in shownItems" :key="`${item.key}`">
            <td v-if="hasIndex">
              <div class="table__item justify-start">
                {{ startIndex + index + 1 }}
              </div>
            </td>
            <td v-for="header in headers" :key="`${header.key}`">
              <div
                class="table__item"
                :class="{
                  'justify-start':
                    header.align === eTableAlignments.LEFT ||
                    (header.align !== eTableAlignments.CENTER &&
                      header.align !== eTableAlignments.RIGHT),
                  'justify-center': header.align === eTableAlignments.CENTER,
                  'justify-end': header.align === eTableAlignments.RIGHT,
                }"
              >
                <template v-if="eTableItemTypes.TEXT_PAIR === header.type">
                  <span v-for="pair in item[header.key]" :key="pair.text"> {{ pair.text }} </span>
                </template>

                <template v-else-if="eTableItemTypes.TOKEN === header.type">
                  <router-link
                    class="d-flex align-center"
                    :to="{
                      name: 'TokenDashboard',
                      query: {
                        address: item.address || item.token_address,
                        tokenId: item.tokenId || item.token_id,
                      },
                    }"
                  >
                    <TokenImage class="table__image mr-4" :src="item[header.key].thumbnailUri" />
                    <span class="table__text mr-4"> {{ item[header.key].name }} </span>
                    <span class="table__text text-secondary-500">
                      ({{ item[header.key].symbol }})
                    </span>
                  </router-link>
                </template>

                <template v-else-if="eTableItemTypes.TOKEN_PAIR === header.type">
                  <div class="table__pair">
                    <TokenImage
                      v-for="pair in item[header.key]"
                      :key="pair.thumbnailUri"
                      class="table__image table__pair-image"
                      :src="pair.thumbnailUri"
                    />
                    <span
                      v-for="pair in item[header.key]"
                      :key="pair.symbol"
                      class="table__pair-text"
                    >
                      {{ pair.symbol }}
                    </span>
                  </div>
                </template>

                <template v-else-if="eTableItemTypes.TOKEN_PAIR_LINK === header.type">
                  <a :href="item[header.key].link" 
                    class="d-flex align-center whitespace-nowrap"
                    @click="$emit('click-link', item[header.key].link)"
                  >
                    <TokenImage
                      v-for="pair in item[header.key].tokens"
                      :key="pair.thumbnailUri"
                      class="table__image table__pair-image"
                      :src="pair.thumbnailUri"
                    />
                    <span
                      v-for="pair in item[header.key].tokens"
                      :key="pair.symbol"
                      class="table__pair-text"
                    >
                      {{ pair.symbol }}
                    </span>
                  </a>
                </template>

                <template v-else-if="eTableItemTypes.POOL === header.type">
                  <router-link
                    class="d-flex align-center whitespace-nowrap"
                    :to="{
                      name: 'PoolDashboard',
                      query: { address: item.address || item.pool_address },
                    }"
                  >
                    <TokenImage
                      v-for="pair in item[header.key]"
                      :key="pair.thumbnailUri"
                      class="table__image table__pair-image"
                      :src="pair.thumbnailUri"
                    />
                    <span
                      v-for="pair in item[header.key]"
                      :key="pair.symbol"
                      class="table__pair-text"
                    >
                      {{ pair.symbol }}
                    </span>
                    <span class="table__pair-fee ml-4">
                      <span class="table__pair-fee-text">0.25%</span>
                    </span>
                  </router-link>
                </template>

                <template v-else-if="eTableItemTypes.NUMBER === header.type">
                  {{ item[header.key] | readableNumber(null, 0) }}
                </template>

                <template v-else-if="eTableItemTypes.SHORT_NUMBER === header.type">
                  {{ item[header.key] | shortNumber }}
                </template>

                <template v-else-if="eTableItemTypes.PRICE === header.type">
                  ${{ item[header.key] | readableNumber }}
                </template>

                <template v-else-if="eTableItemTypes.PERCENTAGE === header.type">
                  {{ item[header.key] | readableNumber }}%
                </template>

                <template v-else-if="eTableItemTypes.SHORT_PRICE === header.type">
                  ${{ item[header.key] | shortNumber }}
                </template>

                <template v-else-if="eTableItemTypes.PRICE_DIRECTION === header.type">
                  <span
                    class="mr-1"
                    :class="{
                      'text-positive': item[header.key].direction === eItemDirections.UP,
                      'text-negative': item[header.key].direction === eItemDirections.DOWN,
                    }"
                    >${{ item[header.key].value | readableNumber }}</span
                  >

                  <img
                    v-if="item[header.key].direction === eItemDirections.UP"
                    src="@/assets/arrow-up.svg"
                    alt=""
                  />
                  <img v-else src="@/assets/arrow-down.svg" alt="" />
                </template>

                <template v-else-if="eTableItemTypes.PERCENTAGE_DIRECTION === header.type">
                  <span
                    class="mr-1"
                    :class="{
                      'text-positive': item[header.key].direction === eItemDirections.UP,
                      'text-negative': item[header.key].direction === eItemDirections.DOWN,
                    }"
                    >{{ item[header.key].value | readableNumber }}%</span
                  >

                  <img
                    v-if="item[header.key].direction === eItemDirections.UP"
                    src="@/assets/arrow-up.svg"
                    alt=""
                  />
                  <img v-else src="@/assets/arrow-down.svg" alt="" />
                </template>

                <template v-else-if="eTableItemTypes.SHORT_PRICE_DIRECTION === header.type">
                  <span
                    class="mr-1"
                    :class="{
                      'text-positive': item[header.key].direction === eItemDirections.UP,
                      'text-negative': item[header.key].direction === eItemDirections.DOWN,
                    }"
                    >${{ item[header.key].value | shortNumber }}</span
                  >

                  <img
                    v-if="item[header.key].direction === eItemDirections.UP"
                    src="@/assets/arrow-up.svg"
                    alt=""
                  />
                  <img v-else src="@/assets/arrow-down.svg" alt="" />
                </template>

                <template v-else-if="eTableItemTypes.LINE_CHART === header.type">
                  <LineChart
                    :key="item.name"
                    class="h-32px w-180px my-n1"
                    :chart-data="item[header.key]"
                  />
                </template>

                <template v-else>
                  {{ item[header.key] }}
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="perPage" class="table__footer">
      <div class="table__footer-arrow">
        <button v-if="!isFirstPage" @click="curPage -= 1">&#8592;</button>
      </div>
      <h3 class="table__footer-pages">Page {{ curPage }} of {{ maxPage }}</h3>
      <div class="table__footer-arrow table__footer-arrow--next">
        <button v-if="!isLastPage" @click="curPage += 1">&#8594;</button>
      </div>
    </div>

    <div
      v-else-if="seeMore && !seeMoreExpanded"
      class="text-yellow font-semibold cursor-pointer select-none mt-10px hover:opacity-90"
      @click="expandSeeMore"
    >
      See More
    </div>
  </div>

  <div
    v-else
    class="table"
    :class="{
      'table--no-height': seeMore,
    }"
  >
    <div class="table__container">
      <table class="table__table" :class="tableClass">
        <!-- TABLE PARTITION -->
        <colgroup>
          <col style="width: 1%" />
          <col style="width: 18%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
        </colgroup>
        <thead>
          <tr>
            <th>
              <div class="my-0.85rem mr-0.25rem h-20px w-8px content-placeholder rounded"></div>
            </th>
            <th>
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </th>
            <th align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </th>
            <th align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </th>
            <th align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </th>
            <th align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </th>
            <th align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="index in seeMore || 8" :key="index">
            <td>
              <div class="my-0.85rem mr-0.25rem h-20px w-8px content-placeholder rounded"></div>
            </td>
            <td>
              <div class="my-0.85rem mx-0.25rem d-flex align-center">
                <div class="h-28px w-28px content-placeholder rounded-circle mr-4"></div>
                <div class="h-20px w-64px content-placeholder rounded mr-4"></div>
                <div class="h-20px w-48px content-placeholder rounded"></div>
              </div>
            </td>
            <td align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </td>
            <td align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </td>
            <td align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </td>
            <td align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-64px content-placeholder rounded"></div>
            </td>
            <td align="right">
              <div class="my-0.85rem mx-0.25rem h-20px w-180px content-placeholder rounded"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import TokenImage from '@/components/shared/TokenImage.vue'

import {
  EItemDirection,
  ETableAlignment,
  ETableItemType,
  ITableHeader,
  ITableItem,
} from '@/interfaces/table.interface'

import { numberMixin } from '@/mixins/number.mixin'
import LineChart from '@/components/shared/LineChart.vue'
import TableSortArrow from '@/components/TableSortArrow.vue'
import { hasProperty, isObject } from '@/helpers/object.helper'

@Component({
  mixins: [numberMixin],
  components: {
    TokenImage,
    LineChart,
    TableSortArrow,
  },
})
export default class Table extends Vue {
  eTableItemTypes = ETableItemType
  eTableAlignments = ETableAlignment
  eItemDirections = EItemDirection

  @Prop({ type: Boolean }) isLoading!: boolean
  @Prop({ type: Boolean }) hasIndex!: boolean
  @Prop({ type: Array, default: () => [] }) headers!: ITableHeader[]
  @Prop({ type: Array, default: () => [] }) items!: ITableItem[]
  @Prop({ type: Number, default: 1 }) curPage!: number
  @Prop({ type: Number }) perPage!: number
  @Prop({ type: Number }) seeMore!: number
  @Prop({ type: String }) tableClass!: string
  @Prop({ type: String }) defaultSort!: string

  sortBy!: string
  sortDirection: 'asc' | 'desc' = 'desc'
  tableItems: ITableItem[] = []
  seeMoreExpanded = false

  get isFirstPage() {
    return this.curPage === 1
  }

  get isLastPage() {
    return this.curPage === this.maxPage
  }

  get maxPage() {
    return Math.ceil(this.items.length / this.perPage)
  }

  get startIndex() {
    const trueIndex = this.curPage - 1
    return trueIndex * this.perPage
  }

  get endIndex() {
    if (!this.perPage) return this.tableItems.length - 1
    return this.startIndex + this.perPage
  }

  get shownItems() {
    if (this.seeMore && this.seeMoreExpanded) return this.tableItems
    else if (this.seeMore) return this.tableItems.slice(0, this.seeMore)

    return this.tableItems.slice(this.startIndex, this.endIndex)
  }

  mounted() {
    this.sortItems(this.defaultSort)
  }

  @Watch('items')
  reinit() {
    this.sortItems(this.sortBy, true)
  }

  sortItems(sort: string, freezeDirection?: boolean): void {
    if (!freezeDirection)
      this.sortDirection = this.sortBy !== sort || this.sortDirection === 'asc' ? 'desc' : 'asc'
    this.sortBy = sort

    this.tableItems = [...this.items].sort((a, b) => {
      if (a[this.sortBy] === b[this.sortBy]) return 0

      const DIRECTION = {
        UP: this.sortDirection === 'desc' ? 1 : -1,
        DOWN: this.sortDirection === 'desc' ? -1 : 1,
      }

      switch (typeof a[this.sortBy]) {
        case 'number':
          return a[this.sortBy] < b[this.sortBy] ? DIRECTION.UP : DIRECTION.DOWN

        case 'string':
          return a[this.sortBy].toLowerCase() < b[this.sortBy].toLowerCase()
            ? DIRECTION.UP
            : DIRECTION.DOWN

        default:
          if (isObject(a[this.sortBy]) && hasProperty(a[this.sortBy], 'value')) {
            return a[this.sortBy].value < b[this.sortBy].value ? DIRECTION.UP : DIRECTION.DOWN
          }

          if (isObject(a[this.sortBy]) && hasProperty(a[this.sortBy], 'name')) {
            return a[this.sortBy].name.toLowerCase() < b[this.sortBy].name.toLowerCase()
              ? DIRECTION.UP
              : DIRECTION.DOWN
          }

          if (Array.isArray(a[this.sortBy]) && hasProperty(a[this.sortBy][1], 'name')) {
            return a[this.sortBy][1].name.toLowerCase() < b[this.sortBy][1].name.toLowerCase()
              ? DIRECTION.UP
              : DIRECTION.DOWN
          }

          return 0
      }
    })
  }

  expandSeeMore() {
    this.seeMoreExpanded = true
  }
}
</script>

<style lang="scss" scoped>
.table {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 600px;

  &--no-height {
    min-height: unset;
  }

  &__container {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    overflow: auto;
  }

  &__table {
    table-layout: fixed;
  }

  &__image {
    width: 28px;
    height: 28px;
  }

  &__header,
  &__item {
    display: flex;
    align-items: center;
    padding: 0.85rem 0.25rem;
  }

  &__header {
    font-weight: 600;
    font-size: 1rem;
    line-height: 153.5%;
    display: flex;
    color: var(--secondary-400);
  }

  &__item {
    font-weight: 600;
    font-size: 1rem;
    line-height: 153.5%;
  }

  &__pair {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
  &__pair-fee {
    background: var(--secondary-badge-background);
    padding: 0 0.5rem;
    border-radius: 5px;
  }
  &__pair-fee-text {
    display: block;
    margin-top: -2px;
  }
  &__pair-image {
    z-index: 1;
  }
  &__pair-image + &__pair-image {
    z-index: 0;
    margin-left: -0.25rem;
  }

  &__pair-image + &__pair-text {
    z-index: 0;
    margin-left: 0.75rem;
  }

  &__pair-text + &__pair-text:before {
    content: '-';
    font-weight: 600;
    font-size: 1rem;
    margin: 0 0.1rem 0 0.25rem;
  }

  &__text {
    font-weight: 600;
    font-size: 1rem;
    line-height: 153.5%;
  }

  &__footer {
    display: flex;
    justify-content: center;
    padding: 1rem;
    margin-top: auto;
    border-top: 1px solid var(--border);
  }
  &__footer-pages {
    margin: 0 0.5rem;
    font-size: 16px;
  }

  &__footer-arrow {
    width: 2rem;
    display: flex;
    justify-content: flex-end;

    &--next {
      justify-content: flex-start;
    }
  }
}
</style>
