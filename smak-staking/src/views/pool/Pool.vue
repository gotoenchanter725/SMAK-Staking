<template>
  <div class="pool">
    <div>
      <OverlayDialog :show="confirming">
        <div class="alert confirming">
          <moon-loader
            class="mr-3"
            color="white"
            loading="true"
            size="20"
            sizeUnit="px"
          ></moon-loader>
          <div class="text">Confirming...</div>
        </div>
      </OverlayDialog>

      <OverlayDialog :show="walletError">
        <div class="alert notsuccessful">
          ⚠️
          <div class="text ml-3">{{ errormsg }}</div>
        </div>
      </OverlayDialog>

      <OverlayDialog :show="isConfirmed">
        <div class="alert confirmation">
          <v-icon dark right> mdi-check-circle-outline </v-icon>
          <div class="text ml-3">Success</div>
        </div>
      </OverlayDialog>
    </div>
    <PoolBody></PoolBody>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import Component from 'vue-class-component'
import OverlayDialog from '@/components/OverlayDialog.vue'
import PoolBody from '@/components/PoolBody.vue'

const PoolProps = Vue.extend({
  props: {
    errormsg: String,
    action: String,
    confirming: Boolean,
    walletError: Boolean,
  },
})

@Component({
  components: {
    OverlayDialog,
    PoolBody,
  },
  computed: {
    ...mapState('wallet', ['isWalletConnected', 'showConnectedWallet', 'userAddress', 'tk']),
    ...mapState('notificationCenter', ['isConfirmed']),
    ...mapState(['theme']),
  },
})
export default class Pool extends PoolProps {}
</script>
