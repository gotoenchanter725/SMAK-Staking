<template>
  <Card class="py-2 px-2 relative z-10" gradient>
    <Card class="pt-3 pb-4 px-3 px-lg-4 mb-2" gradient-secondary>
      <div class="grid grid-flow-row grid-lg-flow-col mb-4">
        <div class="d-flex align-center mb-4">
          <div class="d-flex align-center mr-2 mr-sm-4">
            <TokenImage
              class="h-28px z-1"
              :src="farm.tokenA.metadata.thumbnailUri"
              :alt="farm.tokenA.metadata.symbol"
            />
            <TokenImage
              class="h-28px -ml-0.25rem z-0"
              :src="tokenMetadataB.thumbnailUri"
              :alt="tokenMetadataB.symbol"
            />
          </div>
          <p class="text-18px font-semibold mb-0 mr-2 mr-sm-4 whitespace-nowrap">
            {{ farm.tokenA.metadata.symbol }} - {{ tokenMetadataB.symbol }}
          </p>
          <Badge
            v-if="farm.badge === farmBadge.HOT"
            class="text-white text-13px font-semibold mr-2 mr-sm-4"
            >hot 🔥</Badge
          >
          <Badge
            v-if="farm.badge === farmBadge.NEW"
            class="text-white text-13px font-semibold mr-2 mr-sm-4"
            gradient-green
          >
            new
          </Badge>
          <Badge
            class="
              text-white text-16px
              font-semibold
              rounded-9px
              px-3
              d-flex
              align-center
              cursor-pointer
              hover:opacity-90
            "
            primary1600
            @click="setContractsInfo(); showFarmRoiDialog();"
          >
            <span class="mr-2 -mt-2px">ROI</span>
            <CalculatorIcon @click="setContractsInfo"/>
          </Badge>
          <div class="bg-primary-1600 semibold"></div>
        </div>

        <div class="d-flex flex-lg-column align-lg-end align-center">
          <p class="font-semibold opacity-60 mb-0 mr-4 mr-lg-0">TVL</p>
          <p class="font-semibold text-18px mb-0">${{ farm.tvl | shortNumber }}</p>
        </div>

        <div class="d-lg-flex flex-column align-end d-none">
          <p class="font-semibold d-flex align-center mb-0">
            <span class="opacity-60 mr-1">Earned</span>
            <InfoTooltip position="right"> Total earned for this farm. </InfoTooltip>
          </p>
          <p class="font-semibold text-18px mb-0">${{ farm.total_earned | shortNumber }}</p>
        </div>

        <div class="d-lg-flex flex-column align-end d-none">
          <p class="font-semibold d-flex align-center mb-0">
            <span class="opacity-60 mr-1">Rewards</span>
            <InfoTooltip position="right">
              Total SMAK rewards earned for <br />
              this farm, per day
            </InfoTooltip>
          </p>
          <div class="d-flex align-center justify-end">
            <TokenImage
              class="h-28px z-0 mr-2"
              :src="'https://gateway.pinata.cloud/ipfs/QmQr1YCmCAxdjT7UCXkRofJhYmT2g1NGQHun2fktqi7o62'"
              :alt="tokenMetadataB.symbol"
            />
            <p class="font-semibold text-18px mb-0">
              {{ farm.rewardsPerDay | readableNumber(null, 0) }} SMAK/DAY
            </p>
          </div>
        </div>

        <div class="d-lg-flex flex-column align-end d-none">
          <p class="font-semibold opacity-60 mb-0">APR</p>
          <p class="font-semibold text-18px mb-0">{{ farm.apr | limitNumber(2, 0) }}%</p>
        </div>

        <div
          class="
            d-flex
            flex-lg-column
            align-lg-end align-center
            absolute
            top-4rem
            right-1.25rem
            relative-lg
            top-lg-0
            right-lg-0
          "
        >
          <p class="font-semibold d-flex align-center mb-0 mr-2 mr-lg-0">
            <span class="opacity-60 mr-1">APY</span>
            <InfoTooltip position="left">
              This rate changes in real-time <br />
              depending on how many LP tokens <br />are staked in the farm.
            </InfoTooltip>
          </p>
          <Badge primary600>
            <p class="font-semibold text-18px mb-0 text-info">
              {{ farm.apy | limitNumber(2, 0) }}%
            </p>
          </Badge>
        </div>
      </div>
      <div class="d-flex flex-column-reverse flex-lg-row">
        <div class="d-flex flex-lg-column w-full w-lg-max mr-4 justify-center">
          <a
            :href="farm.contractLink"
            target="_blank"
            rel="noopener noreferrer"
            class="
              bg-secondary-800
              border-secondary-700
              text-primary-700
              font-semibold
              text-14px
              rounded-lg
              whitespace-nowrap
              py-1
              px-5 px-lg-16
              w-full
              mb-lg-1
              mr-2 mr-lg-0
              text-center
              hover:opacity-90
            "
          >
            <span class="mr-2">View contract</span>
            <ExternalIcon />
          </a>
          <a
            :href="farm.pairInfoLink"
            target="_blank"
            rel="noopener noreferrer"
            class="
              bg-secondary-800
              border-secondary-700
              text-primary-700
              font-semibold
              text-14px
              rounded-lg
              whitespace-nowrap
              py-1
              px-5 px-lg-16
              w-full
              text-center
              hover:opacity-90
            "
          >
            <span class="mr-2">See pair info</span>
            <ExternalIcon />
          </a>
        </div>
        <div class="d-flex flex-column flex-lg-row w-full">
          <div class="border-primary-800 h-full d-flex py-2 px-2 align-center rounded-18px w-full mb-4 mb-lg-0 h-max mr-0 mr-lg-4">
            <div class="px-1 px-lg-4">
              <p
                class="
                  d-flex
                  align-center
                  text-primary-1000
                  font-semibold
                  text-13px text-lg-18px
                  mb-0
                  whitespace-nowrap
                "
              >
                <InfoTooltip class="mr-1" position="top-center">
                  Your total SMAK earned in real-time. This <br />
                  amount may go up or down depending <br />
                  on how much SMAK is staked in the farm.
                </InfoTooltip>
                SMAK Earned:
              </p>
              <p class="text-11px text-lg-15px text-primary-3100 mb-0">Next Harvest: {{ nextHarvestRemaining }}</p>
            </div>
            <div class="d-flex flex-column align-end ml-auto mr-4">
              <p class="font-semibold text-18px mb-0">
                {{ farm.earnedForHarvest | dashedNullNumber }}
              </p>
              <p class="text-primary-200 font-semibold text-12px mb-0">
                ${{ farm.earnedForHarvestByUsd | readableNumber(2, 0) }}
              </p>
            </div>
            <button
              v-if="isWalletConnected && (farm.lpStaked || isUserCanHarvest)"
              class="
                text-white
                font-semibold
                h-44px
                w-105px w-lg-132px
                rounded-13px
                d-flex
                align-center
                justify-center
              "
              :class="{
                'bg-primary hover:opacity-90': isUserCanHarvest,
                'bg-primary-900 cursor-not-allowed': !isUserCanHarvest,
              }"
              :disabled="!isUserCanHarvest"
              @click="showFarmHarvestDialog(); setContractsInfo();"
            >
              Harvest
            </button>
            <button
              v-else
              class="
                bg-primary-900
                text-white
                font-semibold
                h-44px
                w-105px w-lg-132px
                rounded-13px
                d-flex
                align-center
                justify-center
                hover:opacity-90
              "
              @click="isWalletConnected ? setContractsInfoStake() : connectWallet();"
            >
              Stake
            </button>
          </div>
          <div
            class="
              border-secondary-1000
              h-full
              d-flex
              flex-column flex-lg-row
              py-2
              px-2
              align-center
              rounded-18px
              w-full
              mb-4 mb-lg-0
            "
          >
            <div class="d-flex align-center w-full mb-2 mb-lg-0">
              <p class="font-semibold text-13px text-lg-17px px-1 px-lg-4 mb-0 whitespace-nowrap">
                LP Staked
              </p>
              <div class="d-flex flex-column align-end ml-auto mr-4">
                <p class="font-semibold text-18px mb-0">{{ farm.lpStaked | dashedNullNumber }}</p>
                <p class="text-primary-200 font-semibold text-12px mb-0">
                  ${{ farm.lpStakedByUsd | readableNumber(2, 0) }}
                </p>
              </div>
            </div>
            <div
              class="
                bg-secondary-900
                font-semibold
                h-44px
                px-2
                py-2
                rounded-13px
                d-flex
                align-center
                w-full w-lg-max
              "
            >
              <button
                class="
                  font-semibold
                  px-6
                  w-full w-lg-60px
                  h-32px h-full
                  rounded-9px
                  d-flex
                  align-center
                  justify-center
                  hover:opacity-90
                "
                :class="{
                  'bg-primary-1200': farm.lpStaked,
                  'bg-secondary-1100 pointer-events-none': !farm.lpStaked,
                }"
                @click="isWalletConnected ? setContractsInfoUnstake() : connectWallet();"
              >
                <img src="@/assets/minus-icon.svg" alt="" />
              </button>
              <div class="border-r-secondary-1200 my-2 mx-2 h-20px"></div>
              <button
                class="
                  bg-primary-1100
                  font-semibold
                  px-6
                  w-full w-lg-60px
                  h-32px h-full
                  rounded-9px
                  d-flex
                  align-center
                  justify-center
                  hover:opacity-90
                "
                @click="isWalletConnected ? setContractsInfoStake() : connectWallet();"
              >
                <img src="@/assets/plus-icon.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card
      :class="{
        'h-60px': !isExpanded,
      }"
      secondary1300
    >
      <div class="d-none d-md-flex align-center cursor-pointer py-4 px-4" @click="toogleLiquidity">
        <p class="font-semibold mb-0">
          To get LP tokens and start farming, you need to add liquidity.
        </p>        <p
          class="
            ml-auto
            font-semibold
            mb-0
            d-flex
            align-center
            whitespace-nowrap
            text-15px
            hover:opacity-90
          "
        >
          <span class="mr-2" @click="setTokens">Add liquidity</span>
          <ArrowDownIcon :class="{ 'transition rotate-180': isExpanded }" />
        </p>
      </div>
      <div class="d-flex d-md-none align-center cursor-pointer py-4 px-4">
        <p
          v-if="!isExpanded"
          class="font-semibold mb-0 whitespace-nowrap text-15px"
        >
          Get LP tokens to start farming
        </p>
        <LiquiditySettings v-else class="relative z-10" top="30px" right="-225px"  />
        <p
          class="
            ml-auto
            font-semibold
            mb-0
            d-flex
            align-center
            whitespace-nowrap
            text-15px
            hover:opacity-90
          "
          @click="isExpanded = !isExpanded; setTokens();"
        >
          <span class="mr-2" >Add liquidity</span>
          <ArrowDownIcon :class="{ 'transition rotate-180': isExpanded }" />
        </p>
      </div>

      <div v-show="isExpanded" class="py-4 px-4">

        <div
          class="
            px-lg-5
            d-flex
            flex flex-column flex-lg-row
            align-center
            relative
            border-lg-secondary-700
            bg-lg-secondary-900
            rounded-15px
          "
        >
          <div v-if="!this.$store.state.dexContracts.areContractsLoaded || !this.$store.state.swap.isLoadable" class="graph-loader">
            <!-- <img class="graph-loader__image" src="@/assets/smak-logo.svg" /> -->
            Please wait ...
          </div>
          <div v-else class="d-flex flex flex-column flex-lg-row align-center relative w-full">
            <div class="flex-grow-1 d-flex flex-column flex-lg-row mr-lg-8 w-full">
              <div
                class="
                  d-flex
                  align-center
                  mr-lg-6
                  cursor-text
                  mb-4 mb-lg-0
                  border-secondary-700
                  bg-secondary-900
                  border-lg-none
                  bg-lg-none
                  px-4
                  py-3
                  rounded-15px
                  w-full
                "
                @click="onClickLiquidityA"
              >
                <TokenImage
                  class="h-40px mr-4"
                  :src="farm.tokenA.metadata.thumbnailUri"
                  :alt="farm.tokenA.metadata.symbol"
                />
                <div class="bg-secondary-1400 rounded-13px py-5px px-4 d-flex align-center w-full">
                  <p
                    class="
                      text-primary-700 text-13px text-lg-19px
                      font-semibold
                      mb-0
                      cursor-pointer
                      hover:opacity-90
                    "
                    @click="maxA"
                  >
                    Max
                  </p>
                  <div class="flex-grow-1 d-flex flex-column align-end">
                    <p class="text-secondary-1500 text-13px text-lg-14px font-semibold mb-0">
                      ${{ tknAusd }}
                    </p>
                    <input
                      
                      ref="liquidityAInput"
                      type="text"
                      class="bg-transparent text-18px text-lg-20px font-semibold w-full text-right"
                      placeholder="0.0"
                      name="amount"
                      v-model="amountTknA"
                      v-on:keypress="isNumber($event)"
                    />
                  </div>
                </div>
              </div>

              <div
                class="
                  d-flex
                  align-center
                  cursor-text
                  mb-4 mb-lg-0
                  border-secondary-700
                  bg-secondary-900
                  border-lg-none
                  bg-lg-none
                  px-4
                  py-3
                  rounded-15px
                  w-full
                "
                @click="onClickLiquidityB"
              >
                <TokenImage
                  class="h-40px mr-4"
                  :src="tokenMetadataB.thumbnailUri"
                  :alt="tokenMetadataB.symbol"
                />
                <div class="bg-secondary-1400 rounded-13px py-5px px-4 d-flex align-center w-full">
                  <p
                    class="
                      text-primary-700 text-13px text-lg-19px
                      font-semibold
                      mb-0
                      cursor-pointer
                      hover:opacity-90
                    "
                    @click="maxB"
                  >
                    Max
                  </p>
                  <div class="flex-grow-1 d-flex flex-column align-end">
                    <p class="text-secondary-1500 text-13px text-lg-14px font-semibold mb-0">
                      ${{ tknBusd }}
                    </p>
                    <input
                      ref="liquidityBInput"
                      type="text"
                      class="bg-transparent text-18px text-lg-20px font-semibold w-full text-right"
                      name="amount2"
                      v-model="amountTknB"
                      placeholder="0.0"
                      v-on:keypress="isNumber($event)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              class="
                text-white
                bg-primary
                font-semibold
                rounded-13px
                h-44px
                w-full w-lg-180px
                flex-shrink-0
                mr-lg-8
                hover:opacity-90
              "
              @click="isWalletConnected ? addLiquidity() : connectWallet()"
            >
              Add Liquidity
            </button>

            <LiquiditySettings
              class="absolute top-10px right-10px d-none d-lg-block z-10"
            />
          </div>
        </div>
      </div>
    </Card>
  </Card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import LiquiditySettings from '@/components/farms/LiquiditySettings.vue'

