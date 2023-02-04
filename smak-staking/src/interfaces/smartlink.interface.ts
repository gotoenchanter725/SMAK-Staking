import { ITokenMetadata } from './token.interface'

export interface ISmartlinkIndexerParams {
  start: number
  end: number
  sort: string
  rate: string
}
export interface ISmakBurned {
  timestamp: number
  balance: number
  burned: number
}

export interface ITimestampValueLocked {
  timestamp: number
  vl_usd: number
  vl_xtz: number
  pct_change: number
}

export interface ITotalValueLocked {
  timestamp: number
  tvl: number
  pct_change: number
  tvl_variation: number
}

export interface IValueLockedParams extends ISmartlinkIndexerParams {}

export interface ISmakStake {
  investor_address: string
  value: number
}

export interface ITotalStaking {
  timestamp: number
  flex: number
  flex_total: number
  lock: number
  lock_total: number
  redeem: number
  redeem_total: number
}

export interface ITotalLiquidity {
  timestamp: number
  usd_total: number
  xtz_qty_add: number
  xtz_qty_remove: number
  xtz_total: number
}

export interface IVolume {
  timestamp: number
  usd_volume: number
  xtz_volume: number
  usd_lp_fees: number
  xtz_lp_fees: number
  usd_treasury: number
  xtz_treasury: number
  usd_buyback: number
  xtz_buyback: number
}
export interface IValueLocked {
  timestamp: number
  vl_usd: number
  vl_xtz: number
  pct_change: number
}

export interface IFeeDistribution {
  timestamp: number
  usd_lp_fees: number
  usd_treasury: number
  usd_buyback: number
}

export interface ILpFeesReceived {
  timestamp: number
  usd_lp_fees: number
}

export interface ITopPoolsByFees {
  pool_address: string
  xtz_pool: number
  token_pool: number
  xtz_volume: number
  usd_volume: number
  ratio_xtz_token: number
  ratio_token_xtz: number
  vl_xtz: number
  vl_usd: number
  usd_token_price: number
  usd_xtz_price: number
  id_1: number
  token_id: number
  decimals: number
  last_price_xtz: number
  last_price_usd: number
  usd_fees: number
  xts_fees: number
  symbol: string
  name: string
  icon: string
  token_address: string
}

export interface IPoolStatistics {
  volume_24h: number
  volume_variation: number
  fees_24h: number
  tvl_24h: number
  tvl_variation: number
}

export interface IPool {
  token_address: string
  pool_address: string
  token_id: number
  symbol: string
  name: string
  decimals: number
  last_price_xtz: number
  last_price_usd: number
  contract_format: number
  icon: string
  pool_address_1: string
  lqt_address: string
  lqt_total_supply: number
  xtz_pool: number
  token_pool: number
  lp_xtz: number
  lp_usd: number
}
export interface ITopPool {
  usd_token_price: number
  ratio_token_xtz: number
  ratio_xtz_token: number
  symbol: string
  name: string
  icon: string
  token_address: string
  pool_address: string
  usd_volume_24h: number
  usd_volume_7d: number
  fees_24h: number
  fees_7d: number
  tvl: number
  roi_1y: number
  token_id: number
  metadata?: ITokenMetadata
}

export interface ITopToken {
  usd_token_price: number
  ratio_token_xtz: number
  ratio_xtz_token: number
  symbol: string
  name: string
  token_id: number
  token_address: string
  pool_address: string
  usd_volume_24h: number
  usd_volume_7d: number
  tvl: number
  pct_token_price_24h: number
}

export interface ITotalVolume {
  timestamp: number
  tvol: number
  usd_fees: number
  usd_lp_fees: number
  usd_treasury: number
  usd_buyback: number
}

export interface ITokenPrice {
  timestamp: number
  usd_token_price: number
  usd_xtz_price: number
  ratio_xtz_token: number
  ratio_token_xtz: number
}

export interface IHolders {
  lp_holder: number
  smak_holder: number
  smak_stake_flex_holder: number
  smak_stake_holder: number
  smak_stake_lock_holder: number
}

export interface IFarm {
  farm_address: string
  farm_smak_claim: number
  farm_usd_claim: number
  creation_time: number
  lp_contract: string
  rate: number
  reserve_address: string
  smak_contract: string
  total_reward_smak: number
  current_week: number
  closing_time: number
  opened: true
  weeks: {
    [key: string]: {
      total_points: number
      total_reward: number
    }
  }
  lp_xtz: number
  lp_usd: number
  tvl_lp: number
  tvl_xtz: number
  tvl_usd: number
}
export interface IAppTotalValueLocked {
  timestamp: number
  staking_tvl: number
  pool_tvl: number
  global_tvl: number
}
