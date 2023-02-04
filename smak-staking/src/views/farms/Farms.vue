<template>
  <DefaultLayout class="mb-14">
    <v-row>
      <v-col cols="12" lg="6">
        <h3 class="font-semibold text-22px">Farms</h3>
        <p class="font-semibold text-16px text-secondary-600 mb-0">
          Stake your Liquidty Pool (LP) tokens to earn
        </p>
      </v-col>
      <v-col cols="12" lg="6" class="d-flex align-end">
        <FarmSearch class="ml-lg-auto w-full w-lg-max" :farmList="farmList"/>
      </v-col>
    </v-row>

    <v-row v-for="(farm, index) in farmList" :key="index">
      <v-col>
        <FarmCard :id="farm.contractAddress" :name="farm.contractAddress" ref="farmCard" :farm="farm" :is-liquidity-open="index === 0" :style="{
          'z-index': farmList.length - index
        }" @liquidity-open="onLiquidityOpen(index)"/>
      </v-col>
    </v-row>

    <FarmStakeDialog />
    <FarmUnstakeDialog  />
    <FarmHarvestDialog />
    <FarmRoiDialog />
    <FarmStakeSmakDialog />
    <SwapLiquidityInfoDialog />
  </DefaultLayout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

import DefaultLayout from '@/layouts/DefaultLayout.vue'

import FarmCard from '@/components/farms/FarmCard.vue'
import FarmSearch from '@/components/farms/FarmSearch.vue'
import FarmStakeDialog from '@/components/farms/FarmStakeDialog.vue'
import FarmUnstakeDialog from '@/components/farms/FarmUnstakeDialog.vue'
import FarmHarvestDialog from '@/components/farms/FarmHarvestDialog.vue'
import FarmRoiDialog from '@/components/farms/FarmRoiDialog.vue'
import FarmStakeSmakDialog from '@/components/farms/FarmStakeSmakDialog.vue'

import { numberMixin } from '@/mixins/number.mixin'
import { TOKEN_METADATA, TOKENS } from '../../constants/tokens.const';
import { IFarm, EFarmBadge } from '@/interfaces/farm.interface';
import { mapActions, mapMutations, mapState } from 'vuex'
import { TezosToolkit } from '@taquito/taquito'
import SwapLiquidityInfoDialog from '@/components/SwapLiquidityInfoDialog.vue'

@Component({
  mixins: [numberMixin],
  components: {
    DefaultLayout,
    FarmCard,
    FarmSearch,
    FarmStakeDialog,
    FarmUnstakeDialog,
    FarmHarvestDialog,
    FarmRoiDialog,
    FarmStakeSmakDialog,
    SwapLiquidityInfoDialog,
  },
  computed: {
    ...mapState('dexContracts', ['areContractsLoaded']),
    ...mapState('wallet', ['tk', 'userAddress']),
    ...mapState('farms', ['farmList', 'tokenMap']),
  },
  methods: {
    ...mapActions({
    query: 'farms/query',
    setTokens: 'farms/setTokens',
    
  }),
  ...mapMutations({
      updateFarms: 'farms/updateFarms'
    })
  }
})
export default class Farms extends Vue {
  tk!: TezosToolkit
  userAddress!: string
  tokenMap!: Map<string,any>
  isLoading!: boolean

  query!: (url: string) => any
  setTokens!: () => Promise<void>
  updateFarms!: (farm:IFarm[]) => void

  onLiquidityOpen(index: number) {
    const farmCards = this.$refs.farmCard as any[]
    this.$store.dispatch('swap/updateTokenAmount', {
      whichToken: 'tokenA',
      amount: 0,
    })

    farmCards.forEach((farmCard: any, farmCardIndex: number) => {
      if (farmCardIndex !== index) farmCard.closeLiquidity()
    })
  }
  

  async beforeMount() {
    let xtzCopy : any = {...TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId]}
    xtzCopy.metadata.lastUsdPrice = (await this.query("https://api.tzkt.io/v1/quotes/last")).usd
    let farmArr = new Array<IFarm>()
    await this.setTokens()
    let pools = this.userAddress ? await this.query(`https://smartlink-indexer-api.deployments.smart-chain.fr/v1/investor/${this.userAddress}/farms`) : []
    let farms: string[] = []
    for (const pool of pools ) {
      farms.push(pool.farm_address)
    }
    let pools2 = await this.query("https://smartlink-indexer-api.deployments.smart-chain.fr/v1/farms")
    
