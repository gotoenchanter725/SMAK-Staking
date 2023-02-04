<template>
  <div class="parent">
    <transition name="fade">
      <div class="search-token-overlay" v-show="showOverlay" @click="displayOverlay(false)"></div>
    </transition>

    <div 
      class="search-token-input-wrapper mt-auto" 
      :class="{
        'search-token-input-wrapper--focus': showOverlay,
      }"
    >
      <input
        type="text"
        placeholder="Search pools or tokens"
        @click="displayOverlay"
        v-model="searchInput"
      />
      <h3 class="maginifying-glass">&#9906;</h3>

      <transition name="fade">
        <div class="search-token-container" v-if="showOverlay">
          <search-modal-table v-model="searchInput"></search-modal-table>
          <search-modal-table-pools v-model="searchInput"></search-modal-table-pools>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
// Vuex
import { mapState } from 'vuex'

// Display
import { Component, Vue, Watch } from 'vue-property-decorator'
import SearchModalTable from '@/components/SearchModalTable.vue'
import SearchModalTablePools from './SearchModalTablePools.vue'

@Component({
  components: { SearchModalTable, SearchModalTablePools },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'tk']),
    ...mapState(['theme']),
    ...mapState('dashboard', ['showSearchModal']),
  },
})
export default class SearchOverlayWrapper extends Vue {
  searchInput = ''
  showOverlay = false

  displayOverlay(show = true): void {
    this.showOverlay = show
    this.$store.commit('dashboard/updateShowSearchModal', show)
  }

  destroyed() {
    this.displayOverlay(false)
  }

  @Watch('$route')
  onChangeRoute() {
    this.displayOverlay(false)
  }
}
</script>

<style lang="scss" scoped>
.search-token-input-wrapper {
  display: flex;
  background-color: var(--pannel);
  padding: 0.6rem 2rem;
  border-radius: 14px;
  position: relative;
  margin-top: auto;
  width: 100%;

  &--focus {
    z-index: 1000;
  }

  input {
    flex: 1;
    color: var(--text);
    width: 100%;
  }

  .maginifying-glass {
    transform: rotate(-45deg);
  }
}
::placeholder {
  color: rgb(124, 122, 155);
}
.parent {
  width: 100%;
}

.search-token-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  opacity: 0.74;
  background: #111119;
  transition: all 1s;
}

.search-token-container {
  z-index: 1000;
  position: absolute;
  border: 1px solid var(--search-mod-border);
  top: 100%;
  right: 0;
  margin-top: 16px;
  width: 100%;
  background: var(--search-mod);
  padding: 17px;
  border-radius: 12px;

  @media screen and (min-width: 845px) {
    min-width: 680px;
  }

  @media screen and (min-width: 980px) {
    min-width: 850px;
  }
}
</style>
