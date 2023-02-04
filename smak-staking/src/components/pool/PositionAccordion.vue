<template>
  <div
    class="position-accordion rounded-19px px-2 py-2"
    :class="{
      'position-accordion--open': isCollapsed,
    }"
  >
    <div class="position-accordion__main rounded-1rem px-6 py-5 overflow-y-hidden">
      <div class="position-accordion__header d-flex flex-column flex-sm-row flex-wrap relative">
        <div class="grid grid-flow-col auto-cols-max gap-1rem align-center mb-8 mb-sm-0">
          <div class="d-flex align-center">
            <TokenImage
              :src="xtzIconImage"
              alt="XTZ Token"
              class="position-accordion__token-image"
            />
            <TokenImage
              :src="tokenMetadata.thumbnailUri"
              :alt="`${tokenMetadata.symbol} Token`"
              class="position-accordion__token-image"
            />
          </div>
          <router-link
            :to="`/dashboard/pool?address=${swapContract.address}`"
            class="font-ssp font-semibold text-18px"
            >XTZ - {{ tokenMetadata.symbol }}</router-link
          >
        </div>

        <div class="ml-sm-auto d-flex align-center mr-sm-90px">
          <button
            class="
              mr-2
              position-accordion__lp-contract
              d-flex
              align-center
              bg-secondary
              font-ssp font-semibold
              text-15px
              px-3
              py-0.5
              rounded-lg
              hover:opacity-90
            "
            @click="openLpContract"
          >
            <img v-if="theme === 'dark'" src="@/assets/question-circle.svg" alt="" class="mr-1" />
            <img v-else src="@/assets/question-circle-light.svg" alt="" class="mr-1 py-0.5" />
            <span class="d-block">LP Contract</span>
          </button>
          <router-link
            :to="{ name: 'Farms' }"
            class="
              text-white
              d-flex
              align-center
              bg-primary
              font-ssp font-semibold
              text-15px
              px-3
              py-0.5
              rounded-lg
              hover:opacity-90
            "
          >
            Stake LP Tokens
          </router-link>
          <AddLiquiditySuccessDialog />
        </div>

        <div
          class="absolute top-2px right-0 d-flex align-center cursor-pointer hover:opacity-90"
          @click="toggleMetricsDisplay"
        >
          <p class="position-accordion__manage mb-0 font-ssp font-semibold font-18px mr-2">
            Manage
          </p>
          <svg
            class="text-secondary-100 transition"
            :class="{
              'rotate-180': isCollapsed,
            }"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"
            />
          </svg>
        </div>
      </div>

      <div class="position-accordion__body">
        <div class="d-flex flex-wrap justify-space-between justify-sm-start text-right">
          <div class="flex-lg-grow-1 mr-4 mr-sm-8 mt-8">
            <div class="w-max">
              <p
                class="
                  mb-5
                  d-flex
                  align-center
                  justify-end
                  h-32px
                  font-ssp font-semibold
                  text-14.5px
                "
              >
                <TokenImage
                  class="position-accordion__token-image mr-2"
                  :src="xtzIconImage"
                  alt="XTZ Token"
                />
                Pooled XTZ
              </p>
              <p class="mb-0 font-ssp font-semibold text-14.5px">
                {{ xtzPooled | readableNumber }}
              </p>
            </div>
          </div>

          <div class="flex-lg-grow-1 mr-4 mr-sm-8 mt-8">
            <div class="w-max">
              <p
                class="
                  mb-5
                  d-flex
                  align-center
                  justify-end
                  h-32px
                  font-ssp font-semibold
                  text-14.5px
                "
              >
                <TokenImage
                  class="position-accordion__token-image mr-2"
                  :src="tokenMetadata.thumbnailUri"
                  :alt="`${tokenMetadata.symbol} Token`"
                />
                Pooled {{ tokenMetadata.symbol }}
              </p>
              <p class="mb-0 font-ssp font-semibold text-14.5px">
                {{ tokensPooled | readableNumber }}
              </p>
            </div>
          </div>

          <div class="flex-lg-grow-1 mr-4 mr-sm-8 mt-8">
            <div class="w-max">
              <p
                class="
                  mb-5
                  d-flex
                  align-center
                  justify-end
                  h-32px
                  font-ssp font-semibold
                  text-14.5px
                "
              >
                Current Value
              </p>
              <p class="mb-0 font-ssp font-semibold text-14.5px">
                ${{ currentValue | readableNumber }}
              </p>
            </div>
          </div>

          <div class="flex-lg-grow-1 mr-4 mr-sm-8 mt-8">
            <div class="w-max">
              <p
                class="
                  mb-5
                  d-flex
                  align-center
                  justify-end
                  h-32px
                  font-ssp font-semibold
                  text-14.5px
                "
              >
                Amount Invested
              </p>
              <p class="mb-0 font-ssp font-semibold text-14.5px">
                ${{ initialValue | readableNumber }}
              </p>
            </div>
          </div>

          <div class="flex-lg-grow-1 mr-4 mr-sm-8 mt-8">
            <div class="w-max">
              <p
                class="
                  mb-5
                  d-flex
                  align-center
                  justify-end
                  h-32px
                  font-ssp font-semibold
                  text-14.5px
                "
              >
                Net ROI
              </p>
              <p
                class="mb-0 font-ssp font-semibold text-14.5px d-flex align-center"
                :class="{
                  'text-positive': Number(getNetRoi()) >= 0,
                  'text-negative': Number(getNetRoi()) < 0,
                }"
              >
                <img
                  v-if="isFinite(+getNetRoi())"
                  class="mr-1"
                  :src="
                    require(`@/assets/${Number(getNetRoi()) >= 0 ? 'arrow-up' : 'arrow-down'}.svg`)
                  "
                  alt=""
                />
                {{ isFinite(+getNetRoi()) ? `${getNetRoi()}%` : 'N/A' }}
              </p>
            </div>
          </div>

          <div class="flex-lg-grow-1 mr-4 mr-sm-8 mt-8">
            <div class="w-max">
              <p
                class="
                  mb-5
                  d-flex
                  align-center
                  justify-end
                  h-32px
                  font-ssp font-semibold
                  text-14.5px
                "
              >
                LP tokens
              </p>
              <p class="mb-0 font-ssp font-semibold text-14.5px">
                {{ lpTokens | readableNumber }}
              </p>
            </div>
          </div>

          <div class="flex-lg-grow-1 mr-4 mr-sm-8 mt-8">
            <div class="w-max">
              <p
                class="
                  mb-5
                  d-flex
                  align-center
                  justify-end
                  h-32px
                  font-ssp font-semibold
                  text-14.5px
                "
              >
                Pool share
              </p>
              <p class="mb-0 font-ssp font-semibold text-14.5px">{{ poolShare | readableNumber(4) }}%</p>
            </div>
          </div>

          <div class="w-max mt-8">
            <div class="mb-5 d-flex align-center justify-end h-32px">
              <button
                class="
                  bg-tertiary-100
                  text-white
                  px-3
                  py-0.5
                  rounded-pill
                  d-flex
                  align-center
                  font-ssp font-semibold
                  text-14.5px
                  hover:opacity-90
                "
                @click="$store.dispatch('pool/showRemoveLiquidityDialog', swapContract)"
              >
                <img class="mr-1" src="@/assets/remove-icon.svg" alt="Remove Icon" />
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import { Component, Prop, Vue } from 'vue-property-decorator'

