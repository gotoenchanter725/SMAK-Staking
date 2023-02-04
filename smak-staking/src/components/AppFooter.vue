<template>
  <div class="my-5 my-md-8 pl-4 pl-sm-2 pl-md-8">
    <v-row class="staking-dashboard-cols mx-auto" no-gutters>
      <v-col>
        <div>
          <a
            class="footer-btn btn btn-secondary d-inline-flex justify-center mr-3"
            href="https://smartlinklabs.gitbook.io/faqs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="font-semibold">Have questions?</span>
            <v-icon color="white" class="icon ml-2 font-weight-light" small>
              mdi-open-in-new
            </v-icon>
          </a>

          <a
            class="footer-btn btn btn-primary d-inline-flex justify-center"
            href="https://pyratzlabs.com/smartlink-contract-audits/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="font-semibold">Security Audit</span>
            <v-icon color="white" class="icon ml-2 font-weight-light" small>
              mdi-open-in-new
            </v-icon>
          </a>
        </div>

        <ContractAddress class="d-block d-lg-none align-self-start" />
      </v-col>

      <v-col
        md="3"
        cols="12"
        class="d-flex flex-column justify-md-end align-md-end pr-lg-4 pr-md-7"
      >
        <SocialNetworks class="mb-6" />

        <div class="d-flex mr-4">
          <div class="tezos-mainnet text-caption"><slot>V 1.2 - Vortex</slot></div>
          <div class="ellipse-76 mb-2"></div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ContractAddress from '@/components/lottery/ContractAddress.vue'

@Component({
  components: { ContractAddress },
})
export default class AppFooter extends Vue {}
</script>