import Card from '@/components/shared/Card.vue'
import TokenImage from '@/components/shared/TokenImage.vue'
import Badge from '@/components/shared/Badge.vue'
import InfoTooltip from '@/components/shared/InfoTooltip.vue'

import ArrowDownIcon from '@/components/svgs/ArrowDownIcon.vue'
import ExternalIcon from '@/components/svgs/ExternalIcon.vue'
import CalculatorIcon from '@/components/svgs/CalculatorIcon.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { EFarmBadge, IFarm } from '@/interfaces/farm.interface'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { tokenIdentifier } from '../../helpers/token.helper';
import { ITokenMetadata } from '@/interfaces/token.interface'
import { EMPTY_METADATA } from '@/constants/tokens.const'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import { getPoolTokenMetadata } from '@/store/swap'
import { getUserBalanceForToken, tokenAddressToMetadata } from '@/store/dexContracts'

dayjs.extend(relativeTime);

@Component({
  mixins: [numberMixin],
  components: {
    LiquiditySettings,
    Card,
    TokenImage,
    Badge,
    InfoTooltip,
    ArrowDownIcon,
    ExternalIcon,
    CalculatorIcon,
  },
  computed: {
    ...mapState(['theme']),
    ...mapState('wallet', ['isWalletConnected']),
    ...mapState('swap', ['tokenA', 'tokenB']),
    ...mapState('dexContracts', ['swapContracts', 'areContractsLoaded']),
    ...mapGetters('tokens', ['tokensMetadata'])
  },
  methods: {
    ...mapMutations('farms', [
      'showFarmStakeDialog',
      'showFarmUnstakeDialog',
      'showFarmHarvestDialog',
      'showFarmRoiDialog',
      'updateFarmAddress',
      'updateLpAddress'
    ]),
    ...mapActions('wallet', ['connectWallet']),
    ...mapActions('swap', ['updateTokenAddress', 'updateDexAction']),
  },
})
export default class FarmCard extends Vue {
  isWalletConnected!: boolean
  showFarmStakeDialog!: () => void
  showFarmUnstakeDialog!: () => void
  showFarmHarvestDialog!: () => void
  showFarmRoiDialog!: () => void
  updateFarmAddress!: (address: string) => void
  updateLpAddress!: (address: string) => void
  isNumber!: (element: HTMLElement) => boolean
  areContractsLoaded!: boolean
  tokensMetadata!: { [key: string]: ITokenMetadata }

