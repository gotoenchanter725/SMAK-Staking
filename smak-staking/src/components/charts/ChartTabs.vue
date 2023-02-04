<template>
  <div class="chart-tabs">
    <router-link
      v-for="tab in tabs"
      :key="tab.routeName"
      class="chart-tabs__tab whitespace-nowrap hover:opacity-90"
      :class="{
        'chart-tabs__tab--active': $route.name === tab.routeName,
      }"
      :to="{ name: tab.routeName }"
    >
      <img
        v-if="tab.icon"
        class="mr-2"
        :class="{
          'filter-invert-80': theme === 'light',
        }"
        :src="tab.icon"
        :alt="tab.displayName"
      />
      {{ tab.displayName }}
    </router-link>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  computed: {
    ...mapState(['theme']),
  },
})
export default class ChartTabs extends Vue {
  theme!: string

  tabs = [
    {
      displayName: 'Charts',
      routeName: 'Charts',
    },
    {
      displayName: 'Analytics',
      routeName: 'Analytics',
    },
    {
      displayName: 'Top gainers/losers',
      routeName: 'TopGainersLosers',
    },
    {
      displayName: 'Watchlist',
      routeName: 'Watchlist',
      icon: require('@/assets/star-icon.svg'),
    },
  ]
}
</script>

<style lang="scss" scoped>
.chart-tabs {
  display: grid;
  grid-auto-flow: column;
  gap: 1rem;
  align-items: flex-end;
  justify-content: flex-end;

  &__tab {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--tab-background);
    border: 1px solid var(--tab-border) !important;
    box-sizing: border-box;
    border-radius: 10px;
    padding: 0.25rem 1rem;
    margin: 0;
    min-width: 100px;

    &--active {
      background: var(--tab-background-active);
    }
  }
}

@media screen and (max-width: 600px) {
  .chart-tabs {
    grid-auto-flow: unset;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
