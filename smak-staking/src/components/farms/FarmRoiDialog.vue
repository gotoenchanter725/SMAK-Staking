<template>
  <Dialog v-model="isFarmRoiShown" :max-width="580" @close="closeFarmRoiDialog">
    <div class="farm-rio-dialog">
      <div class="farm-rio-dialog__header mb-4">
        <div class="farm-rio-dialog__header-title">ROI Calculator</div>
        <div class="farm-rio-dialog__header-close" @click="closeFarmRoiDialog">&times;</div>
      </div>

      <div class="d-flex mb-2">
        <Card
          class="px-4 py-3 d-flex flex-column w-full mr-sm-2 cursor-text"
          gradient
          @click="onStakedClicked"
        >
          <p class="font-bold text-14px mb-2 pointer-events-none">
            {{xtz.metadata ? xtz.metadata.symbol : "" }}-{{ poolToken.metadata ? poolToken.metadata.symbol : "" }} LP STAKED
          </p>

          <div class="ml-auto d-flex align-center">
            <div v-if="isUsdInput" class="text-right mr-2">
              <div class="text-21px font-semibold d-flex justify-end">
                <input
                  ref="usdInput"
                  v-model="inputUsd"
                  class="text-right w-full"
                  type="text"
                  placeholder="0"
                  v-on:keypress="isNumber($event)"
                />
                <p class="text-primary-1500 ml-2 mb-0">USD</p>
              </div>
              <div class="text-primary-1500 text-13px font-semibold mb-0 d-flex justify-end">
                {{ inputLp || '0' }}
                <span class="text-primary-1500 ml-2">
                  {{xtz.metadata  ? xtz.metadata.symbol : "" }}-{{ poolToken.metadata ? poolToken.metadata.symbol : "" }} LP
                </span>
              </div>
            </div>

            <div v-else class="text-right mr-2">
              <div class="text-21px font-semibold d-flex justify-end">
                <input
                  ref="lpInput"
                  v-model="inputLp"
                  class="text-right w-full"
                  type="text"
                  placeholder="0"
                />
                <p class="text-primary-1500 whitespace-nowrap ml-2 mb-0">{{ xtz.metadata  ? xtz.metadata.symbol : "" }}-{{ poolToken.metadata ? poolToken.metadata.symbol : "" }} LP</p>
              </div>
              <div class="text-primary-1500 text-13px font-semibold mb-0 d-flex justify-end">
                {{ inputUsd | readableNumber }}
                <span class="text-primary-1500 ml-2">
                  USD
                </span>
              </div>
            </div>

            <button
              class="
                d-flex
                align-center
                justify-center
                px-1
                py-1
                rounded-circle
                border-primary-2100
                transition
                hover:rotate-180
              "
              @click="isUsdInput = !isUsdInput"
            >
              <SwapIcon class="w-20px h-20px" />
            </button>
          </div>
          <InfoTooltip class="absolute bottom-12px left-12px h-12px w-12px">
            {{ getCurrentFarm() ? getCurrentFarm().apr: 9999 | readableNumber }}
          </InfoTooltip>
        </Card>
        <div class="flex-column justify-space-between d-none d-sm-flex">
          <button
            class="
              font-semibold
              bg-secondary-2100
              border-secondary-2200
              w-109px
              rounded-9px
              h-29px
              hover:opacity-90
            "
            @click="setInputUsd(100)"
          >
            $100
          </button>
          <button
            class="
              font-semibold
              bg-secondary-2100
              border-secondary-2200
              w-109px
              rounded-9px
              h-29px
              hover:opacity-90
            "
            @click="setInputUsd(1000)"
          >
            $1,000
          </button>
          <button
            class="
              font-semibold
              bg-secondary-2100
              border-secondary-2200
              w-109px
              rounded-9px
              h-29px
              hover:opacity-90
            "
            @click="setInputUsd(10000)"
          >
            $10,000
          </button>
        </div>
      </div>

      <Card class="px-4 pt-3 pb-2 pb-sm-4 mb-2 d-flex flex-column" secondary2100>
        <p class="font-bold text-14px mb-4">STAKED FOR</p>
        <div class="d-flex flex-wrap justify-sm-space-between">
          <button
            v-for="stakedFor in listStakedFor"
            :key="stakedFor.value"
            class="
              rounded-10px
              font-semibold
              w-90px
              h-29px
              mr-2
              mb-2
              mr-sm-0
              mb-sm-0
              hover:opacity-90
            "
            :class="{
              'bg-primary-1700 text-white': stakedFor.value === selectedStakedFor.value,
              'border-secondary-2300 bg-secondary-2400 text-primary-1800':
                stakedFor.value !== selectedStakedFor.value,
            }"
            @click="onStakedForClicked(stakedFor)"
          >
            {{ stakedFor.displayText }}
          </button>
        </div>
      </Card>

      <Card class="px-4 pt-3 pb-2 pb-sm-4 mb-2 d-flex flex-column" secondary2100>
        <p class="font-bold text-14px mb-4">COMPOUNDING EVERY</p>
        <div class="d-flex flex-wrap align-center justify-sm-space-between">
          <Checkbox v-model="isCompoundChecked" @click="isCompoundChecked=!isCompoundChecked" class="mr-2 mb-2 mr-sm-0 mb-sm-0" />
          <button
            v-for="compountedEvery in listCompountedEvery"
            :key="compountedEvery.value"
            class="
              rounded-10px
              font-semibold
              w-76px
              h-29px
              mr-2
              mb-2
              mr-sm-0
              mb-sm-0
              hover:opacity-90
            "
            :class="{
              'bg-primary-1900 text-white': compountedEvery.value === selectedCompountedEvery.value,
              'border-secondary-2300 bg-secondary-2400 text-primary-1800':
                compountedEvery.value !== selectedCompountedEvery.value,
            }"
            @click="onCompoundEveryClicked(compountedEvery)"
          >
            {{ compountedEvery.displayText }}
          </button>
        </div>
      </Card>

      <Card class="px-4 py-4 d-flex flex-column flex-sm-row align-sm-center" gradientPrimary400>
        <p class="text-primary-1300 text-14px font-bold mb-4 mb-sm-0">EXPECTED ROI</p>
        <Card class="ml-auto px-4 py-2 d-flex align-center w-full w-lg-271px overflow-x-auto" fountainBlue>
          <p class="text-primary-1500 text-21px font-bold mb-0 mr-4">$</p>
          <div class="ml-auto text-right">
            <p class="text-21px font-semibold mb-0 whitespace-nowrap">{{ expectedRoi | readableNumber }} USD</p>
            <p class="text-primary-1500 font-semibold mb-0">
              ~{{ tokenRoi | readableNumber }} SMAK
            </p>
          </div>
        </Card>
      </Card>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { mapGetters, mapMutations, mapState } from 'vuex'

