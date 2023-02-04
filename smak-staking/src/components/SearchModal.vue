<template>
  <v-dialog
    v-model="showSearchModal"
    @click:outside="close"
    persistent
    :content-class="theme"
    :max-width="600"
    transition="fade-transition"
  >
    <div class="search-modal pannel">
      <search-modal-table></search-modal-table>
      <search-modal-table-pools></search-modal-table-pools>
    </div>
  </v-dialog>
</template>

<script>
// Vuex
import { mapState } from 'vuex'

// Display
import { Component, Vue } from 'vue-property-decorator'
import SearchModalTable from './SearchModalTable.vue'
import SearchModalTablePools from './SearchModalTablePools.vue'

const SearchModalProps = Vue.extend({
  props: {},
})

@Component({
  components: {
    SearchModalTable,
    SearchModalTablePools,
  },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'tk']),
    ...mapState(['theme']),
    ...mapState('dashboard', ['showSearchModal']),
  },
})
export default class SearchModal extends SearchModalProps {
  /**
   * Search Modal
   */

  close() {
    this.$store.commit('dashboard/updateShowSearchModal', false)
  }
}
</script>

<style lang="scss" scoped>
.search-modal {
  border: 1px solid;
  border-color: var(--search-mod-border);
  position: absolute;
  top: 231px;
  right: 8rem;
  background: var(--search-mod);
  max-width: 52%;
  padding: 17px 29px 17px 29px;
  border-radius: 10px !important;
}

// Responsive
@media only screen and (max-width: 700px) {
}
</style>