import TokenImage from '@/components/shared/TokenImage.vue'

import { ITokenMetadata } from '@/modules/contractInterfaces/FA12'
import { SwapContract } from '@/modules/contractInterfaces/swap'
import { TimeSeries } from '@/modules/timeSeries'
import { DexIndexer, InvestorPositionsEntry } from '@/modules/dexIndexer'
import { numberMixin } from '@/mixins/number.mixin'
import { IAddLiquiditySuccessModal } from '@/store/swap'

const dexIndexer = new DexIndexer()

@Component({
  mixins: [numberMixin],
  components: {
    TokenImage,
  },
  computed: {
    ...mapState(['theme']),
    ...mapState('wallet', ['userAddress']),
    ...mapState('dexContracts', ['xtzPriceHistory']),
  },
})
export default class PositionAccordion extends Vue {
  @Prop({ type: Object, default: () => ({}) }) tokenMetadata!: ITokenMetadata
  @Prop({ type: String, default: '0' }) xtzPooled!: string
  @Prop({ type: String, default: '0' }) tokensPooled!: string
  @Prop({ type: Number, default: 0 }) lpTokens!: number
  @Prop({ type: String, default: '0' }) poolShare!: string
  @Prop({ type: Object, default: () => SwapContract }) swapContract!: SwapContract
  @Prop({ type: String, default: '0' }) currentValue!: string
  @Prop({ type: String, default: '0' }) initialValue!: string
  @Prop({ type: Boolean, default: false }) isCollapsed!: boolean
  @Prop({ type: Boolean, default: false }) showRemoveModal!: boolean
  @Prop(Object) position!: InvestorPositionsEntry

  xtzIconImage = 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png'
  theme!: string
  userAddress!: string
  initialInvestment = '0'
  xtzPriceHistory!: TimeSeries

  getNetRoi(): string {
    const initialValue = Number(this.initialValue)
    const roi = (Number(this.currentValue) / initialValue - 1) * 100
    return roi.toFixed(2)
  }

  toggleMetricsDisplay(): void {
    this.isCollapsed = !this.isCollapsed
  }

  openLpContract(): void {
    const successModalInfo: IAddLiquiditySuccessModal = {
      show: true,
      tokenAddress: this.swapContract.storage.tokenAddress,
      tokenId: this.swapContract.getTokenId(),
      liquidityCreated: this.lpTokens,
      xtzIn: Number(numberMixin.filters.readableNumber(+this.xtzPooled)),
      tokenIn: Number(numberMixin.filters.readableNumber(+this.tokensPooled)),
      liquidityTokenAddress: this.swapContract.storage.lqtAddress || this.position.lqt_address,
      tokenMetadata: this.tokenMetadata,
      poolAddress: this.position.pool_address
    }
    this.$store.commit('swap/updateAddLiquiditySuccessModal', successModalInfo)
  }
}
</script>

<style lang="scss">
.position-accordion {
  height: 89px;
  width: 100%;
  border: 1px solid var(--pool-accordion-border);
  background: var(--pool-accordion-outer-background);
  transition: height 0.15s ease-out;

  &--open {
    height: 100%;
  }

  &__main {
    height: 100%;
    width: 100%;
    background: var(--pool-accordion-inner-background);
  }

  &__token-image {
    height: 28px;
    width: 28px;
    position: relative;
    z-index: 1;
  }
  &__token-image + &__token-image {
    margin-left: -0.5rem;
    position: relative;
    z-index: 0;
  }

  &__lp-contract {
    &:active {
      box-shadow: inset 1px 1px 10px var(--button-active-shadow);
    }
  }

  &__manage {
    color: var(--primary-100);
  }

  &__arrow {
    color: var(--text2) !important;
  }
}
</style>