    // remove double farm
    pools2 = pools2.filter((item: any) => item.current_week <= Number(Object.keys(item.weeks).slice(-1)) && !farms.includes(item.farm_address))
  
    // get balances for the farms retrieved by the /farms indexer entrypoint
    const lp_balances = this.userAddress ? await this.query(`https://smartlink-indexer-api.deployments.smart-chain.fr/v1/investor/${this.userAddress}`) : []

    // set the balance
    for (let i = 0; i < pools2.length; i++) {
      for (const lp of lp_balances) {
        if (lp.lqt_address === pools2[i].lp_contract) pools2[i].lp_qty = lp.lp_qty
      }
    }
    pools.push(...(pools2))
    const pairs = await this.query("https://api.tzkt.io/v1/bigmaps/35297/keys")
    let pairObject = new Map()
    for (const el of Object.entries(pairs)) {
      const  [_,  value ] : any = el
        pairObject.set(value.key, value.value.farm_lp_info)
    }
    for (const farm of Object.entries(pools)) {
      const  [_,  value] :any = farm

      let symbol = pairObject.get(value.farm_address)
      symbol = symbol === "Ctez" ? "ctez" : symbol
      
      const rewards: number = value.weeks[value.current_week] ? value.weeks[value.current_week].total_reward / 7 : 0
      value.current_week = Math.max(value.current_week, Number(Object.keys(value.weeks)[0]))
      const y : number = this.tokenMap.get('SMAK') ? this.tokenMap.get('SMAK').metadata.lastXtzPrice * value.weeks[value.current_week].total_reward / value.tvl_xtz: 0

      let apr : number = value.tvl_xtz !== 0 ? 100 * y * 52.1429 : 9999
      let apy : number = value.tvl_xtz !== 0 ? ((1 + apr/(100 * 52.1429)) ** 52.1429 -1) * 100 : 9999


      const showFarm = !( Number(value.current_week) >  Number(Object.keys(value.weeks).slice(-1)) && !value.lp_stake )
      if (showFarm) {

        const smakPriceUsd = this.tokenMap.get('SMAK').metadata.lastUsdPrice
        
        /** Earned - START */
        const totalEarningsSmak = Array(value.current_week - 1).fill(0).reduce((acc, cur, index) => {
          acc += value.weeks[index + 1].points / value.weeks[index + 1].total_points * value.weeks[index + 1].total_reward
          return acc
        }, 0) || 0
        let earned = 0
        for (let i = 1; i <= value.current_week; i++) {
          earned += value.weeks[i].total_reward 
        }
        /** Earned - END */

        /** SMAK Earned - START */
        const unclaimedEarnings = totalEarningsSmak - value.smak_claim
        const earnedForHarvestSmak = unclaimedEarnings + (value.weeks[value.current_week].points / value.weeks[value.current_week].total_points * value.weeks[value.current_week].total_reward)
        const earnedForHarvestByUsd = earnedForHarvestSmak * smakPriceUsd
        /** SMAK Earned - END */

        const temp: IFarm = {
            tokenA: xtzCopy,
            tokenB: this.tokenMap.get(symbol),
            smakPrice: this.tokenMap.get('SMAK').metadata.lastXtzPrice,
            smakPriceUsd: this.tokenMap.get('SMAK').metadata.lastUsdPrice,
            contractAddress: value.farm_address,
            lpAddress: value.lp_contract,
            badge: EFarmBadge.HOT,
            tvl: value.tvl_usd,
            earned: totalEarningsSmak,
            total_earned: earned * this.tokenMap.get('SMAK').metadata.lastUsdPrice,
            rewardsPerDay: rewards,
            apr: apr,
            apy: apy,
            earnedForHarvest: earnedForHarvestSmak,
            earnedForHarvestByUsd: earnedForHarvestByUsd,
            lpStaked: value.lp_stake,
            lpStakedByUsd: value.lp_stake * value.lp_usd,
            lpUsd: this.tokenMap.get(symbol).metadata.lpUsd,
            balance: value.lp_qty,
            contractLink: `https://tzkt.io/${value.farm_address}/operations/`,
            pairInfoLink: `https://tzkt.io/${value.lp_contract}/operations/`,
            weeks: value.weeks,
            currentWeek: value.current_week,
            createdTime: value.creation_time,
            unclaimedEarnings,
          }
        symbol === 'SMAK' ? farmArr.unshift(temp) : farmArr.push(temp)
      }
      else pools.splice(_, 1)
    }
    this.updateFarms(farmArr)
  }
}
</script>

<style lang="scss" scoped></style>