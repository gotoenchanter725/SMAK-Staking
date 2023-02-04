<template>
  <DashboardLayout>
    <div class="dashboard">
      <MyWallet class="dashboard__my-wallet" />
      <MarketInfo class="dashboard__market-info" />
      <TotalTvl class="dashboard__total-tvl" />
      <Vortex class="dashboard__vortex" />
      <EarnSmak class="dashboard__earn-smak" />
      <WinSmak class="dashboard__win-smak" />
      <XtzActions class="dashboard__xtz-actions" />
      <SmartlinkFaqs class="dashboard__smartlink-faqs" />
    </div>
    <VortexLive />
  </DashboardLayout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import DashboardLayout from '@/layouts/DashboardLayout.vue'

import MyWallet from '@/components/dashboard/MyWallet.vue'
import MarketInfo from '@/components/dashboard/MarketInfo.vue'
import TotalTvl from '@/components/dashboard/TotalTvl.vue'
import Vortex from '@/components/dashboard/Vortex.vue'
import EarnSmak from '@/components/dashboard/EarnSmak.vue'
import WinSmak from '@/components/dashboard/WinSmak.vue'
import XtzActions from '@/components/dashboard/XtzActions.vue'
import SmartlinkFaqs from '@/components/dashboard/SmartlinkFaqs.vue'
import VortexLive from '@/components/shared/VortexLive.vue'

@Component({
  components: {
    DashboardLayout,
    MyWallet,
    MarketInfo,
    TotalTvl,
    Vortex,
    EarnSmak,
    WinSmak,
    XtzActions,
    SmartlinkFaqs,
    VortexLive,
  },
})
export default class Dashboard extends Vue {}
</script>

<style lang="scss" scoped>
.dashboard {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-areas:
    'my-wallet my-wallet market-info market-info total-tvl total-tvl'
    'vortex vortex vortex earn-smak earn-smak earn-smak'
    'win-smak win-smak xtz-actions xtz-actions smartlink-faqs smartlink-faqs';
  gap: 1.5rem;
  width: 100%;
  justify-content: center;
  margin: 0 0 1rem;
  padding: 0 0 1.5rem;

  &__my-wallet {
    grid-area: my-wallet;
  }

  &__market-info {
    grid-area: market-info;
  }

  &__total-tvl {
    grid-area: total-tvl;
  }

  &__vortex {
    grid-area: vortex;
  }

  &__earn-smak {
    grid-area: earn-smak;
  }

  &__win-smak {
    grid-area: win-smak;
  }

  &__xtz-actions {
    grid-area: xtz-actions;
  }

  &__smartlink-faqs {
    grid-area: smartlink-faqs;
  }
}

@media (max-width: 600px) {
  .dashboard {
    grid-template-columns: 100%;
    grid-template-areas: 'my-wallet' 'market-info' 'total-tvl' 'vortex' 'earn-smak' 'win-smak' 'xtz-actions' 'smartlink-faqs' 'footer-vortex';
    grid-auto-flow: row;
    height: auto;
  }
}

@media (min-width: 600px) and (max-width: 960px) {
  .dashboard {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'my-wallet market-info'
      'total-tvl win-smak'
      'vortex vortex'
      'earn-smak earn-smak'
      'xtz-actions smartlink-faqs';
    }
}

@media (min-width: 960px) and (max-width: 1264px) {
  .dashboard {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'my-wallet market-info'
      'total-tvl win-smak'
      'vortex earn-smak'
      'xtz-actions smartlink-faqs';
    }
}
</style>