  tokenA!: any
  tokenB!: any
  connectWallet!: () => boolean
  tknAusd = 0
  tknBusd = 0

  @Prop(Object) farm!: IFarm
  @Prop(Boolean) isLiquidityOpen!: boolean

  farmBadge = EFarmBadge
  isExpanded = false

  get nextHarvestRemaining(): string {
    if (!this.farm.earnedForHarvest) return '--'

    const createdDate = this.farm.createdTime
    const weekCount = this.farm.currentWeek

    return '~ ' + dayjs(createdDate).add(weekCount, 'week').fromNow(true)
  }

  get isUserCanHarvest(): boolean {
    return !!this.farm.unclaimedEarnings
  }

  mounted() {
    this.isExpanded = this.isLiquidityOpen
  }

  toogleLiquidity() {
    this.isExpanded = !this.isExpanded

    if(this.isExpanded) this.$emit('liquidity-open')
  }

  closeLiquidity() {
    this.isExpanded = false
  }

  setTokens() {
    // alert()
    // console.log("===============asdfasdfasdf=================asdf",this.$store.state.dexContracts.areContractsLoaded)
  this.$store.dispatch('swap/updateTokenAddress', {
      whichToken: 'tokenA',
      address: 'XTZ',
      tokenId: 0,
    })
    this.$store.dispatch('swap/updateTokenAddress', {
      whichToken: 'tokenB',
      address: this.farm.tokenB.address,
      tokenId: this.farm.tokenB.metadata.tokenId,
    })
  }

