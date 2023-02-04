<template>
  <DefaultLayout>
    <div class="top-gainers-losers mb-14">
      <v-row>
        <v-col 
          cols="12" 
          lg="6" 
          class="d-flex"
        >
          <ChartTabs />
        </v-col>
        <v-col 
          cols="12" 
          lg="6" 
          class="d-flex"
        >
          <SearchOverlayWrapper />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800>
            <TopMovers />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800>
            <TopGainers />
          </Card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <Card secondary2800>
            <TopLosers />
          </Card>
        </v-col>
      </v-row>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

import { mapState } from 'vuex'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import ChartTabs from '@/components/charts/ChartTabs.vue'
import SearchOverlayWrapper from '@/components/SearchOverlayWrapper.vue'
import Card from '@/components/shared/Card.vue'
import TopMovers from '@/components/charts/TopMovers.vue'
import TopGainers from '@/components/charts/TopGainers.vue'
import TopLosers from '@/components/charts/TopLosers.vue'

@Component({
  components: {
    DefaultLayout,
    ChartTabs,
    SearchOverlayWrapper,
    Card,
    TopMovers,
    TopGainers,
    TopLosers,
  },
  computed: {
    ...mapState('dexContracts', ['areContractsLoaded']),
  },
})
export default class TopGainersLosers extends Vue {
  areContractsLoaded!: boolean

  @Watch('areContractsLoaded')
  async loadData() {
    if (this.areContractsLoaded) {
      await this.$store.dispatch('dashboard/loadTimeSeriesPerTokens')
      await this.$store.dispatch('dashboard/loadVolumeTimeSeries')
    }
  }
}
</script>

<style lang="scss" scoped>
.top-gainers-losers {
  display: flex;
  flex-direction: column;

  &__card {
    background: var(--card-background);
    border: 0.5px solid var(--card-border);
    box-sizing: border-box;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    padding: 2rem 3rem;
  }
  &__card-header {
    margin-bottom: 1rem;
  }
  &__card-title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 128%;
    margin: 0;
  }
}
</style>