import Dialog from '@/components/shared/Dialog.vue'
import Card from '@/components/shared/Card.vue'
import TokenImage from '@/components/shared/TokenImage.vue'
import InfoTooltip from '@/components/shared/InfoTooltip.vue'
import Checkbox from '@/components/shared/Checkbox.vue'
import SwapIcon from '@/components/svgs/SwapIcon.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { IFarm } from '@/interfaces/farm.interface'

const STAKED_FOR = {
  ONE_WEEK: { displayText: '1 Week', value: 7 },
  ONE_MONTH: { displayText: '1 Month', value: 30 },
  SIX_MONTHS: { displayText: '6 Months', value: 30 * 6 },
  ONE_YEAR: { displayText: '1 Year', value: 365.25 },
  FIVE_YEARS: { displayText: '5 Years', value: 365.25 * 5 },
}

const COMPOUNDING_EVERY = {
  ONE_WEEK: { displayText: '1 Week', value: 52.1429 },
  TWO_WEEKS: { displayText: '2 Weeks', value: 52.1429 / 2 },
  THREE_WEEKS: { displayText: '3 Weeks', value: 52.1429 / 3 },
  ONE_MONTH: { displayText: '1 Month', value: 52.1429 / (30 / 7) },
  TWO_MONTHS: { displayText: '2 Months', value: 52.1429 / (60 / 7) },
}