  get tokenMetadataB() {
    const identifier = tokenIdentifier({ address: this.farm.tokenB.address, tokenId: this.farm.tokenB.metadata.tokenId })
    return this.tokensMetadata[identifier] || EMPTY_METADATA
  }

  // @Watch('amountTknA')
  // async op() {
  //     await this.$store.dispatch("swap/updateTokenAddress", {whichToken: "tokenB", address: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X', tokenId: 0})
  //   await this.$store.dispatch("swap/updateTokenAddress", {whichToken: "tokenA", address: "XTZ", tokenId: 0})
  // }

  onClickLiquidityA() {
    ;(this.$refs.liquidityAInput as HTMLElement).focus()
  }

  onClickLiquidityB() {
    ;(this.$refs.liquidityBInput as HTMLElement).focus()
  }

  addLiquidity() {
    this.setContractsInfo()
    //this.setTokenB()
    this.$store.commit('swap/updateShowLiquidityInfoDialog', true)
  }
  getTokenMetadata(token: 'tokenA' | 'tokenB'): ITokenMetadata {
    return getPoolTokenMetadata(token, this.$store.state.swap, this.$store.state.dexContracts)
  }
  maxA() {
    this.amountTknA = Math.floor(this.getTokenBalance('tokenA') * 10 ** 6) / (10 ** 6)
  }

