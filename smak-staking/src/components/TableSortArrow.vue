<template>
  <div class="d-inline-block text" v-if="sort && currentSort && sort === currentSort">
    <span class="icon" v-if="direction === 'desc'">
      <img src="@/assets/arrow-down--gray.svg" alt="">
    </span>
    <span class="icon" v-else>
      <img class="rotate-180" src="@/assets/arrow-down--gray.svg" alt="">
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  props: {
    direction: {
      type: String,
      default: 'asc',
    },
    sort: {
      type: String,
      default: '',
    },
    currentSort: {
      type: String,
      default: '',
    },
  },
})
export default class TableSortArrow extends Vue {}
</script>

<style lang="scss" scoped>
.icon {
  font-size: 18px;
  padding: 0 4px;
  color: var(--text2);
}
</style>