@Component({
  mixins: [numberMixin],
  components: {
    Dialog,
    Card,
    TokenImage,
    Checkbox,
    SwapIcon,
    InfoTooltip,
  },
  computed: {
    ...mapGetters('farms', ['isFarmRoiShown']),
    ...mapState('farms', ['farmAddress', 'farmList']),
  },
  methods: {
    ...mapMutations('farms', ['closeFarmRoiDialog']),
  },
})
export default class FarmRoiDialog extends Vue {
  inputUsd: number | null = null
  inputLp: number | null  = null
  isFarmRoiShown!: boolean
  closeFarmRoiDialog!: () => void
  isNumber!: (element: HTMLElement) => boolean
  farmAddress!: string
  farmList!: IFarm[]
  isUsdInput = true

  xtz = {}
  poolToken = {}

  listStakedFor = STAKED_FOR
  selectedStakedFor = STAKED_FOR.ONE_WEEK

  listCompountedEvery = COMPOUNDING_EVERY
  selectedCompountedEvery = COMPOUNDING_EVERY.ONE_WEEK
  isCompoundChecked = false

  expectedRoi = 0
  tokenRoi = 0

  updated() {
    if (this.getCurrentFarm()) {
      this.xtz = this.getCurrentFarm().tokenA
      this.poolToken = this.getCurrentFarm().tokenB
    }
  }

  setInputUsd(num: number) {
    this.inputUsd = num
  }

  onStakedForClicked(stakedFor: typeof STAKED_FOR.ONE_WEEK) {
    this.selectedStakedFor = stakedFor
  }

  onCompoundEveryClicked(compoundEvery: typeof COMPOUNDING_EVERY.ONE_WEEK) {
    this.selectedCompountedEvery = compoundEvery
  }

  @Watch('inputUsd')
  setInputLp() {
    if (this.isUsdInput) this.inputLp = (this.inputUsd || 0) / this.getCurrentFarm().lpUsd 
  }

  @Watch('inputLp')
  setUsd() {
    if (!this.isUsdInput) this.inputUsd = (this.inputLp || 0) * this.getCurrentFarm().lpUsd 
  }

  @Watch('inputUsd')
  @Watch('selectedStakedFor.value')
  @Watch('selectedCompountedEvery.value')
  @Watch('isCompoundChecked')
  getRoi() {
    this.expectedRoi = this.isCompoundChecked ? this.getRoiWithCompound() : this.getRoiWithoutCompound()
    this.tokenRoi = this.expectedRoi / this.getCurrentFarm().smakPriceUsd
  }

  getRoiWithoutCompound() {
    const farm = this.getCurrentFarm()
    const rate = farm.apr / 100
    this.inputUsd = this.inputUsd || (this.inputLp || 0) * farm.lpUsd
    return this.inputUsd + rate * this.inputUsd * this.selectedStakedFor.value / STAKED_FOR.ONE_YEAR.value
  }

  getRoiWithCompound() {
    const farm = this.getCurrentFarm()
    const apr = farm.apr
    const nbOfComp = this.selectedCompountedEvery.value
    const rate = (1 + apr/(100 * nbOfComp)) ** nbOfComp -1
    this.inputUsd = this.inputUsd || (this.inputLp || 0) * farm.lpUsd
    return this.inputUsd + rate * this.inputUsd * this.selectedStakedFor.value / STAKED_FOR.ONE_YEAR.value
  }

  getCurrentFarm() {
    for (const farm of this.farmList) {
      if (farm.contractAddress === this.farmAddress) return farm
    }
    return this.farmList[0]
  }

  onStakedClicked() {
    if (this.isUsdInput) {
      (this.$refs.usdInput as HTMLElement).focus()
      return
    }
    
    (this.$refs.lpInput as HTMLElement).focus()
  }

}
</script>

<style lang="scss" scoped>
.farm-rio-dialog {
  padding: 1.3rem 1.5rem 1.5rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__header-title {
    font-family: 'Source Sans Pro', Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
  }
  &__header-close {
    font-size: 2.25rem;
    margin: -1.25rem 0;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>