  maxB() {
    this.amountTknB = Math.floor(this.getTokenBalance('tokenB') * 10 ** this.getTokenMetadata('tokenB').decimals) / (10 ** this.getTokenMetadata('tokenB').decimals)

  }
getTokenBalance(token: 'tokenA' | 'tokenB'): number {
    const tokenAddress = this.$store.state.swap[token].address
    const tokenId = this.$store.state.swap[token].tokenId
    const metadata = tokenAddressToMetadata(tokenAddress, tokenId, this.$store.state.dexContracts)
    if (tokenAddress) {
      const balance = getUserBalanceForToken(
          tokenAddress,
          tokenId,
          this.$store.state.dexContracts,
          this.$store.state.wallet
        ) * Math.pow(10, -metadata.decimals)
        if (token ===  'tokenA') this.amountTknB = balance
        else this.amountTknB = balance
      return balance
    }
      
    else return 0
  }

  setTokenB(){
    this.$store.dispatch('swap/updateTokenAddress', {
      whichToken: 'tokenB',
      address: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X',
      tokenId: this.farm.tokenB.tokenId,
    })
  }

  // @Watch('amountTknA')
  // @Watch('areContractsLoaded')
  // async test() {
  //   if (this.areContractsLoaded) {
  //     console.log(this.areContractsLoaded)
  //     await this.$store.dispatch('swap/updateDexAction', {dexAction:'liquidity'} )
  //     console.log("here")
  //   }
  // }

