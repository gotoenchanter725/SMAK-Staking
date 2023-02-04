<template>
  <div>
    <v-row justify="space-between">
      <v-col cols="8">
        <div class="balance-smak ml-0">
          Balance: {{ Number(userBalance).toLocaleString('en-US') }} SMAK
        </div>
      </v-col>
      <v-col cols="4">
        <div class="stake-max" style="text-align: right" @click="useMax()">
          <u style="cursor: pointer">Use Max</u>
        </div>
      </v-col>
    </v-row>
    <div class="smak-input-wrapper">
      <input
        type="text"
        id="name"
        name="name"
        autocomplete="off"
        placeholder="0"
        v-model="ticketsToBuyStr"
        max="200"
        min="0"
        onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46"
      />
      TICKETS
    </div>

    <div class="d-flex minimum-value">
      <div v-if="!isValid" class="error-msg">
        {{ errorMsg }}
      </div>
      <v-spacer />
      <div v-if="isValid">Total Price = {{ Number(totalPrice).toLocaleString('en-US') }} SMAK</div>
    </div>

    <div class="connect-wallet-btn connected" @click="buy">Buy tickets</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import lotteryData from '@/modules/lottery-data'

@Component
export default class extends Vue {
  @Prop({ type: Number }) userBalance!: number

  ticketsToBuyStr = ''
  @Watch('ticketsToBuyStr')
  onTicketsChange(value: string) {
    this.errorMsg = ''
    this.isValid = true

    if (this.ticketsToBuyStr.includes('.')) {
      this.errorMsg = 'Please enter an integer value'
      this.isValid = false
      return
    }

    this.ticketsToBuy = value ? Number.parseInt(value) : 0

    if (this.totalPrice > this.userBalance) {
      this.errorMsg = 'Buying price above balance'
      this.isValid = false
      return
    }
  }
  ticketsToBuy = 0

  get totalPrice() {
    return this.ticketsToBuy * lotteryData.ticketPrice
  }

  errorMsg = ''
  isValid = true

  useMax() {
    this.ticketsToBuyStr = Math.min(
      Math.floor(this.userBalance / lotteryData.ticketPrice),
      lotteryData.ticketsPerRound - Object.keys(lotteryData.tickets).length)
      .toString();
  }

  buy() {
    if (this.isValid) {
      this.$emit('buy', this.ticketsToBuy)
      this.ticketsToBuyStr = ''
    }
  }
}
</script>

<style scoped></style>
