<template>
  <div class="pt-8 pt-lg-16 mt-lg-8 pt-sm-16 px-16">
    <v-container fluid>
      <v-row class="d-flex justify-center">
        <v-col md="8" cols="0" v-if="$vuetify.breakpoint.lg || $vuetify.breakpoint.xl">
          <div class="graph-wrapper">
            <slot name="graph"></slot>

            <div class="d-flex mt-10">
              <SocialNetworks />

              <a
                class="ml-auto footer-btn btn btn-secondary d-inline-flex justify-center mr-3"
                href="https://docs.smartlink.so/"
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
                href="https://drive.google.com/file/d/1n1fS8Vqhxzil37vL3WwOLC-v1HONcPol/view"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="font-semibold">Security Audit</span>
                <v-icon color="white" class="icon ml-2 font-weight-light" small>
                  mdi-open-in-new
                </v-icon>
              </a>

              <VortexLive />
            </div>
          </div>
        </v-col>
        <v-col class="card-col" cols="12" lg="4">
          <div class="card-wrapper">
            <slot name="card"></slot>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
// Vuex
import { mapState } from 'vuex'

// Display
import { Component, Vue } from 'vue-property-decorator'

import VortexLive from '@/components/shared/VortexLive.vue'

const DexLayoutProps = Vue.extend({
  props: {},
})

@Component({
  components: {
    VortexLive,
  },
  computed: {
    ...mapState(['theme']),
  },
})
export default class DexLayout extends DexLayoutProps {}
</script>

<style lang="scss" scoped>
.app-padding {
  // ONLY DEX PAGE - Need fluid (100%) layout
  margin: 30px -7rem 0 -7rem !important;
}

.app-wrapper {
  display: flex;
  flex-direction: row;

  .graph-wrapper {
    width: 100%;
    margin-right: 2rem;
  }

  .card-wrapper {
    max-width: 424px !important;
    min-width: 424px !important;
    margin-top: 0px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-width: 20rem;
    flex-direction: column;
  }
}

@media only screen and (max-width: 700px) {
  .app-wrapper {
    flex-direction: column;
  }

  .app-wrapper {
    .graph-wrapper {
      width: 100%;
      display: none;
    }

    .card-wrapper {
      width: 100%;
    }
  }
}

.card-col {
  max-width: 424px;
  width: 424px;
  padding: 0;
  flex-shrink: 0;
}
</style>
