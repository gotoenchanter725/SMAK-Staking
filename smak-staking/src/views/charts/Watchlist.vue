<template>
  <DefaultLayout>
    <div class="watchlist mb-14">
      <v-row>
        <v-col cols="12" lg="6" class="d-flex">
          <ChartTabs />
        </v-col>
        <v-col cols="12" lg="6" class="d-flex">
          <SearchOverlayWrapper />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card>
            <SavedTokens />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card>
            <SavedPools />
          </Card>
        </v-col>
      </v-row>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import ChartTabs from '@/components/charts/ChartTabs.vue'
import SearchOverlayWrapper from '@/components/SearchOverlayWrapper.vue'
import Card from '@/components/shared/Card.vue'
import SavedTokens from '@/components/charts/SavedTokens.vue'
import SavedPools from '@/components/charts/SavedPools.vue'
import { mapState } from 'vuex'

@Component({
  components: {
    DefaultLayout,
    ChartTabs,
    SearchOverlayWrapper,
    Card,
    SavedTokens,
    SavedPools,
  },
  computed: {
    ...mapState('dexContracts', ['areContractsLoaded']),
  },
})
export default class Watchlist extends Vue {
  areContractsLoaded!: boolean

  @Watch('areContractsLoaded')
  async loadData(): Promise<void> {
    if (this.areContractsLoaded) {
      await this.$store.dispatch('dashboard/loadTimeSeriesPerTokens')
    }
  }
}
</script>

<style lang="scss" scoped>
.watchlist {
  display: flex;
  flex-direction: column;
}
</style>