  @Watch('amountTknA')
  @Watch('amountTknB')
  tknToUsd() {
    this.tknAusd = this.amountTknA * this.farm.tokenA.metadata.lastUsdPrice
    this.tknBusd = this.amountTknB * this.farm.tokenB.metadata.lastUsdPrice
  }


  get amountTknA(): number {
    return this.$store.state.swap.tokenA.amount
  }

  set amountTknA(amount: number) {
    this.$store.dispatch('swap/updateTokenAmount', {
      whichToken: 'tokenA',
      amount: amount,
    })
  }
  // @Watch('amountTknA')
  // amountTokenA() {
  //   this.amountTknB = this.amountTknA / this.farm.tokenB.metadata.lastXtzPrice
  //   this.$store.dispatch('swap/updateTokenAmount', {
  //     whichToken: 'tokenA',
  //     amount: this.amountTknA,
  //   })
  // }


  get amountTknB(): number {
    return this.$store.state.swap.tokenB.amount
  }

  set amountTknB(amount: number) {
    this.$store.dispatch('swap/updateTokenAmount', {
      whichToken: 'tokenB',
      amount: amount,
    })
  }
  // @Watch('amountTknB')
  // amountTokenB() {    
  //   this.setTokenB()
  //   this.amountTknA =  Math.floor( this.amountTknB * 10**6) / 10 ** 6 * this.farm.tokenB.metadata.lastXtzPrice
  //   this.$store.dispatch('swap/updateTokenAmount', {
  //     whichToken: 'tokenB',
  //     amount: this.amountTknB,
  //   })
  // }

  setContractsInfo() {
    this.updateFarmAddress(this.farm.contractAddress);
    this.updateLpAddress(this.farm.lpAddress);
  }

  setContractsInfoStake() {
    this.showFarmStakeDialog();
    this.updateFarmAddress(this.farm.contractAddress);
    this.updateLpAddress(this.farm.lpAddress);
  }
  setContractsInfoUnstake() {
    this.showFarmUnstakeDialog();
    this.updateFarmAddress(this.farm.contractAddress);
    this.updateLpAddress(this.farm.lpAddress);
  }
}
</script>

<style lang="scss" scoped>
.graph-loader {
  position: absolute;
  top: 0;
  left: 0;
  max-height: 100%;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: flex-end;

  &__image {
    height: 60px;
    animation: pulse 1.2s linear infinite;
  }
}
</style>